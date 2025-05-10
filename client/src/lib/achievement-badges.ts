// Define achievement badge types
export type AchievementType = 
  | 'performance'  // Performance-related achievements (athletic metrics)
  | 'training'     // Training-related achievements (completed workouts)
  | 'nutrition'    // Nutrition-related achievements (tracking meals)
  | 'profile'      // Profile-related achievements (completing profile sections)
  | 'social'       // Social achievements (connections, team activities)
  | 'recruiting'   // Recruiting achievements (college interest, camps)
  | 'academic';    // Academic achievements (GPA, test scores)

export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  level: AchievementLevel;
  icon: string;
  requirements: {
    description: string;
    threshold?: number; // Optional numerical threshold for achievement
    targetValue?: string; // Optional target value for achievement
  }[];
  points: number;
}

export const ACHIEVEMENT_BADGES: Achievement[] = [
  // Performance Achievements
  {
    id: 'speed_demon_bronze',
    name: 'Speed Demon (Bronze)',
    description: 'Run a 40-yard dash in 5.0 seconds or less',
    type: 'performance',
    level: 'bronze',
    icon: '🏃',
    requirements: [{ description: '40-yard dash time ≤ 5.0 seconds', threshold: 5.0 }],
    points: 50
  },
  {
    id: 'speed_demon_silver',
    name: 'Speed Demon (Silver)',
    description: 'Run a 40-yard dash in 4.8 seconds or less',
    type: 'performance',
    level: 'silver',
    icon: '🏃',
    requirements: [{ description: '40-yard dash time ≤ 4.8 seconds', threshold: 4.8 }],
    points: 100
  },
  {
    id: 'speed_demon_gold',
    name: 'Speed Demon (Gold)',
    description: 'Run a 40-yard dash in 4.6 seconds or less',
    type: 'performance',
    level: 'gold',
    icon: '🏃',
    requirements: [{ description: '40-yard dash time ≤ 4.6 seconds', threshold: 4.6 }],
    points: 200
  },
  {
    id: 'speed_demon_platinum',
    name: 'Speed Demon (Platinum)',
    description: 'Run a 40-yard dash in 4.4 seconds or less',
    type: 'performance',
    level: 'platinum',
    icon: '🏃',
    requirements: [{ description: '40-yard dash time ≤ 4.4 seconds', threshold: 4.4 }],
    points: 500
  },
  
  // Vertical Jump Achievements
  {
    id: 'high_flyer_bronze',
    name: 'High Flyer (Bronze)',
    description: 'Record a vertical jump of 24 inches or higher',
    type: 'performance',
    level: 'bronze',
    icon: '🦘',
    requirements: [{ description: 'Vertical jump ≥ 24 inches', threshold: 24 }],
    points: 50
  },
  {
    id: 'high_flyer_silver',
    name: 'High Flyer (Silver)',
    description: 'Record a vertical jump of 28 inches or higher',
    type: 'performance',
    level: 'silver',
    icon: '🦘',
    requirements: [{ description: 'Vertical jump ≥ 28 inches', threshold: 28 }],
    points: 100
  },
  {
    id: 'high_flyer_gold',
    name: 'High Flyer (Gold)',
    description: 'Record a vertical jump of 32 inches or higher',
    type: 'performance',
    level: 'gold',
    icon: '🦘',
    requirements: [{ description: 'Vertical jump ≥ 32 inches', threshold: 32 }],
    points: 200
  },
  {
    id: 'high_flyer_platinum',
    name: 'High Flyer (Platinum)',
    description: 'Record a vertical jump of 36 inches or higher',
    type: 'performance',
    level: 'platinum',
    icon: '🦘',
    requirements: [{ description: 'Vertical jump ≥ 36 inches', threshold: 36 }],
    points: 500
  },
  
  // Strength Achievements
  {
    id: 'iron_pumper_bronze',
    name: 'Iron Pumper (Bronze)',
    description: 'Complete 10 reps on the bench press at 225 pounds',
    type: 'performance',
    level: 'bronze',
    icon: '🏋️',
    requirements: [{ description: 'Bench press reps ≥ 10 at 225 pounds', threshold: 10 }],
    points: 50
  },
  {
    id: 'iron_pumper_silver',
    name: 'Iron Pumper (Silver)',
    description: 'Complete 15 reps on the bench press at 225 pounds',
    type: 'performance',
    level: 'silver',
    icon: '🏋️',
    requirements: [{ description: 'Bench press reps ≥ 15 at 225 pounds', threshold: 15 }],
    points: 100
  },
  {
    id: 'iron_pumper_gold',
    name: 'Iron Pumper (Gold)',
    description: 'Complete 20 reps on the bench press at 225 pounds',
    type: 'performance',
    level: 'gold',
    icon: '🏋️',
    requirements: [{ description: 'Bench press reps ≥ 20 at 225 pounds', threshold: 20 }],
    points: 200
  },
  {
    id: 'iron_pumper_platinum',
    name: 'Iron Pumper (Platinum)',
    description: 'Complete 25 reps on the bench press at 225 pounds',
    type: 'performance',
    level: 'platinum',
    icon: '🏋️',
    requirements: [{ description: 'Bench press reps ≥ 25 at 225 pounds', threshold: 25 }],
    points: 500
  },
  
  // Profile Achievements
  {
    id: 'profile_starter',
    name: 'Profile Starter',
    description: 'Complete your basic profile information',
    type: 'profile',
    level: 'bronze',
    icon: '📝',
    requirements: [{ description: 'Complete the basic profile information' }],
    points: 25
  },
  {
    id: 'profile_builder',
    name: 'Profile Builder',
    description: 'Complete all sections of your athlete profile',
    type: 'profile',
    level: 'silver',
    icon: '📝',
    requirements: [{ description: 'Complete all profile sections including athletic metrics' }],
    points: 75
  },
  {
    id: 'highlight_hero',
    name: 'Highlight Hero',
    description: 'Add your first highlight film to your profile',
    type: 'profile',
    level: 'bronze',
    icon: '🎬',
    requirements: [{ description: 'Add highlight film to profile' }],
    points: 50
  },
  
  // Training Achievements
  {
    id: 'training_starter',
    name: 'Training Starter',
    description: 'Complete your first weekly training plan',
    type: 'training',
    level: 'bronze',
    icon: '📅',
    requirements: [{ description: 'Complete 1 weekly training plan', threshold: 1 }],
    points: 25
  },
  {
    id: 'training_consistent',
    name: 'Training Consistent',
    description: 'Complete 4 weekly training plans',
    type: 'training',
    level: 'silver',
    icon: '📅',
    requirements: [{ description: 'Complete 4 weekly training plans', threshold: 4 }],
    points: 100
  },
  {
    id: 'training_dedicated',
    name: 'Training Dedicated',
    description: 'Complete 12 weekly training plans',
    type: 'training',
    level: 'gold',
    icon: '📅',
    requirements: [{ description: 'Complete 12 weekly training plans', threshold: 12 }],
    points: 300
  },
  
  // Nutrition Achievements
  {
    id: 'nutrition_tracker',
    name: 'Nutrition Tracker',
    description: 'Log your first week of meals',
    type: 'nutrition',
    level: 'bronze',
    icon: '🥗',
    requirements: [{ description: 'Log all meals for 7 consecutive days', threshold: 7 }],
    points: 50
  },
  {
    id: 'nutrition_master',
    name: 'Nutrition Master',
    description: 'Log a month of meals following your nutrition plan',
    type: 'nutrition',
    level: 'gold',
    icon: '🥗',
    requirements: [{ description: 'Log all meals for 30 consecutive days', threshold: 30 }],
    points: 250
  },
  
  // Academic Achievements
  {
    id: 'academic_achiever',
    name: 'Academic Achiever',
    description: 'Maintain a GPA of 3.0 or higher',
    type: 'academic',
    level: 'silver',
    icon: '📚',
    requirements: [{ description: 'GPA ≥ 3.0', threshold: 3.0 }],
    points: 100
  },
  {
    id: 'academic_star',
    name: 'Academic Star',
    description: 'Maintain a GPA of 3.5 or higher',
    type: 'academic',
    level: 'gold',
    icon: '📚',
    requirements: [{ description: 'GPA ≥ 3.5', threshold: 3.5 }],
    points: 200
  },
  
  // Recruiting Achievements
  {
    id: 'camp_participant',
    name: 'Camp Participant',
    description: 'Participate in your first football camp or combine',
    type: 'recruiting',
    level: 'bronze',
    icon: '🏈',
    requirements: [{ description: 'Attend a football camp or combine' }],
    points: 75
  },
  {
    id: 'college_interest',
    name: 'College Interest',
    description: 'Receive interest from a college program',
    type: 'recruiting',
    level: 'silver',
    icon: '🏫',
    requirements: [{ description: 'Record interest from a college program' }],
    points: 150
  },
  {
    id: 'scholarship_offer',
    name: 'Scholarship Offer',
    description: 'Receive your first scholarship offer',
    type: 'recruiting',
    level: 'gold',
    icon: '🏆',
    requirements: [{ description: 'Record a scholarship offer' }],
    points: 500
  }
];

// Utility functions to work with achievements
export function getAchievementsByType(type: AchievementType): Achievement[] {
  return ACHIEVEMENT_BADGES.filter(achievement => achievement.type === type);
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_BADGES.find(achievement => achievement.id === id);
}

export function getLevelColorClass(level: AchievementLevel): string {
  switch (level) {
    case 'bronze':
      return 'bg-amber-700 text-white';
    case 'silver':
      return 'bg-slate-400 text-white';
    case 'gold':
      return 'bg-amber-400 text-black';
    case 'platinum':
      return 'bg-gradient-to-r from-teal-400 to-blue-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}