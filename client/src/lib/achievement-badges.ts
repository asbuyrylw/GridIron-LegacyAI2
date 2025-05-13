// Types
export type AchievementCategory = 'performance' | 'training' | 'nutrition' | 'profile' | 'social' | 'recruiting' | 'academic' | 'coach';
export type TierType = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: TierType;
  icon: string;
  progressMax: number;
  pointValue: number;
  coachOnly?: boolean;
  unlockMessage?: string; // For video messages that unlock with achievement
}

// Achievement data
const achievementData: Achievement[] = [
  // Performance Achievements
  {
    id: 'performance-improvement-bronze',
    name: 'Speed Demon I',
    description: 'Improve your 40-yard dash time by 0.1 seconds',
    category: 'performance',
    tier: 'bronze',
    icon: 'Zap',
    progressMax: 1,
    pointValue: 25
  },
  {
    id: 'performance-improvement-silver',
    name: 'Speed Demon II',
    description: 'Improve your 40-yard dash time by 0.2 seconds',
    category: 'performance',
    tier: 'silver',
    icon: 'Zap',
    progressMax: 1,
    pointValue: 50
  },
  {
    id: 'performance-improvement-gold',
    name: 'Speed Demon III',
    description: 'Improve your 40-yard dash time by 0.3 seconds',
    category: 'performance',
    tier: 'gold',
    icon: 'Zap',
    progressMax: 1,
    pointValue: 100
  },
  {
    id: 'performance-improvement-platinum',
    name: 'Speed Demon Elite',
    description: 'Improve your 40-yard dash time by 0.4 seconds or more',
    category: 'performance',
    tier: 'platinum',
    icon: 'Zap',
    progressMax: 1,
    pointValue: 200,
    unlockMessage: 'Congratulations on your incredible speed improvement! Check out this special training video from Coach Legacy.'
  },
  
  // Training Achievements
  {
    id: 'training-streak-bronze',
    name: 'Dedicated Athlete I',
    description: 'Complete 5 training sessions in a row',
    category: 'training',
    tier: 'bronze',
    icon: 'Dumbbell',
    progressMax: 5,
    pointValue: 25
  },
  {
    id: 'training-streak-silver',
    name: 'Dedicated Athlete II',
    description: 'Complete 15 training sessions in a row',
    category: 'training',
    tier: 'silver',
    icon: 'Dumbbell',
    progressMax: 15,
    pointValue: 50
  },
  {
    id: 'training-streak-gold',
    name: 'Dedicated Athlete III',
    description: 'Complete 30 training sessions in a row',
    category: 'training',
    tier: 'gold',
    icon: 'Dumbbell',
    progressMax: 30,
    pointValue: 100
  },
  {
    id: 'training-streak-platinum',
    name: 'Iron Discipline Master',
    description: 'Complete 60 training sessions in a row',
    category: 'training',
    tier: 'platinum',
    icon: 'Dumbbell',
    progressMax: 60,
    pointValue: 200,
    unlockMessage: 'Your dedication to training is remarkable! Access this exclusive workout routine from Coach Legacy.'
  },
  
  // Nutrition Achievements
  {
    id: 'nutrition-tracking-bronze',
    name: 'Nutrition Conscious I',
    description: 'Log your meals for 7 consecutive days',
    category: 'nutrition',
    tier: 'bronze',
    icon: 'Apple',
    progressMax: 7,
    pointValue: 25
  },
  {
    id: 'nutrition-tracking-silver',
    name: 'Nutrition Conscious II',
    description: 'Log your meals for 30 consecutive days',
    category: 'nutrition',
    tier: 'silver',
    icon: 'Apple',
    progressMax: 30,
    pointValue: 50
  },
  {
    id: 'nutrition-tracking-gold',
    name: 'Nutrition Conscious III',
    description: 'Log your meals for 60 consecutive days',
    category: 'nutrition',
    tier: 'gold',
    icon: 'Apple',
    progressMax: 60,
    pointValue: 100
  },
  {
    id: 'nutrition-tracking-platinum',
    name: 'Nutrition Expert',
    description: 'Log your meals for 100 consecutive days',
    category: 'nutrition',
    tier: 'platinum',
    icon: 'Apple',
    progressMax: 100,
    pointValue: 200,
    unlockMessage: 'Your commitment to nutrition has unlocked a special meal planning guide from Coach Legacy.'
  },
  
  // Profile Achievements
  {
    id: 'profile-complete-bronze',
    name: 'Identity Established',
    description: 'Complete your basic profile information',
    category: 'profile',
    tier: 'bronze',
    icon: 'User',
    progressMax: 1,
    pointValue: 25
  },
  {
    id: 'profile-complete-silver',
    name: 'Identity Expanded',
    description: 'Add profile photo and performance metrics',
    category: 'profile',
    tier: 'silver',
    icon: 'User',
    progressMax: 1,
    pointValue: 50
  },
  
  // Social Achievements
  {
    id: 'social-network-bronze',
    name: 'Team Player I',
    description: 'Join your first team',
    category: 'social',
    tier: 'bronze',
    icon: 'Users',
    progressMax: 1,
    pointValue: 25
  },
  {
    id: 'social-network-silver',
    name: 'Team Player II',
    description: 'Attend 5 team events',
    category: 'social',
    tier: 'silver',
    icon: 'Users',
    progressMax: 5,
    pointValue: 50
  },
  
  // Recruiting Achievements
  {
    id: 'recruiting-profile-bronze',
    name: 'Recruitment Ready I',
    description: 'Complete your recruiting profile',
    category: 'recruiting',
    tier: 'bronze',
    icon: 'GraduationCap',
    progressMax: 1,
    pointValue: 25
  },
  {
    id: 'recruiting-profile-silver',
    name: 'Recruitment Ready II',
    description: 'Add highlight video to your profile',
    category: 'recruiting',
    tier: 'silver',
    icon: 'GraduationCap',
    progressMax: 1,
    pointValue: 50
  },
  
  // Academic Achievements
  {
    id: 'academic-progress-bronze',
    name: 'Scholar Athlete I',
    description: 'Log your first academic update',
    category: 'academic',
    tier: 'bronze',
    icon: 'BookOpen',
    progressMax: 1,
    pointValue: 25
  },
  {
    id: 'academic-progress-silver',
    name: 'Scholar Athlete II',
    description: 'Maintain or improve your GPA for a semester',
    category: 'academic',
    tier: 'silver',
    icon: 'BookOpen',
    progressMax: 1,
    pointValue: 50
  }
];

// Helper functions
export function getAllAchievements(): Achievement[] {
  return achievementData;
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return achievementData.filter(achievement => achievement.category === category);
}

export function getAchievementsByTier(tier: TierType): Achievement[] {
  return achievementData.filter(achievement => achievement.tier === tier);
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievementData.find(achievement => achievement.id === id);
}

export function getFilteredAchievements(categoryFilter?: AchievementCategory | null, tierFilter?: TierType | null): Achievement[] {
  return achievementData.filter(achievement => {
    const matchesCategory = !categoryFilter || achievement.category === categoryFilter;
    const matchesTier = !tierFilter || achievement.tier === tierFilter;
    return matchesCategory && matchesTier;
  });
}

export function getTierValue(tier: TierType): number {
  switch(tier) {
    case 'platinum': return 4;
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
    default: return 0;
  }
}

// Add coach-only achievements
const coachAchievements: Achievement[] = [
  {
    id: 'coach-team-management-bronze',
    name: 'Team Builder',
    description: 'Create your first team',
    category: 'coach',
    tier: 'bronze',
    icon: 'Users',
    progressMax: 1,
    pointValue: 25,
    coachOnly: true
  },
  {
    id: 'coach-athlete-development-silver',
    name: 'Player Developer',
    description: 'Have 5 athletes improve a performance metric',
    category: 'coach',
    tier: 'silver',
    icon: 'TrendingUp',
    progressMax: 5,
    pointValue: 50,
    coachOnly: true
  },
  {
    id: 'coach-team-events-gold',
    name: 'Event Organizer',
    description: 'Host 10 team events with at least 80% attendance',
    category: 'coach',
    tier: 'gold',
    icon: 'Calendar',
    progressMax: 10,
    pointValue: 100,
    coachOnly: true
  },
  {
    id: 'coach-team-success-platinum',
    name: 'Championship Leader',
    description: 'Lead your team to a championship or major achievement',
    category: 'coach',
    tier: 'platinum',
    icon: 'Trophy',
    progressMax: 1,
    pointValue: 200,
    coachOnly: true,
    unlockMessage: 'Your leadership has taken your team to new heights! Access exclusive coaching resources and leadership videos.'
  }
];

// Combine all achievements
const allAchievements = [...achievementData, ...coachAchievements];

// Export the achievements array with the name ACHIEVEMENT_BADGES for consistency across components
export const ACHIEVEMENT_BADGES = allAchievements;