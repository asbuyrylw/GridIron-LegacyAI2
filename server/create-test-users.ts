import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Using the existing hash function from auth.ts
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUsers() {
  console.log("Creating test users for parents and coaches...");

  // Create a parent user
  const parentUser = await storage.createUser({
    username: "testparent",
    password: await hashPassword("parent123"),
    email: "parent@example.com",
    userType: "parent",
  });

  if (parentUser) {
    console.log("Parent user created:", {
      username: parentUser.username,
      id: parentUser.id,
      userType: parentUser.userType,
    });

    // Create parent profile
    const parentProfile = await storage.createParent({
      userId: parentUser.id,
      firstName: "Parent",
      lastName: "Test",
      phone: "555-123-4567",
      email: "parent@example.com",
    });

    console.log("Parent profile created:", {
      id: parentProfile.id,
      firstName: parentProfile.firstName,
      lastName: parentProfile.lastName,
    });

    // Connect parent to athlete
    const athleteId = 1; // Connect to the test athlete that's created by default
    const parentAthleteRelationship = await storage.createParentAthleteRelationship({
      parentId: parentProfile.id,
      athleteId,
      relationship: "Parent/Guardian",
      approved: true, // Auto-approve for testing
      createdAt: new Date(),
    });

    console.log(`Connected parent to athlete ID ${athleteId}`);
  }

  // Create a coach user
  const coachUser = await storage.createUser({
    username: "testcoach",
    password: await hashPassword("coach123"),
    email: "coach@example.com",
    userType: "coach",
  });

  if (coachUser) {
    console.log("Coach user created:", {
      username: coachUser.username,
      id: coachUser.id,
      userType: coachUser.userType,
    });

    // Create coach profile
    const coachProfile = await storage.createCoach({
      userId: coachUser.id,
      firstName: "Coach",
      lastName: "Test",
      title: "Head Coach",
      phone: "555-987-6543",
      email: "coach@example.com",
      school: "Central High School",
      experience: "10 years",
      certifications: ["Level 1 Certification", "Training Safety"],
    });

    console.log("Coach profile created:", {
      id: coachProfile.id,
      firstName: coachProfile.firstName,
      lastName: coachProfile.lastName,
      title: coachProfile.title,
    });

    // Connect coach to the default team
    const teamId = 1; // The default team ID
    const teamMember = await storage.addTeamMember({
      teamId,
      athleteId: 0, // Not an athlete
      userId: coachUser.id,
      role: "Head Coach",
      status: "active",
      isActive: true,
      joinedAt: new Date(),
    });

    console.log(`Connected coach to team ID ${teamId}`);
  }

  console.log("=== TEST USER CREDENTIALS ===");
  console.log("Athlete:");
  console.log("  Username: testuser");
  console.log("  Password: password123");
  console.log("Parent:");
  console.log("  Username: testparent");
  console.log("  Password: parent123");
  console.log("Coach:");
  console.log("  Username: testcoach");
  console.log("  Password: coach123");
  console.log("=============================");
}

export { createTestUsers };