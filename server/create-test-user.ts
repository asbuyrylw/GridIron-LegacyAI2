import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
  try {
    // Check if the test user already exists
    const existingUser = await storage.getUserByUsername("testuser");
    
    if (existingUser) {
      console.log("Test user already exists");
      return;
    }
    
    // Create user
    const user = await storage.createUser({
      username: "testuser",
      password: await hashPassword("password123"),
      email: "test@example.com",
      userType: "athlete",
    });
    
    console.log("User created:", user);
    
    // Create athlete profile
    const athlete = await storage.createAthlete({
      userId: user.id,
      firstName: "Test",
      lastName: "User",
      position: "Quarterback (QB)",
      subscriptionTier: "free",
      profileVisibility: true,
      onboardingCompleted: true
    });
    
    console.log("Athlete profile created:", athlete);
    
    console.log("\n=== TEST USER CREDENTIALS ===");
    console.log("Username: testuser");
    console.log("Password: password123");
    console.log("=============================");
    
    // Create sample metrics
    const metrics = await storage.createCombineMetrics({
      athleteId: athlete.id,
      fortyYard: 4.8,
      tenYardSplit: 1.6,
      shuttle: 4.2,
      threeCone: 7.1,
      verticalJump: 32,
      broadJump: 100,
      benchPress: 185,
      benchPressReps: 10,
      squatMax: 300,
      powerClean: 185,
      deadlift: 350,
      pullUps: 15
    });
    
    console.log("Created sample metrics:", metrics);
    
    // Create sample workout session
    const session = await storage.createWorkoutSession({
      athleteId: athlete.id,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      endTime: new Date(),
      completed: true,
      duration: 60,
      notes: "Great conditioning workout!",
      location: "School Gym",
      exercisesCompleted: {
        planExercises: [
          { id: "ex1", name: "Bench Press", completed: true },
          { id: "ex2", name: "Squats", completed: true },
          { id: "ex3", name: "Sprint Intervals", completed: true }
        ],
        customExercises: []
      },
      trainingPlanId: null,
      perceivedExertion: 8,
      energyLevel: 7,
      rating: 4,
      weatherConditions: "Indoor"
    });
    
    console.log("Created sample workout session:", session);
    
    // Create sample training plan
    const plan = await storage.createTrainingPlan({
      athleteId: athlete.id,
      date: new Date().toISOString().split('T')[0],
      title: "Speed & Agility Focus",
      focus: "Speed",
      exercises: [
        {
          id: "ex1",
          name: "Sprint Ladder",
          sets: 4,
          reps: "30 seconds",
          restTime: 30,
          completed: false
        },
        {
          id: "ex2",
          name: "5-10-5 Shuttle Drills",
          sets: 5,
          reps: "with 60s rest",
          restTime: 60,
          completed: false
        },
        {
          id: "ex3",
          name: "Box Jumps",
          sets: 3,
          reps: "10 reps",
          restTime: 45,
          completed: false
        }
      ],
      completed: false,
      coachTip: "Focus on proper hip rotation during the 5-10-5 drill to optimize your change of direction.",
      active: true,
      difficultyLevel: "Intermediate"
    });
    
    console.log("Created sample training plan:", plan);
    
    // Create sample exercises
    const exercises = [
      {
        name: "Box Jumps",
        description: "Explosive exercise to develop lower body power",
        category: "Plyometrics",
        difficulty: "Intermediate",
        muscleGroups: ["Quadriceps", "Hamstrings", "Calves", "Glutes"],
        instructions: [
          "Stand in front of a sturdy box",
          "Bend into a quarter squat position",
          "Explode upward and land softly on the box",
          "Step back down and repeat"
        ],
        equipmentNeeded: ["Plyometric box"],
        videoUrl: null,
        imageUrl: null,
        tips: [
          "Land as softly as possible",
          "Use arms for momentum",
          "Start with a lower box height"
        ],
        positionSpecific: false,
        positions: []
      },
      {
        name: "Quarterback Ladder Drill",
        description: "Improves footwork and coordination for quarterbacks",
        category: "Agility",
        difficulty: "Intermediate",
        muscleGroups: ["Calves", "Quads", "Core"],
        instructions: [
          "Start at one end of the ladder",
          "Perform high knees through each square",
          "At the end, set feet and simulate throwing motion",
          "Repeat with different footwork patterns"
        ],
        equipmentNeeded: ["Agility ladder", "Football"],
        videoUrl: null,
        imageUrl: null,
        tips: [
          "Keep your head up",
          "Stay on the balls of your feet",
          "Maintain quarterbacking posture"
        ],
        positionSpecific: true,
        positions: ["Quarterback (QB)"]
      },
      {
        name: "Defensive Line Get-Off Drill",
        description: "Improves firing off the line of scrimmage",
        category: "Explosive Power",
        difficulty: "Advanced",
        muscleGroups: ["Core", "Quads", "Glutes", "Shoulders"],
        instructions: [
          "Start in 3-point stance",
          "On signal, explode forward 5 yards",
          "Focus on first three steps being powerful",
          "Repeat 5-10 times"
        ],
        equipmentNeeded: ["Cones"],
        videoUrl: null,
        imageUrl: null,
        tips: [
          "Keep low pad level",
          "Drive knees up",
          "Maintain body control"
        ],
        positionSpecific: true,
        positions: ["Defensive Line (DL)"]
      }
    ];
    
    for (const exercise of exercises) {
      const created = await storage.createExercise(exercise);
      console.log(`Created exercise: ${created.name}`);
    }
    
    // Create sample teams
    const varsityTeam = await storage.createTeam({
      name: "Central High Varsity",
      level: "Varsity",
      season: "Fall 2025",
      sport: "football",
      coachId: user.id,
      description: "The varsity football team at Central High School.",
      location: "Central City",
      homeField: "Memorial Stadium",
      isActive: true
    });
    
    const jvTeam = await storage.createTeam({
      name: "Central High JV",
      level: "JV",
      season: "Fall 2025",
      sport: "football", 
      coachId: user.id,
      description: "The junior varsity football team at Central High School.",
      location: "Central City",
      homeField: "Practice Field",
      isActive: true
    });
    
    // Add athlete to varsity team
    const teamMember = await storage.createTeamMember({
      teamId: varsityTeam.id,
      athleteId: athlete.id,
      role: "player",
      position: athlete.position,
      jerseyNumber: "12",
      isActive: true,
      status: "active"
    });
    
    // Create team event
    const practiceEvent = await storage.createTeamEvent({
      teamId: varsityTeam.id,
      title: "Team Practice",
      description: "Weekly team practice focusing on offensive plays",
      eventType: "practice",
      location: "Memorial Stadium",
      startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      isRequired: true,
      createdBy: user.id
    });
    
    const gameEvent = await storage.createTeamEvent({
      teamId: varsityTeam.id,
      title: "Game vs Jefferson High",
      description: "Home game against Jefferson High School",
      eventType: "game",
      location: "Memorial Stadium",
      startDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      isRequired: true,
      createdBy: user.id,
      opponent: "Jefferson High"
    });
    
    // Create team announcement
    const announcement = await storage.createTeamAnnouncement({
      teamId: varsityTeam.id,
      title: "New Practice Schedule",
      content: "Starting next week, we will have additional practice sessions on Thursdays to prepare for the upcoming season.",
      importance: "high",
      publishedBy: user.id
    });
    
    console.log("Created sample team:", varsityTeam.name);
    console.log("Added team member:", teamMember.id);
    console.log("Created team events:", practiceEvent.title, gameEvent.title);
    console.log("Created team announcement:", announcement.title);
    
    console.log("Test user setup complete!");
    
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

// No need for direct execution check in ES modules
// The function will be called from index.ts

export { createTestUser };