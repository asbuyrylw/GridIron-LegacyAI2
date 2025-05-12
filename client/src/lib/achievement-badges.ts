/**
 * Achievement badges system for GridIron LegacyAI
 * 
 * This file defines all achievement badges available in the application.
 * Each badge has a unique ID, name, description, type, and reward points.
 * Badges are grouped by type and can have different tiers (bronze, silver, gold, platinum).
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'training' | 'nutrition' | 'profile' | 'social' | 'recruiting' | 'academic';
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  progressMax: number;
  pointsReward: number;
  unlockRequirement?: string;
  videoUnlock?: boolean;
  coachOnly?: boolean;
}

// Performance Achievements
const performanceAchievements: Achievement[] = [
  {
    id: 'perf-first-metrics',
    name: 'First Steps',
    description: 'Record your first set of performance metrics',
    type: 'performance',
    icon: 'Ruler',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'perf-speed-improvement',
    name: 'Speed Demon',
    description: 'Improve your 40-yard dash time by at least 0.3 seconds',
    type: 'performance',
    icon: 'Wind',
    tier: 'silver',
    progressMax: 100,
    pointsReward: 25
  },
  {
    id: 'perf-strength-milestone',
    name: 'Raw Power',
    description: 'Reach a benchmark strength level for your position',
    type: 'performance',
    icon: 'Dumbbell',
    tier: 'gold',
    progressMax: 100,
    pointsReward: 50
  },
  {
    id: 'perf-all-metrics',
    name: 'Complete Athlete',
    description: 'Record metrics in all performance categories',
    type: 'performance',
    icon: 'Award',
    tier: 'platinum',
    progressMax: 8,
    pointsReward: 100,
    videoUnlock: true
  }
];

// Training Achievements
const trainingAchievements: Achievement[] = [
  {
    id: 'train-first-plan',
    name: 'Training Begins',
    description: 'Create your first training plan',
    type: 'training',
    icon: 'ClipboardList',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'train-streak-week',
    name: 'Consistent Effort',
    description: 'Complete training plans for 7 consecutive days',
    type: 'training',
    icon: 'CalendarCheck',
    tier: 'silver',
    progressMax: 7,
    pointsReward: 25
  },
  {
    id: 'train-position-mastery',
    name: 'Position Mastery',
    description: 'Complete 15 position-specific drills',
    type: 'training',
    icon: 'Target',
    tier: 'gold',
    progressMax: 15,
    pointsReward: 50
  },
  {
    id: 'train-comprehensive',
    name: 'Elite Training Regimen',
    description: 'Balance strength, speed, agility, and position drills in your training',
    type: 'training',
    icon: 'Trophy',
    tier: 'platinum',
    progressMax: 30,
    pointsReward: 100
  }
];

// Nutrition Achievements
const nutritionAchievements: Achievement[] = [
  {
    id: 'nutri-plan-setup',
    name: 'Fuel Up',
    description: 'Set up your first nutrition plan',
    type: 'nutrition',
    icon: 'Apple',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'nutri-hydration',
    name: 'Hydration Hero',
    description: 'Track your water intake for 14 days',
    type: 'nutrition',
    icon: 'Droplets',
    tier: 'silver',
    progressMax: 14,
    pointsReward: 25
  },
  {
    id: 'nutri-meal-prep',
    name: 'Meal Prep Master',
    description: 'Log pre-game meals for an entire season',
    type: 'nutrition',
    icon: 'UtensilsCrossed',
    tier: 'gold',
    progressMax: 10,
    pointsReward: 50
  },
  {
    id: 'nutri-perfect-week',
    name: 'Nutritional Excellence',
    description: 'Follow your nutrition plan perfectly for 4 weeks',
    type: 'nutrition',
    icon: 'Star',
    tier: 'platinum',
    progressMax: 28,
    pointsReward: 100
  }
];

// Profile Achievements
const profileAchievements: Achievement[] = [
  {
    id: 'profile-setup',
    name: 'Identity Established',
    description: 'Complete your basic profile information',
    type: 'profile',
    icon: 'UserCircle',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'profile-highlight',
    name: 'Highlight Reel',
    description: 'Upload your first game highlights',
    type: 'profile',
    icon: 'Film',
    tier: 'silver',
    progressMax: 1,
    pointsReward: 25
  },
  {
    id: 'profile-complete',
    name: 'Complete Profile',
    description: 'Fill out all sections of your athlete profile',
    type: 'profile',
    icon: 'CheckCircle',
    tier: 'gold',
    progressMax: 8,
    pointsReward: 50
  },
  {
    id: 'profile-verified',
    name: 'Verified Athlete',
    description: 'Get your profile verified by a coach',
    type: 'profile',
    icon: 'BadgeCheck',
    tier: 'platinum',
    progressMax: 1,
    pointsReward: 100,
    videoUnlock: true
  }
];

// Social Achievements
const socialAchievements: Achievement[] = [
  {
    id: 'social-first-post',
    name: 'First Post',
    description: 'Share your first update with teammates',
    type: 'social',
    icon: 'MessageCircle',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'social-team-join',
    name: 'Team Player',
    description: 'Join your first team on the platform',
    type: 'social',
    icon: 'Users',
    tier: 'silver',
    progressMax: 1,
    pointsReward: 25
  },
  {
    id: 'social-engagement',
    name: 'Community Leader',
    description: 'Engage with 50 posts from teammates',
    type: 'social',
    icon: 'Heart',
    tier: 'gold',
    progressMax: 50,
    pointsReward: 50
  },
  {
    id: 'social-mvp',
    name: 'Social MVP',
    description: 'Earn recognition as a team leader in social engagement',
    type: 'social',
    icon: 'Crown',
    tier: 'platinum',
    progressMax: 1,
    pointsReward: 100
  }
];

// Recruiting Achievements
const recruitingAchievements: Achievement[] = [
  {
    id: 'recruit-profile-views',
    name: 'On the Radar',
    description: 'Reach 25 profile views',
    type: 'recruiting',
    icon: 'Eye',
    tier: 'bronze',
    progressMax: 25,
    pointsReward: 10
  },
  {
    id: 'recruit-first-interest',
    name: 'First Interest',
    description: 'Receive your first expression of interest from a college',
    type: 'recruiting',
    icon: 'ThumbsUp',
    tier: 'silver',
    progressMax: 1,
    pointsReward: 25
  },
  {
    id: 'recruit-five-colleges',
    name: 'Options Open',
    description: 'Save 5 potential colleges to your list',
    type: 'recruiting',
    icon: 'Bookmark',
    tier: 'gold',
    progressMax: 5,
    pointsReward: 50
  },
  {
    id: 'recruit-offer',
    name: 'Scholarship Offer',
    description: 'Receive your first scholarship offer',
    type: 'recruiting',
    icon: 'GraduationCap',
    tier: 'platinum',
    progressMax: 1,
    pointsReward: 100,
    videoUnlock: true
  }
];

// Academic Achievements
const academicAchievements: Achievement[] = [
  {
    id: 'academic-setup',
    name: 'Academic Tracking',
    description: 'Start tracking your academic progress',
    type: 'academic',
    icon: 'BookOpen',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 10
  },
  {
    id: 'academic-gpa',
    name: 'Scholar Athlete',
    description: 'Maintain a GPA of 3.0 or higher for a semester',
    type: 'academic',
    icon: 'PenTool',
    tier: 'silver',
    progressMax: 1,
    pointsReward: 25
  },
  {
    id: 'academic-exam',
    name: 'Test Ready',
    description: 'Record your SAT/ACT scores',
    type: 'academic',
    icon: 'FileText',
    tier: 'gold',
    progressMax: 1,
    pointsReward: 50
  },
  {
    id: 'academic-honor-roll',
    name: 'Honor Roll',
    description: 'Make the honor roll for two consecutive semesters',
    type: 'academic',
    icon: 'Award',
    tier: 'platinum',
    progressMax: 2,
    pointsReward: 100
  }
];

// Coach Exclusive Achievements
const coachAchievements: Achievement[] = [
  {
    id: 'coach-first-team',
    name: 'Team Builder',
    description: 'Create your first team on the platform',
    type: 'profile',
    icon: 'UsersPlus',
    tier: 'bronze',
    progressMax: 1,
    pointsReward: 25,
    coachOnly: true
  },
  {
    id: 'coach-athlete-development',
    name: 'Player Developer',
    description: 'Help 5 athletes improve their performance metrics',
    type: 'training',
    icon: 'TrendingUp',
    tier: 'gold',
    progressMax: 5,
    pointsReward: 75,
    coachOnly: true
  }
];

// Combine all achievement badges into a single array
export const ACHIEVEMENT_BADGES: Achievement[] = [
  ...performanceAchievements,
  ...trainingAchievements,
  ...nutritionAchievements,
  ...profileAchievements,
  ...socialAchievements,
  ...recruitingAchievements,
  ...academicAchievements,
  ...coachAchievements
];

// Helper functions to retrieve achievements

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_BADGES.find(achievement => achievement.id === id);
}

export function getAchievementsByType(type: Achievement['type']): Achievement[] {
  return ACHIEVEMENT_BADGES.filter(achievement => achievement.type === type);
}

export function getAchievementsByTier(tier: Achievement['tier']): Achievement[] {
  return ACHIEVEMENT_BADGES.filter(achievement => achievement.tier === tier);
}

export function getTotalPossiblePoints(): number {
  return ACHIEVEMENT_BADGES.reduce((sum, achievement) => sum + achievement.pointsReward, 0);
}