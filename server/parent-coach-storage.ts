import { MemStorage } from './storage';
import { 
  Parent, InsertParent, Coach, InsertCoach, 
  ParentAthleteRelationship, InsertParentAthleteRelationship,
  ParentRegistration, CoachRegistration 
} from '@shared/schema';

// Parent-related methods for MemStorage
export async function getParent(this: MemStorage, id: number): Promise<Parent | undefined> {
  return this.parentsMap.get(id);
}

export async function getParentByUserId(this: MemStorage, userId: number): Promise<Parent | undefined> {
  for (const parent of this.parentsMap.values()) {
    if (parent.userId === userId) {
      return parent;
    }
  }
  return undefined;
}

export async function createParent(this: MemStorage, parent: InsertParent): Promise<Parent> {
  const id = ++this.currentParentId;
  const createdAt = new Date();
  
  const newParent: Parent = {
    id,
    ...parent,
    createdAt
  };
  
  this.parentsMap.set(id, newParent);
  return newParent;
}

export async function updateParent(this: MemStorage, id: number, parent: Partial<InsertParent>): Promise<Parent | undefined> {
  const existingParent = await this.getParent(id);
  
  if (!existingParent) {
    return undefined;
  }
  
  const updatedParent = {
    ...existingParent,
    ...parent
  };
  
  this.parentsMap.set(id, updatedParent);
  return updatedParent;
}

export async function getAllParents(this: MemStorage): Promise<Parent[]> {
  return Array.from(this.parentsMap.values());
}

export async function deleteParent(this: MemStorage, id: number): Promise<void> {
  // First, delete all parent-athlete relationships associated with this parent
  const relationships = await this.getParentAthleteRelationshipsByParentId(id);
  for (const relationship of relationships) {
    await this.deleteParentAthleteRelationship(relationship.id);
  }
  
  // Then delete the parent
  this.parentsMap.delete(id);
}

// Parent-Athlete Relationship methods
export async function getParentAthleteRelationship(this: MemStorage, id: number): Promise<ParentAthleteRelationship | undefined> {
  return this.parentAthleteRelationshipsMap.get(id);
}

export async function getParentAthleteRelationshipsByParentId(this: MemStorage, parentId: number): Promise<ParentAthleteRelationship[]> {
  const relationships: ParentAthleteRelationship[] = [];
  
  for (const relationship of this.parentAthleteRelationshipsMap.values()) {
    if (relationship.parentId === parentId) {
      relationships.push(relationship);
    }
  }
  
  return relationships;
}

export async function getParentAthleteRelationshipsByAthleteId(this: MemStorage, athleteId: number): Promise<ParentAthleteRelationship[]> {
  const relationships: ParentAthleteRelationship[] = [];
  
  for (const relationship of this.parentAthleteRelationshipsMap.values()) {
    if (relationship.athleteId === athleteId) {
      relationships.push(relationship);
    }
  }
  
  return relationships;
}

// Alias for backward compatibility
export async function getParentAthleteRelationships(this: MemStorage, parentId: number): Promise<ParentAthleteRelationship[]> {
  return this.getParentAthleteRelationshipsByParentId(parentId);
}

export async function getAthleteParents(this: MemStorage, athleteId: number): Promise<(Parent & { relationship: string })[]> {
  const parentRelationships: (Parent & { relationship: string })[] = [];
  
  for (const relationship of this.parentAthleteRelationshipsMap.values()) {
    if (relationship.athleteId === athleteId) {
      const parent = await this.getParent(relationship.parentId);
      if (parent) {
        parentRelationships.push({
          ...parent,
          relationship: relationship.relationship
        });
      }
    }
  }
  
  return parentRelationships;
}

export async function createParentAthleteRelationship(this: MemStorage, relationship: InsertParentAthleteRelationship): Promise<ParentAthleteRelationship> {
  const id = ++this.currentParentAthleteRelationshipId;
  const createdAt = new Date();
  
  const newRelationship: ParentAthleteRelationship = {
    id,
    ...relationship,
    createdAt
  };
  
  this.parentAthleteRelationshipsMap.set(id, newRelationship);
  return newRelationship;
}

export async function updateParentAthleteRelationship(this: MemStorage, id: number, relationship: Partial<InsertParentAthleteRelationship>): Promise<ParentAthleteRelationship | undefined> {
  const existingRelationship = await this.getParentAthleteRelationship(id);
  
  if (!existingRelationship) {
    return undefined;
  }
  
  const updatedRelationship = {
    ...existingRelationship,
    ...relationship
  };
  
  this.parentAthleteRelationshipsMap.set(id, updatedRelationship);
  return updatedRelationship;
}

export async function deleteParentAthleteRelationship(this: MemStorage, id: number): Promise<void> {
  this.parentAthleteRelationshipsMap.delete(id);
}

// Coach-related methods
export async function getCoach(this: MemStorage, id: number): Promise<Coach | undefined> {
  return this.coachesMap.get(id);
}

export async function getCoachByUserId(this: MemStorage, userId: number): Promise<Coach | undefined> {
  for (const coach of this.coachesMap.values()) {
    if (coach.userId === userId) {
      return coach;
    }
  }
  return undefined;
}

export async function createCoach(this: MemStorage, coach: InsertCoach): Promise<Coach> {
  const id = ++this.currentCoachId;
  const createdAt = new Date();
  
  const newCoach: Coach = {
    id,
    ...coach,
    createdAt
  };
  
  this.coachesMap.set(id, newCoach);
  return newCoach;
}

export async function updateCoach(this: MemStorage, id: number, coach: Partial<InsertCoach>): Promise<Coach | undefined> {
  const existingCoach = await this.getCoach(id);
  
  if (!existingCoach) {
    return undefined;
  }
  
  const updatedCoach = {
    ...existingCoach,
    ...coach
  };
  
  this.coachesMap.set(id, updatedCoach);
  return updatedCoach;
}

export async function getCoachesByTeam(this: MemStorage, teamId: number): Promise<Coach[]> {
  const coaches: Coach[] = [];
  
  // Get all team members with role 'coach' or 'assistant_coach'
  for (const teamMember of this.teamMembersMap.values()) {
    if (teamMember.teamId === teamId && (teamMember.role === 'coach' || teamMember.role === 'assistant_coach')) {
      const user = await this.getUser(teamMember.userId);
      if (user && user.userType === 'coach') {
        const coach = await this.getCoachByUserId(user.id);
        if (coach) {
          coaches.push(coach);
        }
      }
    }
  }
  
  return coaches;
}

export async function getAllCoaches(this: MemStorage): Promise<Coach[]> {
  return Array.from(this.coachesMap.values());
}

export async function deleteCoach(this: MemStorage, id: number): Promise<void> {
  // First update any team relationships - set coach to inactive or reassign
  // For simplicity in memory storage, we'll just delete the coach
  this.coachesMap.delete(id);
}