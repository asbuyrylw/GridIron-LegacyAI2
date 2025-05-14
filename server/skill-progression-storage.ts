import { MemStorage } from "./storage";
import {
  Skill,
  InsertSkill,
  AthleteSkill,
  InsertAthleteSkill,
  SkillActivityLog,
  InsertSkillActivityLog,
  skillLevelEnum
} from "@shared/schema";

// Get skills with optional filtering
export async function getSkills(
  this: MemStorage,
  filters?: {
    category?: string;
    position?: string;
  }
): Promise<Skill[]> {
  let skills = Array.from(this.skillsMap.values());
  
  // Apply category filter if provided
  if (filters?.category) {
    skills = skills.filter(skill => skill.category === filters.category);
  }
  
  // Apply position filter if provided
  if (filters?.position) {
    skills = skills.filter(skill => {
      // Check if this skill's positionTags array includes the requested position
      const positionTags = skill.positionTags as string[];
      return positionTags.includes(filters.position as string) || positionTags.includes('all');
    });
  }
  
  return skills;
}

// Get a specific skill by ID
export async function getSkillById(
  this: MemStorage,
  id: number
): Promise<Skill | undefined> {
  return this.skillsMap.get(id);
}

// Create a new skill
export async function createSkill(
  this: MemStorage,
  skill: InsertSkill
): Promise<Skill> {
  const id = this.nextSkillId++;
  
  const newSkill: Skill = {
    id,
    ...skill,
    createdAt: new Date()
  };
  
  this.skillsMap.set(id, newSkill);
  return newSkill;
}

// Update an existing skill
export async function updateSkill(
  this: MemStorage,
  id: number,
  updates: Partial<InsertSkill>
): Promise<Skill | undefined> {
  const existingSkill = this.skillsMap.get(id);
  
  if (!existingSkill) {
    return undefined;
  }
  
  const updatedSkill: Skill = {
    ...existingSkill,
    ...updates
  };
  
  this.skillsMap.set(id, updatedSkill);
  return updatedSkill;
}

// Delete a skill
export async function deleteSkill(
  this: MemStorage,
  id: number
): Promise<boolean> {
  // Don't delete if athletes are using this skill
  const athleteSkills = Array.from(this.athleteSkillsMap.values());
  const hasAthleteUsingSkill = athleteSkills.some(as => as.skillId === id);
  
  if (hasAthleteUsingSkill) {
    return false;
  }
  
  return this.skillsMap.delete(id);
}

// Get all skills for a specific athlete
export async function getAthleteSkills(
  this: MemStorage,
  athleteId: number
): Promise<{skill: Skill, progression: AthleteSkill}[]> {
  const athleteSkills = Array.from(this.athleteSkillsMap.values())
    .filter(as => as.athleteId === athleteId);
  
  // Join with skill data
  return Promise.all(athleteSkills.map(async (progression) => {
    const skill = await this.getSkillById(progression.skillId);
    if (!skill) {
      throw new Error(`Skill with ID ${progression.skillId} not found`);
    }
    return { skill, progression };
  }));
}

// Get a specific athlete's skill progression
export async function getAthleteSkill(
  this: MemStorage,
  athleteId: number,
  skillId: number
): Promise<AthleteSkill | undefined> {
  return Array.from(this.athleteSkillsMap.values())
    .find(as => as.athleteId === athleteId && as.skillId === skillId);
}

// Unlock a new skill for an athlete
export async function unlockAthleteSkill(
  this: MemStorage,
  athleteId: number,
  skillId: number
): Promise<AthleteSkill> {
  // Check if the athlete already has this skill
  const existingSkill = await this.getAthleteSkill(athleteId, skillId);
  
  if (existingSkill) {
    return existingSkill;
  }
  
  // Verify the skill exists
  const skill = await this.getSkillById(skillId);
  if (!skill) {
    throw new Error(`Skill with ID ${skillId} not found`);
  }
  
  // Create new athlete skill record
  const id = this.nextAthleteSkillId++;
  
  const newAthleteSkill: AthleteSkill = {
    id,
    athleteId,
    skillId,
    level: "beginner",
    xp: 0,
    currentMilestone: 0,
    nextMilestoneXP: 100, // Default starting XP requirement for first milestone
    lastUpdated: new Date(),
    unlockDate: new Date()
  };
  
  this.athleteSkillsMap.set(id, newAthleteSkill);
  
  // Log the unlock activity
  await this.createSkillActivityLog({
    athleteId,
    skillId,
    activityType: 'unlock',
    xpGained: 0,
    description: `Unlocked new skill: ${skill.name}`
  });
  
  return newAthleteSkill;
}

// Add XP to an athlete's skill and handle level progression
export async function addSkillXP(
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
  // Get the current skill progression
  let athleteSkill = await this.getAthleteSkill(athleteId, skillId);
  
  // If the athlete doesn't have this skill yet, unlock it
  if (!athleteSkill) {
    athleteSkill = await this.unlockAthleteSkill(athleteId, skillId);
  }
  
  // Track if a level up or milestone occurred
  let leveledUp = false;
  let milestonePassed = false;
  
  // Calculate new XP
  const newXP = athleteSkill.xp + xpToAdd;
  
  // Check if this passes a milestone
  if (newXP >= athleteSkill.nextMilestoneXP) {
    milestonePassed = true;
    
    // Get the skill to access milestones
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }
    
    // Access milestone data
    const milestones = skill.milestones as any[];
    const newMilestoneIndex = athleteSkill.currentMilestone + 1;
    
    // Check if we need to level up (every 3 milestones)
    if (newMilestoneIndex > 0 && newMilestoneIndex % 3 === 0) {
      leveledUp = true;
      
      // Determine new level based on milestone index
      const levelMapping = {
        3: "intermediate",
        6: "advanced",
        9: "elite"
      } as const;
      
      const newLevelKey = newMilestoneIndex as keyof typeof levelMapping;
      if (levelMapping[newLevelKey]) {
        athleteSkill.level = levelMapping[newLevelKey];
      }
    }
    
    // Update milestone info
    athleteSkill.currentMilestone = newMilestoneIndex;
    
    // Set next milestone XP requirement (increase by 50% each milestone)
    athleteSkill.nextMilestoneXP = Math.round(athleteSkill.nextMilestoneXP * 1.5);
  }
  
  // Update XP and last updated timestamp
  athleteSkill.xp = newXP;
  athleteSkill.lastUpdated = new Date();
  
  // Save the updated athlete skill
  this.athleteSkillsMap.set(athleteSkill.id, athleteSkill);
  
  // Log the activity
  await this.createSkillActivityLog({
    athleteId,
    skillId,
    activityType,
    xpGained: xpToAdd,
    description
  });
  
  return {
    athleteSkill,
    leveledUp,
    milestonePassed
  };
}

// Get activity logs for an athlete's skill
export async function getSkillActivityLogs(
  this: MemStorage,
  athleteId: number,
  skillId?: number,
  limit: number = 10
): Promise<SkillActivityLog[]> {
  let logs = Array.from(this.skillActivityLogsMap.values())
    .filter(log => log.athleteId === athleteId);
  
  // Filter by skill if provided
  if (skillId !== undefined) {
    logs = logs.filter(log => log.skillId === skillId);
  }
  
  // Sort by most recent first
  logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Apply limit
  return logs.slice(0, limit);
}

// Create a skill activity log
export async function createSkillActivityLog(
  this: MemStorage,
  log: InsertSkillActivityLog
): Promise<SkillActivityLog> {
  const id = this.nextSkillActivityLogId++;
  
  const newLog: SkillActivityLog = {
    id,
    ...log,
    createdAt: new Date()
  };
  
  this.skillActivityLogsMap.set(id, newLog);
  return newLog;
}

// Get summary stats for an athlete's skills
export async function getAthleteSkillSummary(
  this: MemStorage,
  athleteId: number
): Promise<{
  totalSkills: number;
  totalXP: number;
  skillsByLevel: Record<string, number>;
  recentActivity: SkillActivityLog[];
  topSkills: { skill: Skill, progression: AthleteSkill }[];
}> {
  // Get all skill progressions for this athlete
  const athleteSkills = await this.getAthleteSkills(athleteId);
  
  // Calculate skill counts by level
  const skillsByLevel: Record<string, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    elite: 0
  };
  
  let totalXP = 0;
  
  athleteSkills.forEach(({ progression }) => {
    skillsByLevel[progression.level]++;
    totalXP += progression.xp;
  });
  
  // Get recent activity
  const recentActivity = await this.getSkillActivityLogs(athleteId, undefined, 5);
  
  // Get top skills (sorted by XP)
  const topSkills = [...athleteSkills].sort((a, b) => 
    b.progression.xp - a.progression.xp
  ).slice(0, 3);
  
  return {
    totalSkills: athleteSkills.length,
    totalXP,
    skillsByLevel,
    recentActivity,
    topSkills
  };
}

// Seed initial football skills
export async function seedSkills(storage: MemStorage): Promise<void> {
  // Define skill categories based on the positions
  const positionCategories = {
    quarterback: ['Quarterback (QB)'],
    runningBack: ['Running Back (RB)', 'Fullback (FB)'],
    wideReceiver: ['Wide Receiver (WR)', 'Tight End (TE)'],
    offensiveLine: ['Offensive Tackle (OT)', 'Offensive Guard (OG)', 'Center (C)'],
    defensiveLine: ['Defensive End (DE)', 'Defensive Tackle (DT)', 'Nose Tackle (NT)'],
    linebacker: ['Outside Linebacker (OLB)', 'Inside Linebacker (ILB)', 'Middle Linebacker (MLB)'],
    defensiveBack: ['Cornerback (CB)', 'Free Safety (FS)', 'Strong Safety (SS)'],
    specialTeams: ['Kicker (K)', 'Punter (P)', 'Long Snapper (LS)'],
    all: ['all'] // For skills applicable to all positions
  };

  // Athleticism skills (applicable to all positions)
  const athleticismSkills = [
    {
      name: 'Speed & Acceleration',
      description: 'Ability to quickly reach top speed and maintain it through plays.',
      category: 'athleticism',
      icon: 'Zap',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Explosive Start', requirement: 'Improve your 10-yard split time' },
        { name: 'Sprint Efficiency', requirement: 'Complete sprint interval training' },
        { name: 'Speed Endurance', requirement: 'Maintain top speed over longer distances' }
      ],
      exerciseRecommendations: ['Sprint ladders', 'Hill sprints', 'Resistance sprints']
    },
    {
      name: 'Agility & Quickness',
      description: 'The ability to change direction quickly while maintaining balance and control.',
      category: 'athleticism',
      icon: 'Move',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Quick Feet', requirement: 'Complete agility ladder drills' },
        { name: 'Change of Direction', requirement: 'Improve 5-10-5 shuttle time' },
        { name: 'Reactive Agility', requirement: 'Perform reactive cone drills' }
      ],
      exerciseRecommendations: ['5-10-5 shuttle', 'Cone drills', 'Lateral hurdle hops']
    },
    {
      name: 'Strength & Power',
      description: 'Raw physical power and the ability to apply force explosively.',
      category: 'athleticism',
      icon: 'Dumbbell',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Base Strength', requirement: 'Reach key benchmark in squat/bench' },
        { name: 'Explosive Power', requirement: 'Improve vertical jump height' },
        { name: 'Functional Strength', requirement: 'Apply strength in position-specific drills' }
      ],
      exerciseRecommendations: ['Box jumps', 'Power clean', 'Squat variations']
    }
  ];

  // Technique skills for quarterback
  const quarterbackSkills = [
    {
      name: 'Passing Accuracy',
      description: 'Ability to consistently deliver passes to the intended target with precision.',
      category: 'technique',
      icon: 'Target',
      positionTags: positionCategories.quarterback,
      milestones: [
        { name: 'Short Accuracy', requirement: 'Complete accuracy drills at short range' },
        { name: 'Mid-Range Precision', requirement: 'Hit moving targets at 15-25 yards' },
        { name: 'Deep Ball Placement', requirement: 'Place deep throws with touch and accuracy' }
      ],
      exerciseRecommendations: ['Target practice', 'Moving pocket throws', 'Progressive distance drills']
    },
    {
      name: 'Throwing Mechanics',
      description: 'Proper form and technique for efficient passing delivery.',
      category: 'technique',
      icon: 'RotateCcw',
      positionTags: positionCategories.quarterback,
      milestones: [
        { name: 'Grip & Setup', requirement: 'Master ball grip and stance' },
        { name: 'Motion Efficiency', requirement: 'Develop clean throwing motion' },
        { name: 'Off-Platform Throws', requirement: 'Make accurate throws from varied positions' }
      ],
      exerciseRecommendations: ['Mechanics drills', 'Filmed throw analysis', 'Balance throws']
    }
  ];

  // Leadership skills (most important for QBs but applicable to all)
  const leadershipSkills = [
    {
      name: 'Team Communication',
      description: 'Ability to effectively communicate with teammates during practice and games.',
      category: 'leadership',
      icon: 'MessageSquare',
      positionTags: [...positionCategories.quarterback, ...positionCategories.all],
      milestones: [
        { name: 'Clear Signaling', requirement: 'Master pre-snap communications' },
        { name: 'Huddle Command', requirement: 'Effectively communicate in the huddle' },
        { name: 'Situational Adjustments', requirement: 'Make vocal adjustments based on defensive looks' }
      ],
      exerciseRecommendations: ['Communication drills', 'Film review with teammates', 'Practice with crowd noise']
    },
    {
      name: 'Mental Toughness',
      description: 'Ability to perform under pressure and bounce back from adversity.',
      category: 'leadership',
      icon: 'Brain',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Pressure Management', requirement: 'Perform well in pressure situations' },
        { name: 'Adversity Response', requirement: 'Demonstrate resilience after mistakes' },
        { name: 'Consistent Focus', requirement: 'Maintain concentration throughout game' }
      ],
      exerciseRecommendations: ['Visualization', 'Mindfulness practice', 'Pressure situation drills']
    }
  ];

  // Game IQ skills
  const gameIQSkills = [
    {
      name: 'Play Recognition',
      description: 'Ability to quickly identify formations and anticipate plays.',
      category: 'gameIQ',
      icon: 'Eye',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Formation Recognition', requirement: 'Identify common formations quickly' },
        { name: 'Tendency Analysis', requirement: 'Recognize patterns in opponent behavior' },
        { name: 'Pre-snap Reads', requirement: 'Make adjustments based on pre-snap reads' }
      ],
      exerciseRecommendations: ['Film study', 'Formation flashcards', 'Simulation drills']
    },
    {
      name: 'Decision Making',
      description: 'Making quick, accurate decisions during high-pressure situations.',
      category: 'gameIQ',
      icon: 'GitBranch',
      positionTags: positionCategories.all,
      milestones: [
        { name: 'Option Selection', requirement: 'Consistently choose best available option' },
        { name: 'Processing Speed', requirement: 'Reduce decision time in game scenarios' },
        { name: 'Situational Awareness', requirement: 'Make optimal decisions based on game situation' }
      ],
      exerciseRecommendations: ['Decision trees', 'Scenario-based drills', 'Live scrimmage situations']
    }
  ];

  // Combine all skills
  const allSkills = [
    ...athleticismSkills,
    ...quarterbackSkills,
    ...leadershipSkills,
    ...gameIQSkills
  ];

  // Insert skills into storage
  for (const skillData of allSkills) {
    await storage.createSkill(skillData as InsertSkill);
  }

  console.log(`Seeded ${allSkills.length} football skills for skill progression system`);
}

// Add skill methods to storage interface
export function extendMemStorageWithSkillProgression(storage: MemStorage): void {
  // Set up maps
  storage.skillsMap = new Map();
  storage.athleteSkillsMap = new Map();
  storage.skillActivityLogsMap = new Map();
  
  // Set up ID counters
  storage.nextSkillId = 1;
  storage.nextAthleteSkillId = 1;
  storage.nextSkillActivityLogId = 1;
  
  // Add methods to prototype
  storage.getSkills = getSkills;
  storage.getSkillById = getSkillById;
  storage.createSkill = createSkill;
  storage.updateSkill = updateSkill;
  storage.deleteSkill = deleteSkill;
  
  storage.getAthleteSkills = getAthleteSkills;
  storage.getAthleteSkill = getAthleteSkill;
  storage.unlockAthleteSkill = unlockAthleteSkill;
  storage.addSkillXP = addSkillXP;
  
  storage.getSkillActivityLogs = getSkillActivityLogs;
  storage.createSkillActivityLog = createSkillActivityLog;
  storage.getAthleteSkillSummary = getAthleteSkillSummary;
  
  // Seed initial skills
  seedSkills(storage).catch(err => {
    console.error('Error seeding skills:', err);
  });
}