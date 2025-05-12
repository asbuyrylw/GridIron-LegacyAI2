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
  isCoachOnly?: boolean; // Coach can award these special badges
}

// List of all available achievements
export const ACHIEVEMENT_BADGES: Achievement[] = [
  // Speed Achievements
  {
    id: 'speedster_bronze',
    name: 'Speedster (Bronze)',
    description: 'Run the 40-yard dash in 5.0 seconds or less',
    type: 'performance',
    level: 'bronze',
    icon: '🏃',
    requirements: [{ description: '40-yard dash ≤ 5.0 seconds', threshold: 5.0 }],
    points: 50
  },
  {
    id: 'speedster_silver',
    name: 'Speedster (Silver)',
    description: 'Run the 40-yard dash in 4.8 seconds or less',
    type: 'performance',
    level: 'silver',
    icon: '🏃',
    requirements: [{ description: '40-yard dash ≤ 4.8 seconds', threshold: 4.8 }],
    points: 100
  },
  {
    id: 'speedster_gold',
    name: 'Speedster (Gold)',
    description: 'Run the 40-yard dash in 4.6 seconds or less',
    type: 'performance',
    level: 'gold',
    icon: '🏃',
    requirements: [{ description: '40-yard dash ≤ 4.6 seconds', threshold: 4.6 }],
    points: 200
  },
  {
    id: 'speedster_platinum',
    name: 'Speedster (Platinum)',
    description: 'Run the 40-yard dash in 4.4 seconds or less',
    type: 'performance',
    level: 'platinum',
    icon: '🏃',
    requirements: [{ description: '40-yard dash ≤ 4.4 seconds', threshold: 4.4 }],
    points: 500
  },
  
  // Agility Achievements
  {
    id: 'agility_master_bronze',
    name: 'Agility Master (Bronze)',
    description: 'Complete the shuttle run in 4.5 seconds or less',
    type: 'performance',
    level: 'bronze',
    icon: '⚡',
    requirements: [{ description: 'Shuttle run ≤ 4.5 seconds', threshold: 4.5 }],
    points: 50
  },
  {
    id: 'agility_master_silver',
    name: 'Agility Master (Silver)',
    description: 'Complete the shuttle run in 4.3 seconds or less',
    type: 'performance',
    level: 'silver',
    icon: '⚡',
    requirements: [{ description: 'Shuttle run ≤ 4.3 seconds', threshold: 4.3 }],
    points: 100
  },
  {
    id: 'agility_master_gold',
    name: 'Agility Master (Gold)',
    description: 'Complete the shuttle run in 4.1 seconds or less',
    type: 'performance',
    level: 'gold',
    icon: '⚡',
    requirements: [{ description: 'Shuttle run ≤ 4.1 seconds', threshold: 4.1 }],
    points: 200
  },
  {
    id: 'agility_master_platinum',
    name: 'Agility Master (Platinum)',
    description: 'Complete the shuttle run in 3.9 seconds or less',
    type: 'performance',
    level: 'platinum',
    icon: '⚡',
    requirements: [{ description: 'Shuttle run ≤ 3.9 seconds', threshold: 3.9 }],
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
    requirements: [{ description: 'Upload a highlight film to your profile' }],
    points: 50
  },
  
  // Training Achievements
  {
    id: 'workout_warrior_bronze',
    name: 'Workout Warrior (Bronze)',
    description: 'Complete 5 training sessions',
    type: 'training',
    level: 'bronze',
    icon: '💪',
    requirements: [{ description: 'Complete 5 training sessions', threshold: 5 }],
    points: 25
  },
  {
    id: 'workout_warrior_silver',
    name: 'Workout Warrior (Silver)',
    description: 'Complete 25 training sessions',
    type: 'training',
    level: 'silver',
    icon: '💪',
    requirements: [{ description: 'Complete 25 training sessions', threshold: 25 }],
    points: 100
  },
  {
    id: 'workout_warrior_gold',
    name: 'Workout Warrior (Gold)',
    description: 'Complete 50 training sessions',
    type: 'training',
    level: 'gold',
    icon: '💪',
    requirements: [{ description: 'Complete 50 training sessions', threshold: 50 }],
    points: 200
  },
  {
    id: 'workout_warrior_platinum',
    name: 'Workout Warrior (Platinum)',
    description: 'Complete 100 training sessions',
    type: 'training',
    level: 'platinum',
    icon: '💪',
    requirements: [{ description: 'Complete 100 training sessions', threshold: 100 }],
    points: 500
  },
  {
    id: 'training_streak',
    name: 'Training Streak',
    description: 'Complete training sessions for 7 consecutive days',
    type: 'training',
    level: 'silver',
    icon: '🔥',
    requirements: [{ description: 'Train for 7 consecutive days', threshold: 7 }],
    points: 150
  },
  
  // Social Achievements
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Join your first team',
    type: 'social',
    level: 'bronze',
    icon: '👥',
    requirements: [{ description: 'Join a team' }],
    points: 25
  },
  {
    id: 'social_networker',
    name: 'Social Networker',
    description: 'Connect with 5 other athletes',
    type: 'social',
    level: 'silver',
    icon: '🔗',
    requirements: [{ description: 'Connect with 5 athletes', threshold: 5 }],
    points: 75
  },
  
  // Nutrition Achievements
  {
    id: 'nutrition_novice',
    name: 'Nutrition Novice',
    description: 'Log your first meal plan',
    type: 'nutrition',
    level: 'bronze',
    icon: '🥗',
    requirements: [{ description: 'Log your first meal plan' }],
    points: 25
  },
  {
    id: 'nutrition_expert',
    name: 'Nutrition Expert',
    description: 'Log meals for 7 consecutive days',
    type: 'nutrition',
    level: 'silver',
    icon: '🥗',
    requirements: [{ description: 'Log meals for 7 consecutive days', threshold: 7 }],
    points: 100
  },
  {
    id: 'nutrition_master',
    name: 'Nutrition Master',
    description: 'Complete 30 days of following your nutrition plan',
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
    icon: '🎓',
    requirements: [{ description: 'Receive a scholarship offer' }],
    points: 300
  },
  
  // Coach-Only Badges
  {
    id: 'team_mvp',
    name: 'Team MVP',
    description: 'Awarded by your coach for outstanding team contributions',
    type: 'social',
    level: 'gold',
    icon: '🏆',
    requirements: [{ description: 'Be recognized as MVP by your coach' }],
    points: 300,
    isCoachOnly: true
  },
  {
    id: 'leadership_excellence',
    name: 'Leadership Excellence',
    description: 'Recognized for exceptional leadership qualities',
    type: 'social',
    level: 'gold',
    icon: '👑',
    requirements: [{ description: 'Display outstanding leadership abilities' }],
    points: 250,
    isCoachOnly: true
  },
  {
    id: 'position_master',
    name: 'Position Master',
    description: 'Recognized for exceptional position-specific skills',
    type: 'performance',
    level: 'platinum',
    icon: '⭐',
    requirements: [{ description: 'Master the technical aspects of your position' }],
    points: 400,
    isCoachOnly: true
  }
];

// Helper function to get achievements by type
export function getAchievementsByType(type: AchievementType): Achievement[] {
  return ACHIEVEMENT_BADGES.filter(badge => badge.type === type);
}

// Helper function to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_BADGES.find(badge => badge.id === id);
}