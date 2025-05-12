import { MemStorage } from './storage';
import { InsertAchievement } from '@shared/schema';

// Achievement categories
const CATEGORIES = {
  PERFORMANCE: 'performance',
  TRAINING: 'training',
  NUTRITION: 'nutrition',
  PROFILE: 'profile',
  SOCIAL: 'social',
  RECRUITING: 'recruiting',
  ACADEMICS: 'academics'
};

// Achievement levels (determines point value and badge style)
const LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

/**
 * Seed default achievements into the database
 */
export async function seedAchievements(storage: MemStorage) {
  console.log('Seeding achievements...');
  
  // Check if achievements already exist
  const existingAchievements = await storage.getAchievements();
  if (existingAchievements.length > 0) {
    console.log(`${existingAchievements.length} achievements already exist, skipping seed.`);
    return;
  }
  
  // Import required enums from schema
  const { achievementTypeEnum, achievementLevelEnum } = await import('@shared/schema');
  
  // Default achievements to create
  const defaultAchievements: InsertAchievement[] = [
    // Performance achievements
    {
      achievementId: 'forty-yard-under-5',
      name: 'Speed Demon',
      description: 'Run the 40-yard dash in under 5 seconds',
      type: CATEGORIES.PERFORMANCE,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'running',
      criteria: JSON.stringify({
        metricName: 'fortyYard',
        comparison: 'less-than',
        targetValue: 5
      }),
      active: true
    },
    {
      achievementId: 'shuttle-under-4-5',
      name: 'Quick Feet',
      description: 'Complete the shuttle run in under 4.5 seconds',
      category: CATEGORIES.PERFORMANCE,
      level: LEVELS.SILVER,
      pointValue: 100,
      icon: 'zap',
      criteria: JSON.stringify({
        metricName: 'shuttle',
        comparison: 'less-than',
        targetValue: 4.5
      }),
      active: true
    },
    {
      achievementId: 'vertical-over-30',
      name: 'High Flyer',
      description: 'Achieve a vertical jump of over 30 inches',
      category: CATEGORIES.PERFORMANCE,
      level: LEVELS.GOLD,
      pointValue: 150,
      icon: 'arrow-up',
      criteria: JSON.stringify({
        metricName: 'verticalJump',
        comparison: 'greater-than',
        targetValue: 30
      }),
      active: true
    },
    
    // Training achievements
    {
      achievementId: 'complete-10-workouts',
      name: 'Training Starter',
      description: 'Complete 10 workout sessions',
      category: CATEGORIES.TRAINING,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'dumbbell',
      criteria: JSON.stringify({
        entityType: 'workoutSessions',
        count: 10,
        filter: { completed: true }
      }),
      active: true
    },
    {
      achievementId: 'complete-25-workouts',
      name: 'Training Enthusiast',
      description: 'Complete 25 workout sessions',
      category: CATEGORIES.TRAINING,
      level: LEVELS.SILVER,
      pointValue: 100,
      icon: 'dumbbell',
      criteria: JSON.stringify({
        entityType: 'workoutSessions',
        count: 25,
        filter: { completed: true }
      }),
      active: true
    },
    {
      achievementId: 'complete-50-workouts',
      name: 'Training Master',
      description: 'Complete 50 workout sessions',
      category: CATEGORIES.TRAINING,
      level: LEVELS.GOLD,
      pointValue: 150,
      icon: 'dumbbell',
      criteria: JSON.stringify({
        entityType: 'workoutSessions',
        count: 50,
        filter: { completed: true }
      }),
      active: true
    },
    
    // Profile achievements
    {
      achievementId: 'complete-profile',
      name: 'Identity Established',
      description: 'Complete your athlete profile',
      category: CATEGORIES.PROFILE,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'user-check',
      criteria: JSON.stringify({
        profileFieldsRequired: [
          'firstName', 'lastName', 'position', 
          'height', 'weight', 'school', 'graduationYear'
        ],
        allRequired: true
      }),
      active: true
    },
    {
      achievementId: 'upload-highlight-film',
      name: 'Highlight Reel',
      description: 'Upload your highlight film',
      category: CATEGORIES.PROFILE,
      level: LEVELS.SILVER,
      pointValue: 100,
      icon: 'film',
      criteria: JSON.stringify({
        profileFieldsRequired: ['hudlLink'],
        allRequired: true
      }),
      active: true
    },
    
    // Recruiting achievements
    {
      achievementId: 'create-recruiting-profile',
      name: 'Recruitment Ready',
      description: 'Create your recruiting profile',
      category: CATEGORIES.RECRUITING,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'search',
      criteria: JSON.stringify({
        entityType: 'recruitingProfile',
        exists: true
      }),
      active: true
    },
    {
      achievementId: 'save-5-colleges',
      name: 'College Explorer',
      description: 'Save 5 colleges to your saved list',
      category: CATEGORIES.RECRUITING,
      level: LEVELS.SILVER,
      pointValue: 100,
      icon: 'bookmark',
      criteria: JSON.stringify({
        entityType: 'savedColleges',
        count: 5
      }),
      active: true
    },
    
    // Social achievements
    {
      achievementId: 'connect-5-athletes',
      name: 'Team Builder',
      description: 'Connect with 5 other athletes',
      category: CATEGORIES.SOCIAL,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'users',
      criteria: JSON.stringify({
        entityType: 'socialConnections',
        count: 5
      }),
      active: true
    },
    {
      achievementId: 'create-5-posts',
      name: 'Social Starter',
      description: 'Create 5 posts',
      category: CATEGORIES.SOCIAL,
      level: LEVELS.BRONZE,
      pointValue: 50,
      icon: 'message-square',
      criteria: JSON.stringify({
        entityType: 'socialPosts',
        count: 5
      }),
      active: true
    }
  ];
  
  // Create the achievements
  let createdCount = 0;
  for (const achievement of defaultAchievements) {
    try {
      await storage.createAchievement(achievement);
      createdCount++;
    } catch (error) {
      console.error(`Error creating achievement ${achievement.name}:`, error);
    }
  }
  
  console.log(`Created ${createdCount} achievements`);
}