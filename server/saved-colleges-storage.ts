import { MemStorage } from './storage';
import { SavedCollege, InsertSavedCollege } from '@shared/saved-colleges-schema';
import { MatchedCollege } from '@shared/schema';

// Saved Colleges methods for MemStorage
export async function getSavedColleges(this: MemStorage, userId: number): Promise<MatchedCollege[]> {
  // Get all saved colleges for the user
  const savedColleges: SavedCollege[] = Array.from(this.savedCollegesMap.values())
    .filter(college => college.userId === userId);
  
  // For now we'll use a mock implementation that returns some sample college data
  // In a real implementation, this would fetch data from our college database
  const mockCollegeDB = [
    {
      id: 1,
      name: "University of Alabama",
      division: "D1",
      conference: "SEC",
      region: "South",
      state: "Alabama",
      city: "Tuscaloosa",
      isPublic: true,
      enrollment: 38000,
      admissionRate: 0.81,
      averageGPA: 3.7,
      athleticRanking: 1,
      programs: ["Business", "Engineering", "Communications"],
      tuition: { inState: 11000, outOfState: 30000 },
      athleticScholarships: true,
      sportOfferings: ["Football", "Basketball", "Baseball"],
      academicMatch: 85,
      athleticMatch: 90,
      overallMatch: 88,
      website: "https://www.ua.edu",
    },
    {
      id: 2,
      name: "Ohio State University",
      division: "D1",
      conference: "Big Ten",
      region: "Midwest",
      state: "Ohio",
      city: "Columbus",
      isPublic: true,
      enrollment: 61000,
      admissionRate: 0.54,
      averageGPA: 3.8,
      athleticRanking: 2,
      programs: ["Business", "Engineering", "Arts & Sciences"],
      tuition: { inState: 11500, outOfState: 33000 },
      athleticScholarships: true,
      sportOfferings: ["Football", "Basketball", "Wrestling"],
      academicMatch: 82,
      athleticMatch: 92,
      overallMatch: 87,
      website: "https://www.osu.edu",
    },
    {
      id: 3,
      name: "University of Michigan",
      division: "D1",
      conference: "Big Ten",
      region: "Midwest",
      state: "Michigan",
      city: "Ann Arbor",
      isPublic: true,
      enrollment: 47000,
      admissionRate: 0.23,
      averageGPA: 3.9,
      athleticRanking: 3,
      programs: ["Business", "Engineering", "Medicine"],
      tuition: { inState: 15000, outOfState: 51000 },
      athleticScholarships: true,
      sportOfferings: ["Football", "Basketball", "Hockey"],
      academicMatch: 90,
      athleticMatch: 85,
      overallMatch: 88,
      website: "https://www.umich.edu",
    },
    {
      id: 4,
      name: "Williams College",
      division: "D3",
      conference: "NESCAC",
      region: "Northeast",
      state: "Massachusetts",
      city: "Williamstown",
      isPublic: false,
      enrollment: 2100,
      admissionRate: 0.08,
      averageGPA: 4.0,
      athleticRanking: 1,
      programs: ["Liberal Arts", "Economics", "Political Science"],
      tuition: { inState: 59000, outOfState: 59000 },
      athleticScholarships: false,
      sportOfferings: ["Football", "Soccer", "Tennis"],
      academicMatch: 95,
      athleticMatch: 75,
      overallMatch: 85,
      website: "https://www.williams.edu",
    },
    {
      id: 5,
      name: "Community College of Philadelphia",
      division: "JUCO",
      region: "Northeast",
      state: "Pennsylvania",
      city: "Philadelphia",
      isPublic: true,
      enrollment: 15000,
      admissionRate: 1.0,
      programs: ["General Studies", "Business", "Nursing"],
      tuition: { inState: 4000, outOfState: 8000 },
      athleticScholarships: false,
      sportOfferings: ["Basketball", "Track"],
      academicMatch: 75,
      athleticMatch: 60,
      overallMatch: 70,
      website: "https://www.ccp.edu",
    }
  ];
  
  const result = savedColleges.map(savedCollege => {
    const college = mockCollegeDB.find(c => c.id === savedCollege.collegeId);
    return college || { 
      id: savedCollege.collegeId, 
      name: "Unknown College", 
      division: "Unknown",
      state: "Unknown",
      city: "Unknown",
      isPublic: true,
      enrollment: 0,
      academicMatch: 0,
      athleticMatch: 0,
      overallMatch: 0
    };
  });
  
  return result as MatchedCollege[];
}

export async function saveCollege(this: MemStorage, userId: number, collegeId: number): Promise<SavedCollege> {
  // Check if already saved
  const existingSave = Array.from(this.savedCollegesMap.values())
    .find(college => college.userId === userId && college.collegeId === collegeId);
  
  if (existingSave) {
    return existingSave;
  }
  
  // Create a new saved college record
  const id = ++this.currentSavedCollegeId;
  const savedCollege: SavedCollege = {
    id,
    userId,
    collegeId,
    createdAt: new Date()
  };
  
  this.savedCollegesMap.set(id, savedCollege);
  return savedCollege;
}

export async function unsaveCollege(this: MemStorage, userId: number, collegeId: number): Promise<boolean> {
  // Find the saved college to delete
  const savedCollege = Array.from(this.savedCollegesMap.values())
    .find(college => college.userId === userId && college.collegeId === collegeId);
  
  if (!savedCollege) {
    return false;
  }
  
  // Delete the saved college
  this.savedCollegesMap.delete(savedCollege.id);
  return true;
}

export async function isCollegeSaved(this: MemStorage, userId: number, collegeId: number): Promise<boolean> {
  return Array.from(this.savedCollegesMap.values())
    .some(college => college.userId === userId && college.collegeId === collegeId);
}