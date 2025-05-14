import { type MemStorage } from "./storage";
import {
  Skill, InsertSkill,
  AthleteSkill, InsertAthleteSkill, SkillLevel,
  SkillActivityLog, InsertSkillActivityLog,
  SkillCategory
} from "@shared/schema";
import { Json } from "drizzle-orm";

/**
 * Extends the MemStorage class with methods for handling skill progression
 */
export function extendMemStorageWithSkillProgression(memStoragePrototype: any) {
  // Initialize the maps and counters if not already existing
  const initFunction = function(this: MemStorage) {
    this.skillsMap = this.skillsMap || new Map<number, Skill>();
    this.athleteSkillsMap = this.athleteSkillsMap || new Map<number, AthleteSkill>();
    this.skillActivityLogsMap = this.skillActivityLogsMap || new Map<number, SkillActivityLog>();
    
    // Initialize IDs
    this.nextSkillId = this.nextSkillId || 1;
    this.nextAthleteSkillId = this.nextAthleteSkillId || 1;
    this.nextSkillActivityLogId = this.nextSkillActivityLogId || 1;
    
    // Auto-initialize with some example skills if no skills exist
    if (this.skillsMap.size === 0) {
      this._initializeDefaultSkills();
    }
  };
  
  // Get all skills with optional filtering
  const getSkills = async function(this: MemStorage, filters?: { category?: string; position?: string }): Promise<Skill[]> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Convert the map to an array
    let skills = Array.from(this.skillsMap.values());
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        skills = skills.filter(skill => skill.category === filters.category);
      }
      
      if (filters.position) {
        // Filter by position tags (which is stored as JSON)
        skills = skills.filter(skill => {
          if (!skill.positionTags) return false;
          
          // Convert the JSON positionTags to an array of strings
          const positionTags = skill.positionTags as string[];
          return positionTags.includes(filters.position!);
        });
      }
    }
    
    // Sort by name
    skills.sort((a, b) => a.name.localeCompare(b.name));
    
    return skills;
  };
  
  // Get a specific skill by ID
  const getSkillById = async function(this: MemStorage, id: number): Promise<Skill | undefined> {
    // Initialize if not already done
    initFunction.call(this);
    
    return this.skillsMap.get(id);
  };
  
  // Create a new skill
  const createSkill = async function(this: MemStorage, skill: InsertSkill): Promise<Skill> {
    // Initialize if not already done
    initFunction.call(this);
    
    const id = this.nextSkillId++;
    const createdAt = new Date();
    
    const newSkill: Skill = {
      id,
      createdAt,
      ...skill,
      // Ensure we have default values for optional properties
      positionTags: skill.positionTags || [] as unknown as Json,
      exerciseRecommendations: skill.exerciseRecommendations || [] as unknown as Json,
    };
    
    this.skillsMap.set(id, newSkill);
    return newSkill;
  };
  
  // Update an existing skill
  const updateSkill = async function(this: MemStorage, id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined> {
    // Initialize if not already done
    initFunction.call(this);
    
    const skill = this.skillsMap.get(id);
    if (!skill) return undefined;
    
    // Update the skill
    const updatedSkill: Skill = {
      ...skill,
      ...updates,
      id // Ensure the ID doesn't change
    };
    
    this.skillsMap.set(id, updatedSkill);
    return updatedSkill;
  };
  
  // Delete a skill (only if no athletes have it)
  const deleteSkill = async function(this: MemStorage, id: number): Promise<boolean> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Check if any athletes have this skill
    const athleteSkills = Array.from(this.athleteSkillsMap.values());
    const athletesWithSkill = athleteSkills.filter(as => as.skillId === id);
    
    if (athletesWithSkill.length > 0) {
      // Cannot delete a skill that athletes have already unlocked
      return false;
    }
    
    // Delete the skill
    return this.skillsMap.delete(id);
  };
  
  // Get all skills for an athlete with their progression
  const getAthleteSkills = async function(this: MemStorage, athleteId: number): Promise<{skill: Skill, progression: AthleteSkill}[]> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Get all athlete skills for this athlete
    const athleteSkills = Array.from(this.athleteSkillsMap.values())
      .filter(as => as.athleteId === athleteId);
    
    // Get the skill details for each athlete skill
    const result = athleteSkills.map(athleteSkill => {
      const skill = this.skillsMap.get(athleteSkill.skillId);
      return {
        skill,
        progression: athleteSkill
      };
    });
    
    // Filter out any entries where the skill might have been deleted
    return result.filter(entry => entry.skill !== undefined);
  };
  
  // Get a specific athlete skill
  const getAthleteSkill = async function(this: MemStorage, athleteId: number, skillId: number): Promise<AthleteSkill | undefined> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Find the athlete skill
    const athleteSkills = Array.from(this.athleteSkillsMap.values());
    return athleteSkills.find(as => as.athleteId === athleteId && as.skillId === skillId);
  };
  
  // Unlock a new skill for an athlete
  const unlockAthleteSkill = async function(this: MemStorage, athleteId: number, skillId: number): Promise<AthleteSkill> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Check if the athlete already has this skill
    const existingSkill = await this.getAthleteSkill(athleteId, skillId);
    if (existingSkill) {
      return existingSkill;
    }
    
    // Get the skill to determine milestone XP requirements
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }
    
    // Parse the milestones from JSON
    const milestones = skill.milestones as { level: string, threshold: number }[];
    const firstMilestone = milestones[0];
    
    // Create a new athlete skill at the beginner level
    const id = this.nextAthleteSkillId++;
    const now = new Date();
    
    const newAthleteSkill: AthleteSkill = {
      id,
      athleteId,
      skillId,
      level: 'beginner' as SkillLevel,
      xp: 0,
      currentMilestone: 0,
      nextMilestoneXP: firstMilestone?.threshold || 100,
      unlockDate: now,
      lastUpdated: now
    };
    
    this.athleteSkillsMap.set(id, newAthleteSkill);
    
    // Create an activity log for unlocking the skill
    await this.createSkillActivityLog({
      athleteId,
      skillId,
      activityType: 'unlock',
      description: `Unlocked ${skill.name}`,
      xpGained: 0,
    });
    
    return newAthleteSkill;
  };
  
  // Add XP to an athlete's skill and check for level ups
  const addSkillXP = async function(
    this: MemStorage, 
    athleteId: number, 
    skillId: number, 
    xpToAdd: number,
    activityType: string,
    description: string
  ): Promise<{
    athleteSkill: AthleteSkill;
    leveledUp: boolean;
    milestonePassed: boolean;
  }> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Check if the athlete has this skill
    let athleteSkill = await this.getAthleteSkill(athleteId, skillId);
    
    // If not, unlock it automatically
    if (!athleteSkill) {
      athleteSkill = await this.unlockAthleteSkill(athleteId, skillId);
    }
    
    // Get the skill to get milestone information
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }
    
    // Get the milestones
    const milestones = skill.milestones as { level: string, threshold: number }[];
    
    // Track if we leveled up or passed a milestone
    let leveledUp = false;
    let milestonePassed = false;
    
    // Calculate new XP
    const oldXP = athleteSkill.xp;
    const newXP = oldXP + xpToAdd;
    
    // Check if we're going to pass the next milestone
    if (newXP >= athleteSkill.nextMilestoneXP) {
      // Find the highest milestone we've passed
      let newMilestoneIndex = athleteSkill.currentMilestone;
      
      for (let i = athleteSkill.currentMilestone + 1; i < milestones.length; i++) {
        if (newXP >= milestones[i].threshold) {
          newMilestoneIndex = i;
        } else {
          break;
        }
      }
      
      // Update the milestone if we passed one
      if (newMilestoneIndex > athleteSkill.currentMilestone) {
        milestonePassed = true;
        
        // Get the old and new levels
        const oldLevel = milestones[athleteSkill.currentMilestone]?.level || 'beginner';
        const newLevel = milestones[newMilestoneIndex]?.level || 'beginner';
        
        // Check if we leveled up
        if (oldLevel !== newLevel) {
          leveledUp = true;
        }
        
        // Update the milestone
        athleteSkill.currentMilestone = newMilestoneIndex;
        athleteSkill.level = newLevel as SkillLevel;
        
        // Set the next milestone XP
        if (newMilestoneIndex < milestones.length - 1) {
          athleteSkill.nextMilestoneXP = milestones[newMilestoneIndex + 1].threshold;
        } else {
          // If we've reached the maximum milestone, set a very high threshold
          athleteSkill.nextMilestoneXP = Number.MAX_SAFE_INTEGER;
        }
      }
    }
    
    // Update the athlete skill
    athleteSkill.xp = newXP;
    athleteSkill.lastUpdated = new Date();
    
    // Save the updated athlete skill
    this.athleteSkillsMap.set(athleteSkill.id, athleteSkill);
    
    // Log the activity
    await this.createSkillActivityLog({
      athleteId,
      skillId,
      activityType,
      description,
      xpGained: xpToAdd,
    });
    
    return {
      athleteSkill,
      leveledUp,
      milestonePassed
    };
  };
  
  // Get activity logs for an athlete's skills
  const getSkillActivityLogs = async function(
    this: MemStorage,
    athleteId: number,
    skillId?: number,
    limit?: number
  ): Promise<SkillActivityLog[]> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Get all activity logs for this athlete
    let logs = Array.from(this.skillActivityLogsMap.values())
      .filter(log => log.athleteId === athleteId);
    
    // Filter by skill if provided
    if (skillId !== undefined) {
      logs = logs.filter(log => log.skillId === skillId);
    }
    
    // Sort by creation date, newest first
    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply limit if provided
    if (limit !== undefined) {
      logs = logs.slice(0, limit);
    }
    
    return logs;
  };
  
  // Create a new activity log
  const createSkillActivityLog = async function(this: MemStorage, log: InsertSkillActivityLog): Promise<SkillActivityLog> {
    // Initialize if not already done
    initFunction.call(this);
    
    const id = this.nextSkillActivityLogId++;
    const createdAt = new Date();
    
    const newLog: SkillActivityLog = {
      id,
      createdAt,
      ...log
    };
    
    this.skillActivityLogsMap.set(id, newLog);
    return newLog;
  };
  
  // Get a summary of an athlete's skill progression
  const getAthleteSkillSummary = async function(this: MemStorage, athleteId: number): Promise<{
    totalSkills: number;
    totalXP: number;
    skillsByLevel: Record<string, number>;
    recentActivity: SkillActivityLog[];
    topSkills: { skill: Skill, progression: AthleteSkill }[];
  }> {
    // Initialize if not already done
    initFunction.call(this);
    
    // Get all of the athlete's skills
    const athleteSkills = await this.getAthleteSkills(athleteId);
    
    // Calculate total skills and XP
    const totalSkills = athleteSkills.length;
    const totalXP = athleteSkills.reduce((total, { progression }) => total + progression.xp, 0);
    
    // Count skills by level
    const skillsByLevel: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      elite: 0
    };
    
    for (const { progression } of athleteSkills) {
      skillsByLevel[progression.level] = (skillsByLevel[progression.level] || 0) + 1;
    }
    
    // Get recent activity
    const recentActivity = await this.getSkillActivityLogs(athleteId, undefined, 5);
    
    // Get top skills by XP
    const topSkills = [...athleteSkills]
      .sort((a, b) => b.progression.xp - a.progression.xp)
      .slice(0, 3);
    
    return {
      totalSkills,
      totalXP,
      skillsByLevel,
      recentActivity,
      topSkills
    };
  };
  
  // Create some default skills for testing/demo purposes
  const _initializeDefaultSkills = async function(this: MemStorage) {
    // Define the milestone structure used by all skills
    const defaultMilestones = [
      { level: "beginner", threshold: 0 },
      { level: "intermediate", threshold: 500 },
      { level: "advanced", threshold: 1500 },
      { level: "elite", threshold: 3000 }
    ];
    
    // Create Athleticism skills
    await this.createSkill({
      name: "Speed & Acceleration",
      description: "The ability to move quickly from a standstill position and maintain speed.",
      category: "athleticism" as SkillCategory,
      icon: "running",
      positionTags: ["Quarterback (QB)", "Running Back (RB)", "Wide Receiver (WR)", "Cornerback (CB)", "Safety (S)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Shuttle Runs", sets: 5, reps: "20 yards" },
        { id: 2, name: "Box Jumps", sets: 3, reps: 10 },
        { id: 3, name: "Hill Sprints", sets: 6, reps: "30 seconds" }
      ] as unknown as Json
    });
    
    await this.createSkill({
      name: "Agility & Change of Direction",
      description: "The ability to quickly change directions while maintaining balance and speed.",
      category: "athleticism" as SkillCategory,
      icon: "shuffle",
      positionTags: ["Quarterback (QB)", "Running Back (RB)", "Wide Receiver (WR)", "Tight End (TE)", "Cornerback (CB)", "Safety (S)", "Linebacker (LB)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Cone Drills", sets: 5, reps: "Complete course" },
        { id: 2, name: "Ladder Drills", sets: 3, reps: "30 seconds" },
        { id: 3, name: "5-10-5 Shuttle", sets: 5, reps: "Complete drill" }
      ] as unknown as Json
    });
    
    await this.createSkill({
      name: "Power & Explosiveness",
      description: "The ability to generate maximum force in minimal time.",
      category: "athleticism" as SkillCategory,
      icon: "zap",
      positionTags: ["Offensive Line (OL)", "Defensive Line (DL)", "Linebacker (LB)", "Running Back (RB)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Power Cleans", sets: 5, reps: 5 },
        { id: 2, name: "Plyometric Push-ups", sets: 3, reps: 10 },
        { id: 3, name: "Medicine Ball Throws", sets: 4, reps: 8 }
      ] as unknown as Json
    });
    
    // Create Technique skills
    await this.createSkill({
      name: "Throwing Mechanics",
      description: "Proper mechanics for throwing with accuracy and power.",
      category: "technique" as SkillCategory,
      icon: "target",
      positionTags: ["Quarterback (QB)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Progressive Accuracy Drill", sets: 5, reps: "10 throws" },
        { id: 2, name: "Off-Platform Throwing", sets: 3, reps: "8 throws each side" },
        { id: 3, name: "Pocket Movement Drill", sets: 4, reps: "Complete drill" }
      ] as unknown as Json
    });
    
    await this.createSkill({
      name: "Route Running",
      description: "The ability to run precise routes with proper timing and footwork.",
      category: "technique" as SkillCategory,
      icon: "route",
      positionTags: ["Wide Receiver (WR)", "Tight End (TE)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Route Tree Drill", sets: 1, reps: "Complete route tree" },
        { id: 2, name: "Release Techniques", sets: 4, reps: "5 reps per technique" },
        { id: 3, name: "Timing Patterns", sets: 3, reps: "With quarterback" }
      ] as unknown as Json
    });
    
    // Create Game IQ skills
    await this.createSkill({
      name: "Play Recognition",
      description: "The ability to quickly identify offensive or defensive plays before or after the snap.",
      category: "gameIQ" as SkillCategory,
      icon: "brain",
      positionTags: ["Linebacker (LB)", "Safety (S)", "Cornerback (CB)", "Quarterback (QB)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Film Study", sets: 1, reps: "30 minutes" },
        { id: 2, name: "Play Recognition Exercise", sets: 5, reps: "10 plays" },
        { id: 3, name: "Reaction Drill", sets: 3, reps: "2 minutes" }
      ] as unknown as Json
    });
    
    await this.createSkill({
      name: "Field Vision",
      description: "The ability to scan the field and make quick, accurate decisions.",
      category: "gameIQ" as SkillCategory,
      icon: "eye",
      positionTags: ["Quarterback (QB)", "Running Back (RB)", "Safety (S)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Read Progression Drill", sets: 4, reps: "5 plays" },
        { id: 2, name: "Zone Recognition", sets: 3, reps: "10 minutes" },
        { id: 3, name: "Vision Cone Exercise", sets: 5, reps: "Complete drill" }
      ] as unknown as Json
    });
    
    // Create Leadership skills
    await this.createSkill({
      name: "Team Communication",
      description: "The ability to effectively communicate with teammates on and off the field.",
      category: "leadership" as SkillCategory,
      icon: "message-circle",
      positionTags: ["Quarterback (QB)", "Center (C)", "Middle Linebacker (MLB)", "Safety (S)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Play Call Drill", sets: 3, reps: "5 minutes" },
        { id: 2, name: "Adjustment Exercise", sets: 4, reps: "Various scenarios" },
        { id: 3, name: "Team Meeting Leadership", sets: 1, reps: "Lead one session" }
      ] as unknown as Json
    });
    
    // Create Position-Specific skills
    await this.createSkill({
      name: "Pass Blocking",
      description: "Techniques for effectively blocking pass rushers.",
      category: "positionSpecific" as SkillCategory,
      icon: "shield",
      positionTags: ["Offensive Line (OL)", "Tight End (TE)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Kick-Slide Drill", sets: 5, reps: "30 seconds" },
        { id: 2, name: "Hand Placement Exercise", sets: 4, reps: "10 reps" },
        { id: 3, name: "Pass Rush Recognition", sets: 3, reps: "Various looks" }
      ] as unknown as Json
    });
    
    await this.createSkill({
      name: "Man Coverage",
      description: "Techniques for covering receivers in man-to-man coverage.",
      category: "positionSpecific" as SkillCategory,
      icon: "user",
      positionTags: ["Cornerback (CB)", "Safety (S)", "Linebacker (LB)"] as unknown as Json,
      milestones: defaultMilestones as unknown as Json,
      exerciseRecommendations: [
        { id: 1, name: "Mirror Drill", sets: 5, reps: "1 minute" },
        { id: 2, name: "Hip Flip Technique", sets: 4, reps: "10 each direction" },
        { id: 3, name: "Press Coverage Drill", sets: 3, reps: "8 reps" }
      ] as unknown as Json
    });
  };
  
  // Add all the methods to the prototype
  memStoragePrototype.skillsMap = new Map<number, Skill>();
  memStoragePrototype.athleteSkillsMap = new Map<number, AthleteSkill>();
  memStoragePrototype.skillActivityLogsMap = new Map<number, SkillActivityLog>();
  
  memStoragePrototype.nextSkillId = 1;
  memStoragePrototype.nextAthleteSkillId = 1;
  memStoragePrototype.nextSkillActivityLogId = 1;
  
  // Assign the methods to the prototype
  memStoragePrototype.getSkills = getSkills;
  memStoragePrototype.getSkillById = getSkillById;
  memStoragePrototype.createSkill = createSkill;
  memStoragePrototype.updateSkill = updateSkill;
  memStoragePrototype.deleteSkill = deleteSkill;
  
  memStoragePrototype.getAthleteSkills = getAthleteSkills;
  memStoragePrototype.getAthleteSkill = getAthleteSkill;
  memStoragePrototype.unlockAthleteSkill = unlockAthleteSkill;
  memStoragePrototype.addSkillXP = addSkillXP;
  
  memStoragePrototype.getSkillActivityLogs = getSkillActivityLogs;
  memStoragePrototype.createSkillActivityLog = createSkillActivityLog;
  memStoragePrototype.getAthleteSkillSummary = getAthleteSkillSummary;
  
  // Initialize method (with default skills)
  memStoragePrototype._initializeDefaultSkills = _initializeDefaultSkills;
}