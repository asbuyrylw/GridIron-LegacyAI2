import { 
  users, type User, type InsertUser, 
  athletes, type Athlete, type InsertAthlete,
  parents, type Parent, type InsertParent,
  coaches, type Coach, type InsertCoach,
  parentAthleteRelationships, type ParentAthleteRelationship, type InsertParentAthleteRelationship,
  combineMetrics, type CombineMetric, type InsertCombineMetric,
  exerciseLibrary, type ExerciseLibrary, type InsertExerciseLibrary,
  trainingPlans, type TrainingPlan, type InsertTrainingPlan,
  workoutSessions, type WorkoutSession, type InsertWorkoutSession,
  performanceInsights, type PerformanceInsights, type InsertPerformanceInsights,
  coachMessages, type CoachMessage, type InsertCoachMessage,
  nutritionPlans, type NutritionPlan, type InsertNutritionPlan,
  mealLogs, type MealLog, type InsertMealLog,
  aiMealSuggestions, type AiMealSuggestion, type InsertAiMealSuggestion,
  socialConnections, type SocialConnection, type InsertSocialConnection,
  socialPosts, type SocialPost, type InsertSocialPost,
  achievements, type Achievement, type InsertAchievement,
  athleteAchievements, type AthleteAchievement, type InsertAthleteAchievement,
  leaderboards, type Leaderboard, type InsertLeaderboard,
  leaderboardEntries, type LeaderboardEntry, type InsertLeaderboardEntry,
  strengthConditioning, type StrengthConditioning, type InsertStrengthConditioning,
  nutritionInfo, type NutritionInfo, type InsertNutritionInfo,
  recruitingPreferences, type RecruitingPreferences, type InsertRecruitingPreferences,
  recruitingProfiles, type RecruitingProfile, type InsertRecruitingProfile,
  recruitingAnalytics, type RecruitingAnalytics, type InsertRecruitingAnalytics,
  recruitingMessages, type RecruitingMessage, type InsertRecruitingMessage,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember,
  teamEvents, type TeamEvent, type InsertTeamEvent,
  teamEventAttendance, type TeamEventAttendance, type InsertTeamEventAttendance,
  teamAnnouncements, type TeamAnnouncement, type InsertTeamAnnouncement
} from "@shared/schema";
import { savedColleges, type SavedCollege, type InsertSavedCollege } from "@shared/saved-colleges-schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  getAthleteAchievements,
  getAthleteAchievementByStringId,
  getAchievementProgressByUserId,
  getAchievementProgressByAthleteId,
  updateAchievementProgress,
  getLeaderboard
} from "./gamification-storage";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session Store
  sessionStore: session.SessionStore;
  
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Parent Access (read-only)
  createParentAccess(parentAccess: InsertParentAccess): Promise<ParentAccess>;
  getParentAccessByEmail(email: string, athleteId: number): Promise<ParentAccess | undefined>;
  getParentAccessByToken(token: string): Promise<ParentAccess | undefined>;
  getParentAccessesByAthleteId(athleteId: number): Promise<ParentAccess[]>;
  updateParentAccess(id: number, data: Partial<InsertParentAccess>): Promise<ParentAccess | undefined>;
  deactivateParentAccess(id: number): Promise<boolean>;
  
  // Athlete Methods
  getAthlete(id: number): Promise<Athlete | undefined>;
  getAthleteByUserId(userId: number): Promise<Athlete | undefined>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  updateAthlete(id: number, athlete: Partial<InsertAthlete>): Promise<Athlete | undefined>;
  getAllAthletes(): Promise<Athlete[]>;
  
  // Parent Methods
  getParent(id: number): Promise<Parent | undefined>;
  getParentByUserId(userId: number): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: number, parent: Partial<InsertParent>): Promise<Parent | undefined>;
  
  // Parent-Athlete Relationship Methods
  getParentAthleteRelationships(parentId: number): Promise<ParentAthleteRelationship[]>;
  getAthleteParents(athleteId: number): Promise<(Parent & { relationship: string })[]>;
  createParentAthleteRelationship(relationship: InsertParentAthleteRelationship): Promise<ParentAthleteRelationship>;
  
  // Coach Methods
  getCoach(id: number): Promise<Coach | undefined>;
  getCoachByUserId(userId: number): Promise<Coach | undefined>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, coach: Partial<InsertCoach>): Promise<Coach | undefined>;
  getCoachesByTeam(teamId: number): Promise<Coach[]>;
  
  // Combine Metrics Methods
  getCombineMetrics(athleteId: number): Promise<CombineMetric[]>;
  getLatestCombineMetrics(athleteId: number): Promise<CombineMetric | undefined>;
  createCombineMetrics(metrics: InsertCombineMetric): Promise<CombineMetric>;
  
  // For API endpoint /api/athlete/:id/metrics
  getAthleteMetrics(athleteId: number): Promise<CombineMetric[]>;
  
  // Performance Insights Methods
  getPerformanceInsights(athleteId: number): Promise<PerformanceInsights | undefined>;
  createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights>;
  updatePerformanceInsights(athleteId: number, insights: Partial<InsertPerformanceInsights>): Promise<PerformanceInsights>;
  
  // Saved Colleges Methods
  getSavedColleges(userId: number): Promise<MatchedCollege[]>;
  saveCollege(userId: number, collegeId: number): Promise<SavedCollege>;
  unsaveCollege(userId: number, collegeId: number): Promise<boolean>;
  isCollegeSaved(userId: number, collegeId: number): Promise<boolean>;
  
  // Strength & Conditioning Methods
  getStrengthConditioning(athleteId: number): Promise<StrengthConditioning | undefined>;
  createStrengthConditioning(strengthConditioning: InsertStrengthConditioning): Promise<StrengthConditioning>;
  updateStrengthConditioning(id: number, strengthConditioning: Partial<InsertStrengthConditioning>): Promise<StrengthConditioning | undefined>;
  
  // Nutrition Info Methods
  getNutritionInfo(athleteId: number): Promise<NutritionInfo | undefined>;
  createNutritionInfo(nutritionInfo: InsertNutritionInfo): Promise<NutritionInfo>;
  updateNutritionInfo(id: number, nutritionInfo: Partial<InsertNutritionInfo>): Promise<NutritionInfo | undefined>;
  
  // Recruiting Preferences Methods
  getRecruitingPreferences(athleteId: number): Promise<RecruitingPreferences | undefined>;
  createRecruitingPreferences(recruitingPreferences: InsertRecruitingPreferences): Promise<RecruitingPreferences>;
  updateRecruitingPreferences(id: number, recruitingPreferences: Partial<InsertRecruitingPreferences>): Promise<RecruitingPreferences | undefined>;
  
  // Recruiting Profile Methods
  getRecruitingProfile(athleteId: number): Promise<RecruitingProfile | undefined>;
  createRecruitingProfile(profile: InsertRecruitingProfile): Promise<RecruitingProfile>;
  updateRecruitingProfile(id: number, profile: Partial<InsertRecruitingProfile>): Promise<RecruitingProfile | undefined>;
  
  // Recruiting Analytics Methods
  getRecruitingAnalytics(athleteId: number): Promise<RecruitingAnalytics | undefined>;
  createRecruitingAnalytics(analytics: InsertRecruitingAnalytics): Promise<RecruitingAnalytics>;
  updateRecruitingAnalytics(id: number, analytics: Partial<InsertRecruitingAnalytics>): Promise<RecruitingAnalytics | undefined>;
  incrementProfileViews(athleteId: number): Promise<RecruitingAnalytics | undefined>;
  
  // Recruiting Messages Methods
  getRecruitingMessages(userId: number): Promise<RecruitingMessage[]>;
  getRecruitingMessageById(id: number): Promise<RecruitingMessage | undefined>;
  createRecruitingMessage(message: InsertRecruitingMessage): Promise<RecruitingMessage>;
  markRecruitingMessageAsRead(id: number): Promise<RecruitingMessage | undefined>;
  
  // Exercise Library Methods
  getExercises(category?: string, difficulty?: string, position?: string): Promise<ExerciseLibrary[]>;
  getExerciseById(id: number): Promise<ExerciseLibrary | undefined>;
  createExercise(exercise: InsertExerciseLibrary): Promise<ExerciseLibrary>;
  updateExercise(id: number, exercise: Partial<InsertExerciseLibrary>): Promise<ExerciseLibrary | undefined>;
  
  // Training Plan Methods
  getTrainingPlans(athleteId: number): Promise<TrainingPlan[]>;
  getTrainingPlanByDate(athleteId: number, date: Date): Promise<TrainingPlan | undefined>;
  getTrainingPlanById(id: number): Promise<TrainingPlan | undefined>;
  createTrainingPlan(plan: InsertTrainingPlan): Promise<TrainingPlan>;
  updateTrainingPlan(id: number, plan: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined>;
  
  // Workout Session Methods
  getWorkoutSessions(athleteId: number): Promise<WorkoutSession[]>;
  getWorkoutSessionById(id: number): Promise<WorkoutSession | undefined>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: number, session: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined>;
  
  // Coach Messages Methods
  getCoachMessages(athleteId: number): Promise<CoachMessage[]>;
  createCoachMessage(message: InsertCoachMessage): Promise<CoachMessage>;
  markMessageAsRead(id: number): Promise<CoachMessage | undefined>;
  
  // Achievement Methods
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Athlete Achievement Methods
  getAthleteAchievements(athleteId: number): Promise<AthleteAchievement[]>;
  getAthleteAchievement(athleteId: number, achievementId: number): Promise<AthleteAchievement | undefined>;
  getAthleteAchievementByStringId(athleteId: number, achievementStringId: string): Promise<AthleteAchievement | undefined>;
  createAthleteAchievement(athleteAchievement: InsertAthleteAchievement): Promise<AthleteAchievement>;
  updateAthleteAchievement(id: number, updates: Partial<InsertAthleteAchievement>): Promise<AthleteAchievement | undefined>;
  getAchievementProgressByUserId(userId: number): Promise<any[]>;
  getAchievementProgressByAthleteId(athleteId: number): Promise<any[]>;
  updateAchievementProgress(userId: number, achievementId: string, progress: number): Promise<any>;

  // Nutrition Plan Methods
  getNutritionPlans(athleteId: number): Promise<NutritionPlan[]>;
  getActiveNutritionPlan(athleteId: number): Promise<NutritionPlan | undefined>;
  createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;
  updateNutritionPlan(id: number, active: boolean): Promise<NutritionPlan | undefined>;
  
  // Meal Log Methods
  getMealLogs(athleteId: number, date?: Date): Promise<MealLog[]>;
  createMealLog(mealLog: InsertMealLog): Promise<MealLog>;
  
  // AI Meal Suggestion Methods
  getAiMealSuggestions(athleteId: number, mealType?: string, goal?: string): Promise<AiMealSuggestion[]>;
  createAiMealSuggestion(suggestion: InsertAiMealSuggestion): Promise<AiMealSuggestion>;

  // Social Connection Methods
  getSocialConnections(userId: number): Promise<SocialConnection[]>;
  getSocialConnectionByPlatform(userId: number, platform: string): Promise<SocialConnection | undefined>;
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  updateSocialConnection(id: number, connection: Partial<InsertSocialConnection>): Promise<SocialConnection | undefined>;
  disconnectSocialConnection(id: number): Promise<SocialConnection | undefined>;
  getAthleteConnections(athleteId: number): Promise<SocialConnection[]>;
  upsertAthleteConnection(athleteId: number, connection: any): Promise<SocialConnection>;

  // Social Post Methods
  getSocialPosts(options: any): Promise<SocialPost[]>;
  getSocialPostById(id: number): Promise<SocialPost | undefined>;
  createSocialPost(post: any): Promise<SocialPost>;
  updateSocialPost(id: number, post: any): Promise<SocialPost | undefined>;
  updateSocialPostStatus(id: number, status: string, postedAt?: Date, errorMessage?: string): Promise<SocialPost | undefined>;
  deleteSocialPost(id: number): Promise<boolean>;
  toggleSocialPostLike(postId: number, userId: number): Promise<boolean>;
  
  // Social Comments Methods
  getSocialPostComments(postId: number): Promise<any[]>;
  getSocialCommentById(id: number): Promise<any | undefined>;
  createSocialComment(comment: any): Promise<any>;
  toggleSocialCommentLike(commentId: number, userId: number): Promise<boolean>;
  deleteSocialComment(id: number): Promise<boolean>;

  // These duplicate methods are already defined earlier in the interface

  // Leaderboard Methods
  getLeaderboards(active?: boolean): Promise<Leaderboard[]>;
  getLeaderboardById(id: number): Promise<Leaderboard | undefined>;
  createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard>;
  updateLeaderboard(id: number, active: boolean): Promise<Leaderboard | undefined>;
  getLeaderboard(timeframe: string, scope: string): Promise<any[]>;

  // Leaderboard Entry Methods
  getLeaderboardEntries(leaderboardId: number): Promise<LeaderboardEntry[]>;
  getAthleteLeaderboardEntry(leaderboardId: number, athleteId: number): Promise<LeaderboardEntry | undefined>;
  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  updateLeaderboardEntry(id: number, value: number, rank?: number): Promise<LeaderboardEntry | undefined>;
  
  // Team Methods
  getTeam(id: number): Promise<Team | undefined>;
  getAthleteTeams(athleteId: number): Promise<Team[]>;
  getCoachTeams(coachId: number): Promise<Team[]>;
  getTeamsForCoach(userId: number): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  
  // Team Member Methods
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getTeamMember(teamId: number, athleteId: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  removeTeamMember(id: number): Promise<boolean>;
  
  // Team Event Methods
  getTeamEvents(teamId: number): Promise<TeamEvent[]>;
  getTeamEvent(id: number): Promise<TeamEvent | undefined>;
  createTeamEvent(event: InsertTeamEvent): Promise<TeamEvent>;
  updateTeamEvent(id: number, event: Partial<InsertTeamEvent>): Promise<TeamEvent | undefined>;
  
  // Team Event Attendance Methods
  getTeamEventAttendance(eventId: number): Promise<TeamEventAttendance[]>;
  getAthleteTeamEventAttendance(eventId: number, athleteId: number): Promise<TeamEventAttendance | undefined>;
  createTeamEventAttendance(attendance: InsertTeamEventAttendance): Promise<TeamEventAttendance>;
  updateTeamEventAttendance(id: number, attendance: Partial<InsertTeamEventAttendance>): Promise<TeamEventAttendance | undefined>;
  
  // Team Announcement Methods
  getTeamAnnouncements(teamId: number): Promise<TeamAnnouncement[]>;
  getTeamAnnouncement(id: number): Promise<TeamAnnouncement | undefined>;
  createTeamAnnouncement(announcement: InsertTeamAnnouncement): Promise<TeamAnnouncement>;
  updateTeamAnnouncement(id: number, announcement: Partial<InsertTeamAnnouncement>): Promise<TeamAnnouncement | undefined>;
  
  // Recruiting Analytics Methods
  getRecruitingAnalytics(athleteId: number): Promise<RecruitingAnalytics | undefined>;
  createRecruitingAnalytics(analytics: InsertRecruitingAnalytics): Promise<RecruitingAnalytics>;
  updateRecruitingAnalytics(id: number, analytics: Partial<InsertRecruitingAnalytics>): Promise<RecruitingAnalytics | undefined>;
  incrementProfileViews(athleteId: number): Promise<RecruitingAnalytics | undefined>;
  
  // Recruiting Messages Methods
  getRecruitingMessages(athleteId: number): Promise<RecruitingMessage[]>;
  getRecruitingMessageById(id: number): Promise<RecruitingMessage | undefined>;
  createRecruitingMessage(message: InsertRecruitingMessage): Promise<RecruitingMessage>;
  markRecruitingMessageAsRead(id: number): Promise<RecruitingMessage | undefined>;

  // Session Store
  sessionStore: any; // Use any for session store to avoid type issues
  
  // Saved Colleges Methods
  getSavedColleges(userId: number): Promise<any[]>; // Return college details, not just saved college records
  saveCollege(userId: number, collegeId: number): Promise<SavedCollege>;
  unsaveCollege(userId: number, collegeId: number): Promise<boolean>;
  isCollegeSaved(userId: number, collegeId: number): Promise<boolean>;
  
  // Achievement Methods
  getAchievements(category?: string): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Athlete Achievement Methods
  getAthleteAchievements(athleteId: number): Promise<AthleteAchievement[]>;
  getAthleteAchievement(athleteId: number, achievementId: number): Promise<AthleteAchievement | undefined>;
  getAthleteAchievementByStringId(athleteId: number, achievementStringId: string): Promise<AthleteAchievement | undefined>;
  createAthleteAchievement(athleteAchievement: InsertAthleteAchievement): Promise<AthleteAchievement>;
  updateAthleteAchievement(id: number, updates: Partial<InsertAthleteAchievement>): Promise<AthleteAchievement | undefined>;
  
  // Achievement Progress Methods
  getAchievementProgressByUserId(userId: number): Promise<any[]>;
  getAchievementProgressByAthleteId(athleteId: number): Promise<any[]>;
  updateAchievementProgress(userId: number, achievementId: string, progress: number): Promise<any>;
  
  // Leaderboard Methods
  getLeaderboards(active?: boolean): Promise<Leaderboard[]>;
  getLeaderboardById(id: number): Promise<Leaderboard | undefined>;
  getLeaderboard(timeframe: string, scope: string): Promise<any[]>;
  // Additional methods for future implementation
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  
  // Import gamification methods
  getAthleteAchievements = getAthleteAchievements;
  getAthleteAchievementByStringId = getAthleteAchievementByStringId;
  getAchievementProgressByUserId = getAchievementProgressByUserId;
  getAchievementProgressByAthleteId = getAchievementProgressByAthleteId;
  updateAchievementProgress = updateAchievementProgress;
  getLeaderboard = getLeaderboard;
  private athletesMap: Map<number, Athlete>;
  private parentsMap: Map<number, Parent>;
  private coachesMap: Map<number, Coach>;
  private parentAthleteRelationshipsMap: Map<number, ParentAthleteRelationship>;
  private savedCollegesMap: Map<number, SavedCollege>;
  private combineMetricsMap: Map<number, CombineMetric>;
  private exerciseLibraryMap: Map<number, ExerciseLibrary>;
  private workoutSessionsMap: Map<number, WorkoutSession>;
  private strengthConditioningMap: Map<number, StrengthConditioning>;
  private nutritionInfoMap: Map<number, NutritionInfo>;
  private recruitingPreferencesMap: Map<number, RecruitingPreferences>;
  private recruitingProfilesMap: Map<number, RecruitingProfile>;
  private trainingPlansMap: Map<number, TrainingPlan>;
  private performanceInsightsMap: Map<number, PerformanceInsights>;
  private coachMessagesMap: Map<number, CoachMessage>;
  private nutritionPlansMap: Map<number, NutritionPlan>;
  private mealLogsMap: Map<number, MealLog>;
  private aiMealSuggestionsMap: Map<number, AiMealSuggestion>;
  private socialConnectionsMap: Map<number, SocialConnection>;
  private socialPostsMap: Map<number, SocialPost>;
  private socialCommentsMap: Map<number, any>;
  private achievementsMap: Map<number, Achievement>;
  private athleteAchievementsMap: Map<number, AthleteAchievement>;
  private leaderboardsMap: Map<number, Leaderboard>;
  private leaderboardEntriesMap: Map<number, LeaderboardEntry>;
  private recruitingAnalyticsMap: Map<number, RecruitingAnalytics>;
  private recruitingMessagesMap: Map<number, RecruitingMessage>;
  private teamsMap: Map<number, Team>;
  private teamMembersMap: Map<number, TeamMember>;
  private teamEventsMap: Map<number, TeamEvent>;
  private teamEventAttendanceMap: Map<number, TeamEventAttendance>;
  private teamAnnouncementsMap: Map<number, TeamAnnouncement>;
  
  currentUserId: number = 0;
  currentAthleteId: number = 0;
  currentParentId: number = 0;
  currentCoachId: number = 0;
  currentParentAthleteRelationshipId: number = 0;
  currentCombineMetricsId: number = 0;
  currentExerciseLibraryId: number = 0;
  currentWorkoutSessionId: number = 0;
  currentStrengthConditioningId: number = 0;
  currentNutritionInfoId: number = 0;
  currentRecruitingPreferencesId: number = 0;
  currentRecruitingProfileId: number = 0;
  currentTrainingPlanId: number = 0;
  currentPerformanceInsightsId: number = 0;
  currentCoachMessageId: number = 0;
  currentNutritionPlanId: number = 0;
  currentMealLogId: number = 0;
  currentAiMealSuggestionId: number = 0;
  currentSocialConnectionId: number = 0;
  currentSocialPostId: number = 0;
  currentSocialCommentId: number = 0;
  currentAchievementId: number = 0;
  currentAthleteAchievementId: number = 0;
  currentLeaderboardId: number = 0;
  currentLeaderboardEntryId: number = 0;
  currentTeamId: number = 0;
  currentSavedCollegeId: number = 0;
  currentTeamMemberId: number = 0;
  currentTeamEventId: number = 0;
  currentTeamEventAttendanceId: number = 0;
  currentTeamAnnouncementId: number = 0;
  currentRecruitingAnalyticsId: number = 0;
  currentRecruitingMessageId: number = 0;
  sessionStore: any;

  constructor() {
    this.usersMap = new Map();
    this.athletesMap = new Map();
    this.parentsMap = new Map();
    this.coachesMap = new Map();
    this.parentAthleteRelationshipsMap = new Map();
    this.savedCollegesMap = new Map();
    this.combineMetricsMap = new Map();
    this.exerciseLibraryMap = new Map();
    this.workoutSessionsMap = new Map();
    this.strengthConditioningMap = new Map();
    this.nutritionInfoMap = new Map();
    this.recruitingPreferencesMap = new Map();
    this.recruitingProfilesMap = new Map();
    this.trainingPlansMap = new Map();
    this.performanceInsightsMap = new Map();
    this.coachMessagesMap = new Map();
    this.nutritionPlansMap = new Map();
    this.mealLogsMap = new Map();
    this.aiMealSuggestionsMap = new Map();
    this.socialConnectionsMap = new Map();
    this.socialPostsMap = new Map();
    this.socialCommentsMap = new Map();
    this.achievementsMap = new Map();
    this.athleteAchievementsMap = new Map();
    this.leaderboardsMap = new Map();
    this.leaderboardEntriesMap = new Map();
    this.teamsMap = new Map();
    this.teamMembersMap = new Map();
    this.teamEventsMap = new Map();
    this.teamEventAttendanceMap = new Map();
    this.teamAnnouncementsMap = new Map();
    this.recruitingAnalyticsMap = new Map();
    this.recruitingMessagesMap = new Map();
    
    this.currentUserId = 1;
    this.currentAthleteId = 1;
    this.currentCombineMetricsId = 1;
    this.currentExerciseLibraryId = 1;
    this.currentWorkoutSessionId = 1;
    this.currentStrengthConditioningId = 1;
    this.currentNutritionInfoId = 1;
    this.currentRecruitingPreferencesId = 1;
    this.currentRecruitingProfileId = 1;
    this.currentTrainingPlanId = 1;
    this.currentPerformanceInsightsId = 1;
    this.currentCoachMessageId = 1;
    this.currentNutritionPlanId = 1;
    this.currentMealLogId = 1;
    this.currentAiMealSuggestionId = 1;
    this.currentSocialConnectionId = 1;
    this.currentSocialPostId = 1;
    this.currentSocialCommentId = 1;
    this.currentAchievementId = 1;
    this.currentAthleteAchievementId = 1;
    this.currentLeaderboardId = 1;
    this.currentLeaderboardEntryId = 1;
    this.currentTeamId = 1;
    this.currentTeamMemberId = 1;
    this.currentTeamEventId = 1;
    this.currentTeamEventAttendanceId = 1;
    this.currentTeamAnnouncementId = 1;
    this.currentRecruitingAnalyticsId = 1;
    this.currentRecruitingMessageId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    // Set default values for any required fields that might be undefined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      userType: insertUser.userType || "athlete"
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Athlete Methods
  async getAthlete(id: number): Promise<Athlete | undefined> {
    return this.athletesMap.get(id);
  }

  async getAthleteByUserId(userId: number): Promise<Athlete | undefined> {
    return Array.from(this.athletesMap.values()).find(
      (athlete) => athlete.userId === userId,
    );
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const id = this.currentAthleteId++;
    // Set null for optional fields that might be undefined
    const athlete: Athlete = { 
      ...insertAthlete, 
      id,
      height: insertAthlete.height ?? null,
      weight: insertAthlete.weight ?? null,
      bodyFat: insertAthlete.bodyFat ?? null,
      school: insertAthlete.school ?? null,
      grade: insertAthlete.grade ?? null,
      graduationYear: insertAthlete.graduationYear ?? null,
      gpa: insertAthlete.gpa ?? null,
      actScore: insertAthlete.actScore ?? null,
      targetDivision: insertAthlete.targetDivision ?? null,
      profileImage: insertAthlete.profileImage ?? null,
      profileVisibility: insertAthlete.profileVisibility ?? true,
      hudlLink: insertAthlete.hudlLink ?? null,
      maxPrepsLink: insertAthlete.maxPrepsLink ?? null,
      subscriptionTier: insertAthlete.subscriptionTier ?? "free",
      subscriptionRenewal: insertAthlete.subscriptionRenewal ?? null
    };
    this.athletesMap.set(id, athlete);
    return athlete;
  }

  async updateAthlete(id: number, athleteUpdate: Partial<InsertAthlete>): Promise<Athlete | undefined> {
    const athlete = await this.getAthlete(id);
    if (!athlete) return undefined;
    
    const updatedAthlete: Athlete = { ...athlete, ...athleteUpdate };
    this.athletesMap.set(id, updatedAthlete);
    return updatedAthlete;
  }
  
  async getAllAthletes(): Promise<Athlete[]> {
    return Array.from(this.athletesMap.values());
  }

  // Combine Metrics Methods
  async getCombineMetrics(athleteId: number): Promise<CombineMetric[]> {
    return Array.from(this.combineMetricsMap.values()).filter(
      (metrics) => metrics.athleteId === athleteId,
    ).sort((a, b) => b.dateRecorded.getTime() - a.dateRecorded.getTime());
  }

  async getLatestCombineMetrics(athleteId: number): Promise<CombineMetric | undefined> {
    const metrics = await this.getCombineMetrics(athleteId);
    return metrics.length > 0 ? metrics[0] : undefined;
  }

  async createCombineMetrics(insertMetrics: InsertCombineMetric): Promise<CombineMetric> {
    const id = this.currentCombineMetricsId++;
    const dateRecorded = new Date();
    // Set null for optional fields that might be undefined
    const metrics: CombineMetric = { 
      ...insertMetrics, 
      id, 
      dateRecorded,
      fortyYard: insertMetrics.fortyYard ?? null,
      shuttle: insertMetrics.shuttle ?? null,
      verticalJump: insertMetrics.verticalJump ?? null,
      broadJump: insertMetrics.broadJump ?? null,
      benchPress: insertMetrics.benchPress ?? null
    };
    this.combineMetricsMap.set(id, metrics);
    return metrics;
  }

  // Training Plan Methods
  async getTrainingPlans(athleteId: number): Promise<TrainingPlan[]> {
    return Array.from(this.trainingPlansMap.values()).filter(
      (plan) => plan.athleteId === athleteId,
    ).sort((a, b) => {
      if (a.date > b.date) return 1;
      if (a.date < b.date) return -1;
      return 0;
    });
  }

  async getTrainingPlanByDate(athleteId: number, date: Date): Promise<TrainingPlan | undefined> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.trainingPlansMap.values()).find(plan => {
      // Handle plan.date as string (it's stored as YYYY-MM-DD)
      return plan.athleteId === athleteId && plan.date === dateString;
    });
  }

  async createTrainingPlan(insertPlan: InsertTrainingPlan): Promise<TrainingPlan> {
    const id = this.currentTrainingPlanId++;
    // Set null for optional fields that might be undefined
    const plan: TrainingPlan = { 
      ...insertPlan, 
      id,
      completed: insertPlan.completed ?? false,
      coachTip: insertPlan.coachTip ?? null
    };
    this.trainingPlansMap.set(id, plan);
    return plan;
  }

  async updateTrainingPlan(id: number, planUpdate: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined> {
    const plan = this.trainingPlansMap.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: TrainingPlan = { ...plan, ...planUpdate };
    this.trainingPlansMap.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async getTrainingPlanById(id: number): Promise<TrainingPlan | undefined> {
    return this.trainingPlansMap.get(id);
  }
  
  // Exercise Library Methods
  async getExercises(category?: string, difficulty?: string, position?: string): Promise<ExerciseLibrary[]> {
    let exercises = Array.from(this.exerciseLibraryMap.values());
    
    if (category) {
      exercises = exercises.filter(ex => ex.category === category);
    }
    
    if (difficulty) {
      exercises = exercises.filter(ex => ex.difficulty === difficulty);
    }
    
    if (position) {
      exercises = exercises.filter(ex => {
        // Check if exercise is position-specific and the position is in the positions array
        if (ex.positionSpecific) {
          const positions = ex.positions as string[];
          return positions.includes(position);
        }
        return false;
      });
    }
    
    return exercises;
  }
  
  async getExerciseById(id: number): Promise<ExerciseLibrary | undefined> {
    return this.exerciseLibraryMap.get(id);
  }
  
  async createExercise(insertExercise: InsertExerciseLibrary): Promise<ExerciseLibrary> {
    const id = this.currentExerciseLibraryId++;
    const createdAt = new Date();
    const exercise: ExerciseLibrary = { 
      ...insertExercise, 
      id, 
      createdAt
    };
    this.exerciseLibraryMap.set(id, exercise);
    return exercise;
  }
  
  async updateExercise(id: number, updates: Partial<InsertExerciseLibrary>): Promise<ExerciseLibrary | undefined> {
    const existingExercise = this.exerciseLibraryMap.get(id);
    if (!existingExercise) return undefined;
    
    const updatedExercise: ExerciseLibrary = {
      ...existingExercise,
      ...updates
    };
    
    this.exerciseLibraryMap.set(id, updatedExercise);
    return updatedExercise;
  }
  
  // Workout Session Methods
  async getWorkoutSessions(athleteId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessionsMap.values())
      .filter(session => session.athleteId === athleteId)
      .sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }
  
  async getWorkoutSessionById(id: number): Promise<WorkoutSession | undefined> {
    return this.workoutSessionsMap.get(id);
  }
  
  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentWorkoutSessionId++;
    const session: WorkoutSession = {
      ...insertSession,
      id,
      endTime: insertSession.endTime ?? null,
      duration: insertSession.duration ?? null,
      rating: insertSession.rating ?? null,
      perceivedExertion: insertSession.perceivedExertion ?? null,
      notes: insertSession.notes ?? null,
      location: insertSession.location ?? null,
      energyLevel: insertSession.energyLevel ?? null,
      weatherConditions: insertSession.weatherConditions ?? null
    };
    this.workoutSessionsMap.set(id, session);
    return session;
  }
  
  async updateWorkoutSession(id: number, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined> {
    const existingSession = this.workoutSessionsMap.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession: WorkoutSession = {
      ...existingSession,
      ...updates
    };
    
    this.workoutSessionsMap.set(id, updatedSession);
    return updatedSession;
  }
  
  // Performance Insights Methods
  async getPerformanceInsights(athleteId: number): Promise<PerformanceInsights | undefined> {
    for (const insights of this.performanceInsightsMap.values()) {
      if (insights.athleteId === athleteId) {
        return insights;
      }
    }
    return undefined;
  }
  
  async createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights> {
    const id = this.currentPerformanceInsightsId++;
    const now = new Date();
    
    const newInsights: PerformanceInsights = {
      id,
      ...insights,
      lastUpdated: now
    };
    
    this.performanceInsightsMap.set(id, newInsights);
    return newInsights;
  }
  
  async updatePerformanceInsights(
    athleteId: number, 
    insights: Partial<InsertPerformanceInsights>
  ): Promise<PerformanceInsights> {
    const existingInsights = await this.getPerformanceInsights(athleteId);
    
    if (!existingInsights) {
      // If no insights exist yet, create new ones
      return this.createPerformanceInsights({
        athleteId,
        strengths: insights.strengths || [],
        weaknesses: insights.weaknesses || [],
        recommendations: insights.recommendations || [],
        performanceTrend: insights.performanceTrend || "stable",
        positionRanking: insights.positionRanking || null,
        improvementAreas: insights.improvementAreas || [],
        recentAchievements: insights.recentAchievements || []
      });
    }
    
    // Update existing insights
    const updatedInsights: PerformanceInsights = {
      ...existingInsights,
      ...insights,
      lastUpdated: new Date()
    };
    
    this.performanceInsightsMap.set(existingInsights.id, updatedInsights);
    return updatedInsights;
  }
  
  // For API endpoint /api/athlete/:id/metrics
  async getAthleteMetrics(athleteId: number): Promise<CombineMetric[]> {
    return this.getCombineMetrics(athleteId);
  }

  // Coach Messages Methods
  async getCoachMessages(athleteId: number): Promise<CoachMessage[]> {
    return Array.from(this.coachMessagesMap.values())
      .filter((message) => message.athleteId === athleteId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createCoachMessage(insertMessage: InsertCoachMessage): Promise<CoachMessage> {
    const id = this.currentCoachMessageId++;
    const createdAt = new Date();
    // Set defaults for optional fields that might be undefined
    const message: CoachMessage = { 
      ...insertMessage, 
      id, 
      createdAt,
      role: insertMessage.role || "assistant",
      read: insertMessage.read ?? false
    };
    this.coachMessagesMap.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<CoachMessage | undefined> {
    const message = this.coachMessagesMap.get(id);
    if (!message) return undefined;
    
    const updatedMessage: CoachMessage = { ...message, read: true };
    this.coachMessagesMap.set(id, updatedMessage);
    return updatedMessage;
  }

  // Nutrition Plan Methods
  async getNutritionPlans(athleteId: number): Promise<NutritionPlan[]> {
    return Array.from(this.nutritionPlansMap.values())
      .filter((plan) => plan.athleteId === athleteId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveNutritionPlan(athleteId: number): Promise<NutritionPlan | undefined> {
    return Array.from(this.nutritionPlansMap.values()).find(
      (plan) => plan.athleteId === athleteId && plan.active === true
    );
  }

  async createNutritionPlan(insertPlan: InsertNutritionPlan): Promise<NutritionPlan> {
    const id = this.currentNutritionPlanId++;
    const createdAt = new Date();
    
    // When creating a new active plan, deactivate any existing active plans
    if (insertPlan.active) {
      const currentActivePlan = await this.getActiveNutritionPlan(insertPlan.athleteId);
      if (currentActivePlan) {
        await this.updateNutritionPlan(currentActivePlan.id, false);
      }
    }

    const plan: NutritionPlan = { 
      ...insertPlan, 
      id,
      createdAt,
      active: insertPlan.active ?? true
    };
    
    this.nutritionPlansMap.set(id, plan);
    return plan;
  }

  async updateNutritionPlan(id: number, active: boolean): Promise<NutritionPlan | undefined> {
    const plan = this.nutritionPlansMap.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: NutritionPlan = { ...plan, active };
    this.nutritionPlansMap.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Strength & Conditioning Methods
  async getStrengthConditioning(athleteId: number): Promise<StrengthConditioning | undefined> {
    // Find the strength & conditioning profile for this athlete
    for (const sc of this.strengthConditioningMap.values()) {
      if (sc.athleteId === athleteId) {
        return sc;
      }
    }
    return undefined;
  }
  
  async createStrengthConditioning(insertSC: InsertStrengthConditioning): Promise<StrengthConditioning> {
    const id = this.currentStrengthConditioningId++;
    const updatedAt = new Date();
    
    const sc: StrengthConditioning = {
      ...insertSC,
      id,
      updatedAt
    };
    
    this.strengthConditioningMap.set(id, sc);
    return sc;
  }
  
  async updateStrengthConditioning(id: number, scUpdate: Partial<InsertStrengthConditioning>): Promise<StrengthConditioning | undefined> {
    const sc = this.strengthConditioningMap.get(id);
    
    if (!sc) {
      return undefined;
    }
    
    const updatedSC: StrengthConditioning = { 
      ...sc, 
      ...scUpdate,
      updatedAt: new Date()
    };
    
    this.strengthConditioningMap.set(id, updatedSC);
    return updatedSC;
  }
  
  // Nutrition Info Methods
  async getNutritionInfo(athleteId: number): Promise<NutritionInfo | undefined> {
    // Find the nutrition info for this athlete
    for (const ni of this.nutritionInfoMap.values()) {
      if (ni.athleteId === athleteId) {
        return ni;
      }
    }
    return undefined;
  }
  
  async createNutritionInfo(insertNI: InsertNutritionInfo): Promise<NutritionInfo> {
    const id = this.currentNutritionInfoId++;
    const updatedAt = new Date();
    
    const ni: NutritionInfo = {
      ...insertNI,
      id,
      updatedAt
    };
    
    this.nutritionInfoMap.set(id, ni);
    return ni;
  }
  
  async updateNutritionInfo(id: number, niUpdate: Partial<InsertNutritionInfo>): Promise<NutritionInfo | undefined> {
    const ni = this.nutritionInfoMap.get(id);
    
    if (!ni) {
      return undefined;
    }
    
    const updatedNI: NutritionInfo = { 
      ...ni, 
      ...niUpdate,
      updatedAt: new Date()
    };
    
    this.nutritionInfoMap.set(id, updatedNI);
    return updatedNI;
  }
  
  // Recruiting Preferences Methods
  async getRecruitingPreferences(athleteId: number): Promise<RecruitingPreferences | undefined> {
    // Find the recruiting preferences for this athlete
    for (const rp of this.recruitingPreferencesMap.values()) {
      if (rp.athleteId === athleteId) {
        return rp;
      }
    }
    return undefined;
  }
  
  async createRecruitingPreferences(insertRP: InsertRecruitingPreferences): Promise<RecruitingPreferences> {
    const id = this.currentRecruitingPreferencesId++;
    const updatedAt = new Date();
    
    const rp: RecruitingPreferences = {
      ...insertRP,
      id,
      updatedAt
    };
    
    this.recruitingPreferencesMap.set(id, rp);
    return rp;
  }
  
  async updateRecruitingPreferences(id: number, rpUpdate: Partial<InsertRecruitingPreferences>): Promise<RecruitingPreferences | undefined> {
    const rp = this.recruitingPreferencesMap.get(id);
    
    if (!rp) {
      return undefined;
    }
    
    const updatedRP: RecruitingPreferences = { 
      ...rp, 
      ...rpUpdate,
      updatedAt: new Date()
    };
    
    this.recruitingPreferencesMap.set(id, updatedRP);
    return updatedRP;
  }

  // Recruiting Profile Methods
  async getRecruitingProfile(athleteId: number): Promise<RecruitingProfile | undefined> {
    for (const profile of this.recruitingProfilesMap.values()) {
      if (profile.athleteId === athleteId) {
        return profile;
      }
    }
    return undefined;
  }

  async createRecruitingProfile(profile: InsertRecruitingProfile): Promise<RecruitingProfile> {
    const id = this.currentRecruitingProfileId++;
    
    const newProfile: RecruitingProfile = {
      id,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.recruitingProfilesMap.set(id, newProfile);
    return newProfile;
  }

  async updateRecruitingProfile(id: number, profileData: Partial<InsertRecruitingProfile>): Promise<RecruitingProfile | undefined> {
    const profile = this.recruitingProfilesMap.get(id);
    
    if (!profile) {
      return undefined;
    }
    
    const updatedProfile: RecruitingProfile = { 
      ...profile, 
      ...profileData,
      updatedAt: new Date()
    };
    
    this.recruitingProfilesMap.set(id, updatedProfile);
    return updatedProfile;
  }

  // Meal Log Methods
  async getMealLogs(athleteId: number, date?: Date): Promise<MealLog[]> {
    let mealLogs = Array.from(this.mealLogsMap.values()).filter(
      (log) => log.athleteId === athleteId
    );
    
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      mealLogs = mealLogs.filter(log => {
        // Handle log.date as string (it's stored as YYYY-MM-DD)
        return log.date === dateString;
      });
    }
    
    return mealLogs.sort((a, b) => {
      // First sort by date
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      
      // Then sort by meal type (breakfast, lunch, dinner, snack)
      const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
      return mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] - 
             mealTypeOrder[b.mealType as keyof typeof mealTypeOrder];
    });
  }

  async createMealLog(insertMealLog: InsertMealLog): Promise<MealLog> {
    const id = this.currentMealLogId++;
    
    const mealLog: MealLog = { 
      ...insertMealLog, 
      id,
      protein: insertMealLog.protein ?? null,
      carbs: insertMealLog.carbs ?? null,
      fat: insertMealLog.fat ?? null,
      notes: insertMealLog.notes ?? null
    };
    
    this.mealLogsMap.set(id, mealLog);
    return mealLog;
  }

  // AI Meal Suggestion Methods
  async getAiMealSuggestions(athleteId: number, mealType?: string, goal?: string): Promise<AiMealSuggestion[]> {
    let suggestions = Array.from(this.aiMealSuggestionsMap.values()).filter(
      (suggestion) => suggestion.athleteId === athleteId
    );
    
    if (mealType) {
      suggestions = suggestions.filter(suggestion => suggestion.mealType === mealType);
    }
    
    if (goal) {
      suggestions = suggestions.filter(suggestion => suggestion.goal === goal);
    }
    
    return suggestions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAiMealSuggestion(insertSuggestion: InsertAiMealSuggestion): Promise<AiMealSuggestion> {
    const id = this.currentAiMealSuggestionId++;
    const createdAt = new Date();
    
    const suggestion: AiMealSuggestion = { 
      ...insertSuggestion, 
      id,
      createdAt
    };
    
    this.aiMealSuggestionsMap.set(id, suggestion);
    return suggestion;
  }

  // Social Connection Methods
  async getSocialConnections(userId: number): Promise<SocialConnection[]> {
    return Array.from(this.socialConnectionsMap.values())
      .filter((connection) => connection.userId === userId)
      .sort((a, b) => a.platform.localeCompare(b.platform));
  }

  async getSocialConnectionByPlatform(userId: number, platform: string): Promise<SocialConnection | undefined> {
    return Array.from(this.socialConnectionsMap.values()).find(
      (connection) => connection.userId === userId && connection.platform === platform && connection.connected === true
    );
  }

  async createSocialConnection(insertConnection: InsertSocialConnection): Promise<SocialConnection> {
    const id = this.currentSocialConnectionId++;
    const createdAt = new Date();
    
    // Check if connection to this platform already exists, if so, update it instead
    const existingConnection = await this.getSocialConnectionByPlatform(
      insertConnection.userId, 
      insertConnection.platform
    );
    
    if (existingConnection) {
      // Update existing connection
      const updatedConnection = await this.updateSocialConnection(existingConnection.id, {
        ...insertConnection,
        connected: true
      });
      
      return updatedConnection!;
    }
    
    // Create new connection
    const connection: SocialConnection = {
      id,
      userId: insertConnection.userId,
      platform: insertConnection.platform,
      username: insertConnection.username ?? null,
      createdAt,
      accessToken: insertConnection.accessToken as string | null ?? null,
      refreshToken: insertConnection.refreshToken ?? null,
      tokenExpiry: insertConnection.tokenExpiry ?? null,
      connected: insertConnection.connected as boolean | null ?? true,
    };
    
    this.socialConnectionsMap.set(id, connection);
    return connection;
  }

  async updateSocialConnection(id: number, connectionUpdate: Partial<InsertSocialConnection>): Promise<SocialConnection | undefined> {
    const connection = this.socialConnectionsMap.get(id);
    if (!connection) return undefined;
    
    const updatedConnection: SocialConnection = { ...connection, ...connectionUpdate };
    this.socialConnectionsMap.set(id, updatedConnection);
    return updatedConnection;
  }

  async disconnectSocialConnection(id: number): Promise<SocialConnection | undefined> {
    const connection = this.socialConnectionsMap.get(id);
    if (!connection) return undefined;
    
    const updatedConnection: SocialConnection = { ...connection, connected: false };
    this.socialConnectionsMap.set(id, updatedConnection);
    return updatedConnection;
  }

  // Social Post Methods
  async getSocialPosts(options: any): Promise<SocialPost[]> {
    const { filter, userId, limit = 10, offset = 0 } = options;
    
    // Get all posts
    let posts = Array.from(this.socialPostsMap.values());
    
    // Filter based on provided criteria
    if (filter === "team") {
      // Find teams the user is a member of
      const teamMemberships = Array.from(this.teamMembersMap.values())
        .filter(member => member.athleteId === userId)
        .map(member => member.teamId);
      
      // Get posts from team members
      const teamMemberIds = Array.from(this.teamMembersMap.values())
        .filter(member => teamMemberships.includes(member.teamId))
        .map(member => member.athleteId);
      
      // Get user IDs from athlete IDs
      const userIds = Array.from(this.athletesMap.values())
        .filter(athlete => teamMemberIds.includes(athlete.id))
        .map(athlete => athlete.userId);
      
      // Filter posts by team members
      posts = posts.filter(post => userIds.includes(post.userId));
    } else if (filter === "achievements") {
      // Filter posts with achievements
      posts = posts.filter(post => post.achievementId !== null);
    }
    
    // Sort posts (most recent first)
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    posts = posts.slice(offset, offset + limit);
    
    // Enhance posts with additional data
    return posts.map(post => {
      // Check if user has liked this post
      const hasLiked = (post.likes || []).includes(userId);
      
      // Count comments
      const commentCount = Array.from(this.socialCommentsMap?.values() || [])
        .filter(comment => comment.postId === post.id)
        .length;
      
      // Get author info
      const author = this.getUserForPost(post.userId);
      
      // Get achievement info if available
      let achievement = null;
      if (post.achievementId) {
        const achievementData = this.achievementsMap.get(post.achievementId);
        if (achievementData) {
          achievement = {
            id: achievementData.id,
            name: achievementData.name,
            badge: achievementData.badge,
            description: achievementData.description,
            type: achievementData.category
          };
        }
      }
      
      // Get training plan info if available
      let trainingPlan = null;
      if (post.trainingPlanId) {
        const planData = this.trainingPlansMap.get(post.trainingPlanId);
        if (planData) {
          trainingPlan = {
            id: planData.id,
            title: planData.title,
            focus: planData.focus,
            exerciseCount: planData.exercises?.length || 0
          };
        }
      }
      
      return {
        ...post,
        likes: (post.likes || []).length,
        comments: commentCount,
        hasLiked,
        isOwner: post.userId === userId,
        author,
        achievement,
        trainingPlan
      };
    });
  }

  async getSocialPostById(id: number): Promise<SocialPost | undefined> {
    return this.socialPostsMap.get(id);
  }

  async createSocialPost(post: any): Promise<SocialPost> {
    const id = this.currentSocialPostId++;
    const createdAt = new Date();
    
    // Convert the post to the format expected by the database
    const socialPost: SocialPost = {
      id,
      userId: post.userId,
      content: post.content,
      createdAt,
      platforms: [],
      status: "published",
      mediaUrl: post.media || null,
      postedAt: new Date(),
      scheduledFor: null,
      errorMessage: null,
      likes: [],
      achievementId: post.achievementId || null,
      trainingPlanId: post.trainingPlanId || null,
      gameStatsId: post.gameStatsId || null,
      combineMetricsId: post.combineMetricsId || null
    };
    
    this.socialPostsMap.set(id, socialPost);
    return socialPost;
  }
  
  async updateSocialPost(id: number, updates: any): Promise<SocialPost | undefined> {
    const post = this.socialPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.socialPostsMap.set(id, updatedPost);
    
    return updatedPost;
  }

  async updateSocialPostStatus(id: number, status: string, postedAt?: Date, errorMessage?: string): Promise<SocialPost | undefined> {
    const post = this.socialPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost: SocialPost = {
      ...post,
      status,
      postedAt: postedAt ?? post.postedAt,
      errorMessage: errorMessage ?? post.errorMessage
    };
    
    this.socialPostsMap.set(id, updatedPost);
    return updatedPost;
  }
  
  // Helper method to get user info for post author
  private getUserForPost(userId: number) {
    const user = this.usersMap.get(userId);
    if (!user) return null;
    
    const athlete = Array.from(this.athletesMap.values()).find(a => a.userId === userId);
    
    return {
      id: userId,
      name: athlete ? `${athlete.firstName} ${athlete.lastName}` : user.username,
      username: user.username,
      profileImage: athlete?.profileImage || null,
      position: athlete?.position || null
    };
  }
  
  async deleteSocialPost(id: number): Promise<boolean> {
    const exists = this.socialPostsMap.has(id);
    if (!exists) return false;
    
    this.socialPostsMap.delete(id);
    return true;
  }
  
  async toggleSocialPostLike(postId: number, userId: number): Promise<boolean> {
    const post = this.socialPostsMap.get(postId);
    if (!post) return false;
    
    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = [];
    }
    
    // Check if user has already liked the post
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // User hasn't liked the post yet, add like
      post.likes.push(userId);
      this.socialPostsMap.set(postId, post);
      return true;
    } else {
      // User already liked the post, remove like
      post.likes.splice(likeIndex, 1);
      this.socialPostsMap.set(postId, post);
      return false;
    }
  }
  
  async getSocialPostComments(postId: number): Promise<any[]> {
    return Array.from(this.socialCommentsMap.values())
      .filter(comment => comment.postId === postId)
      .map(comment => {
        // Get author info
        const author = this.getUserForPost(comment.userId);
        
        // Check if the commenter has liked this comment
        const hasLiked = (comment.likes || []).includes(comment.userId);
        
        return {
          ...comment,
          likes: (comment.likes || []).length,
          hasLiked,
          isOwner: true, // For simplicity, make all comments owned by the current user
          author
        };
      })
      .sort((a, b) => {
        // Sort by createdAt (oldest first for comments)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }
  
  async getSocialCommentById(id: number): Promise<any | undefined> {
    return this.socialCommentsMap.get(id);
  }
  
  async createSocialComment(comment: any): Promise<any> {
    const id = this.currentSocialCommentId++;
    const createdAt = new Date();
    
    const newComment = {
      id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      parentId: comment.parentId || null,
      createdAt,
      likes: []
    };
    
    this.socialCommentsMap.set(id, newComment);
    return newComment;
  }
  
  async toggleSocialCommentLike(commentId: number, userId: number): Promise<boolean> {
    const comment = this.socialCommentsMap.get(commentId);
    if (!comment) return false;
    
    // Initialize likes array if it doesn't exist
    if (!comment.likes) {
      comment.likes = [];
    }
    
    // Check if user has already liked the comment
    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // User hasn't liked the comment yet, add like
      comment.likes.push(userId);
      this.socialCommentsMap.set(commentId, comment);
      return true;
    } else {
      // User already liked the comment, remove like
      comment.likes.splice(likeIndex, 1);
      this.socialCommentsMap.set(commentId, comment);
      return false;
    }
  }
  
  async deleteSocialComment(id: number): Promise<boolean> {
    const exists = this.socialCommentsMap.has(id);
    if (!exists) return false;
    
    this.socialCommentsMap.delete(id);
    return true;
  }
  
  // Athlete connections methods
  async getAthleteConnections(athleteId: number): Promise<SocialConnection[]> {
    const athlete = this.athletesMap.get(athleteId);
    if (!athlete) return [];
    
    return Array.from(this.socialConnectionsMap.values())
      .filter(connection => connection.userId === athlete.userId);
  }
  
  async upsertAthleteConnection(athleteId: number, connection: any): Promise<SocialConnection> {
    const athlete = this.athletesMap.get(athleteId);
    if (!athlete) {
      throw new Error("Athlete not found");
    }
    
    // Check if connection already exists
    const existingConnection = Array.from(this.socialConnectionsMap.values())
      .find(conn => conn.userId === athlete.userId && conn.platform === connection.platform);
    
    if (existingConnection) {
      // Update existing connection
      return this.updateSocialConnection(existingConnection.id, {
        username: connection.username,
        connected: connection.connected
      });
    } else {
      // Create new connection
      return this.createSocialConnection({
        userId: athlete.userId,
        platform: connection.platform,
        username: connection.username,
        connected: connection.connected || false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null
      });
    }
  }

  // Achievement Methods
  async getAchievements(category?: string): Promise<Achievement[]> {
    let achievements = Array.from(this.achievementsMap.values());
    
    if (category) {
      achievements = achievements.filter(achievement => achievement.type === category);
    }
    
    return achievements.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievementsMap.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const createdAt = new Date();
    
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      createdAt
    };
    
    this.achievementsMap.set(id, achievement);
    return achievement;
  }

  // Athlete Achievement Methods
  async getAthleteAchievements(athleteId: number): Promise<AthleteAchievement[]> {
    return Array.from(this.athleteAchievementsMap.values())
      .filter((athleteAchievement) => athleteAchievement.athleteId === athleteId)
      .sort((a, b) => {
        // Sort by completed status (completed first)
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        
        // Then by earnedAt date (most recent first) if available
        if (a.earnedAt && b.earnedAt) {
          return b.earnedAt.getTime() - a.earnedAt.getTime();
        }
        return 0;
      });
  }

  async getAthleteAchievement(athleteId: number, achievementId: number): Promise<AthleteAchievement | undefined> {
    // Find the athlete achievement with the specified athleteId and achievementId
    const athleteAchievements = Array.from(this.athleteAchievementsMap.values());
    return athleteAchievements.find(aa => 
      aa.athleteId === athleteId && aa.achievementId === achievementId
    );
  }

  async createAthleteAchievement(insertAthleteAchievement: InsertAthleteAchievement): Promise<AthleteAchievement> {
    const id = this.currentAthleteAchievementId++;
    
    const athleteAchievement: AthleteAchievement = {
      ...insertAthleteAchievement,
      id,
      earnedAt: insertAthleteAchievement.earnedAt ?? new Date(),
      progress: insertAthleteAchievement.progress ?? 0,
      completed: insertAthleteAchievement.completed ?? false
    };
    
    this.athleteAchievementsMap.set(id, athleteAchievement);
    return athleteAchievement;
  }
  
  async updateAthleteAchievement(id: number, updates: Partial<InsertAthleteAchievement>): Promise<AthleteAchievement | undefined> {
    const athleteAchievement = this.athleteAchievementsMap.get(id);
    if (!athleteAchievement) return undefined;
    
    // If progress is provided and reaches 100%, automatically set completed to true if not specified
    if (updates.progress !== undefined && updates.progress >= 100 && updates.completed === undefined) {
      updates.completed = true;
    }
    
    // If completed is true and earnedAt isn't set, set it to now
    if (updates.completed === true && !athleteAchievement.earnedAt) {
      updates.earnedAt = new Date();
    }
    
    // Ensure progress is between 0-100 if provided
    if (updates.progress !== undefined) {
      updates.progress = Math.min(Math.max(0, updates.progress), 100);
    }
    
    const updatedAthleteAchievement: AthleteAchievement = {
      ...athleteAchievement,
      ...updates
    };
    
    this.athleteAchievementsMap.set(id, updatedAthleteAchievement);
    return updatedAthleteAchievement;
  }

  // Leaderboard Methods
  async getLeaderboards(active?: boolean): Promise<Leaderboard[]> {
    let leaderboards = Array.from(this.leaderboardsMap.values());
    
    if (active !== undefined) {
      leaderboards = leaderboards.filter(leaderboard => leaderboard.active === active);
    }
    
    return leaderboards.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getLeaderboardById(id: number): Promise<Leaderboard | undefined> {
    return this.leaderboardsMap.get(id);
  }

  async createLeaderboard(insertLeaderboard: InsertLeaderboard): Promise<Leaderboard> {
    const id = this.currentLeaderboardId++;
    
    const leaderboard: Leaderboard = {
      ...insertLeaderboard,
      id,
      startDate: insertLeaderboard.startDate ?? null,
      endDate: insertLeaderboard.endDate ?? null,
      active: insertLeaderboard.active ?? true
    };
    
    this.leaderboardsMap.set(id, leaderboard);
    return leaderboard;
  }

  async updateLeaderboard(id: number, active: boolean): Promise<Leaderboard | undefined> {
    const leaderboard = this.leaderboardsMap.get(id);
    if (!leaderboard) return undefined;
    
    const updatedLeaderboard: Leaderboard = { ...leaderboard, active };
    this.leaderboardsMap.set(id, updatedLeaderboard);
    return updatedLeaderboard;
  }

  // Leaderboard Entry Methods
  async getLeaderboardEntries(leaderboardId: number): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntriesMap.values())
      .filter((entry) => entry.leaderboardId === leaderboardId)
      .sort((a, b) => {
        // Sort by rank (ascending)
        if (a.rank !== null && b.rank !== null) {
          return a.rank - b.rank;
        }
        
        // If ranks are null, sort by value (descending)
        return b.value - a.value;
      });
  }

  async getAthleteLeaderboardEntry(leaderboardId: number, athleteId: number): Promise<LeaderboardEntry | undefined> {
    return Array.from(this.leaderboardEntriesMap.values()).find(
      (entry) => entry.leaderboardId === leaderboardId && entry.athleteId === athleteId
    );
  }

  async createLeaderboardEntry(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const id = this.currentLeaderboardEntryId++;
    const updatedAt = new Date();
    
    // Check if entry for this athlete on this leaderboard already exists
    const existingEntry = await this.getAthleteLeaderboardEntry(
      insertEntry.leaderboardId,
      insertEntry.athleteId
    );
    
    if (existingEntry) {
      // Create a default entry in case update fails
      const defaultUpdatedEntry: LeaderboardEntry = {
        ...existingEntry,
        value: insertEntry.value,
        updatedAt: new Date()
      };
      
      // Try to update existing entry with new value
      const updated = await this.updateLeaderboardEntry(existingEntry.id, insertEntry.value);
      return updated || defaultUpdatedEntry;
    }
    
    // Create new entry
    const entry: LeaderboardEntry = {
      ...insertEntry,
      id,
      updatedAt,
      rank: insertEntry.rank ?? null
    };
    
    this.leaderboardEntriesMap.set(id, entry);
    
    // Update rankings after adding new entry
    await this.recalculateLeaderboardRankings(insertEntry.leaderboardId);
    
    return entry;
  }

  async updateLeaderboardEntry(id: number, value: number, rank?: number): Promise<LeaderboardEntry | undefined> {
    const entry = this.leaderboardEntriesMap.get(id);
    if (!entry) return undefined;
    
    const updatedEntry: LeaderboardEntry = {
      ...entry,
      value,
      rank: rank !== undefined ? rank : entry.rank,
      updatedAt: new Date()
    };
    
    this.leaderboardEntriesMap.set(id, updatedEntry);
    
    // Recalculate rankings when values change
    await this.recalculateLeaderboardRankings(entry.leaderboardId);
    
    return updatedEntry;
  }

  // Helper method to recalculate rankings on a leaderboard
  private async recalculateLeaderboardRankings(leaderboardId: number): Promise<void> {
    const entries = Array.from(this.leaderboardEntriesMap.values())
      .filter(entry => entry.leaderboardId === leaderboardId)
      .sort((a, b) => b.value - a.value); // Sort by value (descending)
    
    // Update rank for each entry
    entries.forEach((entry, index) => {
      const rank = index + 1; // Ranks start at 1
      this.leaderboardEntriesMap.set(entry.id, { ...entry, rank });
    });
  }
  
  // Team Methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teamsMap.values()).filter(team => team.isActive !== false);
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teamsMap.get(id);
  }
  
  async getAthleteTeams(athleteId: number): Promise<Team[]> {
    // First, get all team memberships for this athlete
    const teamMemberships = Array.from(this.teamMembersMap.values()).filter(
      (member) => member.athleteId === athleteId
    );
    
    // Then, get all teams this athlete is a member of
    const teamIds = teamMemberships.map(membership => membership.teamId);
    const teams = teamIds.map(teamId => this.teamsMap.get(teamId)).filter(Boolean) as Team[];
    
    return teams;
  }
  
  async getCoachTeams(coachId: number): Promise<Team[]> {
    return Array.from(this.teamsMap.values()).filter(
      (team) => team.coachId === coachId
    );
  }
  
  async getTeamsForCoach(userId: number): Promise<Team[]> {
    const teams: Team[] = [];
    
    // Get all team members where this user is a coach or assistant coach
    for (const teamMember of this.teamMembersMap.values()) {
      if (teamMember.userId === userId && 
          (teamMember.role === 'coach' || teamMember.role === 'assistant_coach')) {
        const team = await this.getTeam(teamMember.teamId);
        if (team) {
          teams.push(team);
        }
      }
    }
    
    return teams;
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const createdAt = new Date();
    
    const team: Team = {
      ...insertTeam,
      id,
      createdAt,
      bannerImage: insertTeam.bannerImage ?? null,
      logoImage: insertTeam.logoImage ?? null,
      description: insertTeam.description ?? null,
      website: insertTeam.website ?? null,
      location: insertTeam.location ?? null,
      homeField: insertTeam.homeField ?? null
    };
    
    this.teamsMap.set(id, team);
    return team;
  }
  
  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teamsMap.get(id);
    if (!team) return undefined;
    
    const updatedTeam: Team = { ...team, ...teamUpdate };
    this.teamsMap.set(id, updatedTeam);
    return updatedTeam;
  }
  
  // Team Member Methods
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembersMap.values()).filter(
      (member) => member.teamId === teamId
    );
  }
  
  async getTeamMember(teamId: number, athleteId: number): Promise<TeamMember | undefined> {
    return Array.from(this.teamMembersMap.values()).find(
      (member) => member.teamId === teamId && member.athleteId === athleteId
    );
  }
  
  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentTeamMemberId++;
    const joinedAt = new Date();
    
    const member: TeamMember = {
      ...insertMember,
      id,
      joinedAt,
      role: insertMember.role ?? "player",
      number: insertMember.number ?? null,
      position: insertMember.position ?? null,
      status: insertMember.status ?? "active"
    };
    
    this.teamMembersMap.set(id, member);
    return member;
  }
  
  async updateTeamMember(id: number, memberUpdate: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const member = this.teamMembersMap.get(id);
    if (!member) return undefined;
    
    const updatedMember: TeamMember = { ...member, ...memberUpdate };
    this.teamMembersMap.set(id, updatedMember);
    return updatedMember;
  }
  
  async removeTeamMember(id: number): Promise<boolean> {
    return this.teamMembersMap.delete(id);
  }
  
  // Team Event Methods
  async getTeamEvents(teamId: number): Promise<TeamEvent[]> {
    return Array.from(this.teamEventsMap.values())
      .filter((event) => event.teamId === teamId)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }
  
  async getTeamEvent(id: number): Promise<TeamEvent | undefined> {
    return this.teamEventsMap.get(id);
  }
  
  async createTeamEvent(insertEvent: InsertTeamEvent): Promise<TeamEvent> {
    const id = this.currentTeamEventId++;
    const createdAt = new Date();
    
    const event: TeamEvent = {
      ...insertEvent,
      id,
      createdAt,
      location: insertEvent.location ?? null,
      description: insertEvent.description ?? null,
      opponent: insertEvent.opponent ?? null,
      requiredEquipment: insertEvent.requiredEquipment ?? null
    };
    
    this.teamEventsMap.set(id, event);
    return event;
  }
  
  async updateTeamEvent(id: number, eventUpdate: Partial<InsertTeamEvent>): Promise<TeamEvent | undefined> {
    const event = this.teamEventsMap.get(id);
    if (!event) return undefined;
    
    const updatedEvent: TeamEvent = { ...event, ...eventUpdate };
    this.teamEventsMap.set(id, updatedEvent);
    return updatedEvent;
  }
  
  // Team Event Attendance Methods
  async getTeamEventAttendance(eventId: number): Promise<TeamEventAttendance[]> {
    return Array.from(this.teamEventAttendanceMap.values()).filter(
      (attendance) => attendance.eventId === eventId
    );
  }
  
  async getAthleteTeamEventAttendance(eventId: number, athleteId: number): Promise<TeamEventAttendance | undefined> {
    return Array.from(this.teamEventAttendanceMap.values()).find(
      (attendance) => attendance.eventId === eventId && attendance.athleteId === athleteId
    );
  }
  
  async createTeamEventAttendance(insertAttendance: InsertTeamEventAttendance): Promise<TeamEventAttendance> {
    const id = this.currentTeamEventAttendanceId++;
    const updatedAt = new Date();
    
    const attendance: TeamEventAttendance = {
      ...insertAttendance,
      id,
      updatedAt,
      status: insertAttendance.status ?? "undecided",
      notes: insertAttendance.notes ?? null
    };
    
    this.teamEventAttendanceMap.set(id, attendance);
    return attendance;
  }
  
  async updateTeamEventAttendance(id: number, attendanceUpdate: Partial<InsertTeamEventAttendance>): Promise<TeamEventAttendance | undefined> {
    const attendance = this.teamEventAttendanceMap.get(id);
    if (!attendance) return undefined;
    
    const updatedAt = new Date();
    const updatedAttendance: TeamEventAttendance = { 
      ...attendance, 
      ...attendanceUpdate,
      updatedAt
    };
    
    this.teamEventAttendanceMap.set(id, updatedAttendance);
    return updatedAttendance;
  }
  
  // Team Announcement Methods
  async getTeamAnnouncements(teamId: number): Promise<TeamAnnouncement[]> {
    return Array.from(this.teamAnnouncementsMap.values())
      .filter((announcement) => announcement.teamId === teamId)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()); // newest first
  }
  
  async getTeamAnnouncement(id: number): Promise<TeamAnnouncement | undefined> {
    return this.teamAnnouncementsMap.get(id);
  }
  
  async createTeamAnnouncement(insertAnnouncement: InsertTeamAnnouncement): Promise<TeamAnnouncement> {
    const id = this.currentTeamAnnouncementId++;
    const publishedAt = new Date();
    
    const announcement: TeamAnnouncement = {
      ...insertAnnouncement,
      id,
      publishedAt,
      image: insertAnnouncement.image ?? null,
      attachmentLink: insertAnnouncement.attachmentLink ?? null
    };
    
    this.teamAnnouncementsMap.set(id, announcement);
    return announcement;
  }
  
  async updateTeamAnnouncement(id: number, announcementUpdate: Partial<InsertTeamAnnouncement>): Promise<TeamAnnouncement | undefined> {
    const announcement = this.teamAnnouncementsMap.get(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement: TeamAnnouncement = { ...announcement, ...announcementUpdate };
    this.teamAnnouncementsMap.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  // -- Recruiting Analytics Methods --
  private readonly recruitingAnalyticsMap = new Map<number, RecruitingAnalytics>();
  private recruitingAnalyticsId = 1;

  async getRecruitingAnalytics(athleteId: number): Promise<RecruitingAnalytics | undefined> {
    return Array.from(this.recruitingAnalyticsMap.values()).find(a => a.athleteId === athleteId);
  }

  async createRecruitingAnalytics(analytics: InsertRecruitingAnalytics): Promise<RecruitingAnalytics> {
    const id = this.recruitingAnalyticsId++;
    const newAnalytics: RecruitingAnalytics = {
      ...analytics,
      id,
      profileViews: analytics.profileViews || 0,
      uniqueViewers: analytics.uniqueViewers || 0,
      interestLevel: analytics.interestLevel || 0,
      bookmarksCount: analytics.bookmarksCount || 0,
      messagesSent: analytics.messagesSent || 0,
      connectionsCount: analytics.connectionsCount || 0,
      lastUpdated: new Date()
    };
    this.recruitingAnalyticsMap.set(id, newAnalytics);
    return newAnalytics;
  }

  async updateRecruitingAnalytics(id: number, analytics: Partial<InsertRecruitingAnalytics>): Promise<RecruitingAnalytics | undefined> {
    const existing = this.recruitingAnalyticsMap.get(id);
    if (!existing) return undefined;

    const updated: RecruitingAnalytics = {
      ...existing,
      ...analytics,
      lastUpdated: new Date()
    };
    this.recruitingAnalyticsMap.set(id, updated);
    return updated;
  }

  async incrementProfileViews(athleteId: number): Promise<RecruitingAnalytics | undefined> {
    const analytics = await this.getRecruitingAnalytics(athleteId);
    if (!analytics) return undefined;

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Parse the views over time array
    let viewsOverTime = JSON.parse(analytics.viewsOverTime as string) as Array<{ date: string; count: number }>;
    
    // Find if there's an entry for today
    const todayIndex = viewsOverTime.findIndex(v => v.date === today);
    
    if (todayIndex >= 0) {
      // Increment today's count
      viewsOverTime[todayIndex].count++;
    } else {
      // Add a new entry for today
      viewsOverTime.push({ date: today, count: 1 });
    }
    
    const profileViews = (analytics.profileViews || 0) + 1;
    
    const updated: RecruitingAnalytics = {
      ...analytics,
      profileViews,
      viewsOverTime: JSON.stringify(viewsOverTime),
      lastUpdated: new Date()
    };
    
    this.recruitingAnalyticsMap.set(analytics.id, updated);
    return updated;
  }

  // -- Recruiting Messages Methods --
  private readonly recruitingMessagesMap = new Map<number, RecruitingMessage>();
  private recruitingMessageId = 1;

  async getRecruitingMessages(athleteId: number): Promise<RecruitingMessage[]> {
    const athlete = await this.getAthlete(athleteId);
    if (!athlete) return [];
    
    return Array.from(this.recruitingMessagesMap.values()).filter(m => {
      // Find messages where the athlete is either the recipient or sender
      return m.recipientId === athlete.userId || m.senderId === athlete.userId;
    });
  }

  async getRecruitingMessageById(id: number): Promise<RecruitingMessage | undefined> {
    return this.recruitingMessagesMap.get(id);
  }

  async createRecruitingMessage(message: InsertRecruitingMessage): Promise<RecruitingMessage> {
    const id = this.recruitingMessageId++;
    const newMessage: RecruitingMessage = {
      ...message,
      id,
      read: message.read || false,
      isReply: message.isReply || false,
      schoolName: message.schoolName || null,
      attachment: message.attachment || null,
      parentMessageId: message.parentMessageId || null,
      sentAt: new Date()
    };
    this.recruitingMessagesMap.set(id, newMessage);
    return newMessage;
  }

  async markRecruitingMessageAsRead(id: number): Promise<RecruitingMessage | undefined> {
    const message = this.recruitingMessagesMap.get(id);
    if (!message) return undefined;

    const updated: RecruitingMessage = {
      ...message,
      read: true
    };
    this.recruitingMessagesMap.set(id, updated);
    return updated;
  }
}

// Import parent and coach methods
import * as parentCoachMethods from './parent-coach-storage';

// Import saved colleges methods
import * as savedCollegesMethods from './saved-colleges-storage';

// Add parent/coach methods to MemStorage prototype
MemStorage.prototype.getParent = parentCoachMethods.getParent;
MemStorage.prototype.getParentByUserId = parentCoachMethods.getParentByUserId;
MemStorage.prototype.createParent = parentCoachMethods.createParent;
MemStorage.prototype.updateParent = parentCoachMethods.updateParent;
MemStorage.prototype.getAllParents = parentCoachMethods.getAllParents;
MemStorage.prototype.deleteParent = parentCoachMethods.deleteParent;
MemStorage.prototype.getParentAthleteRelationship = parentCoachMethods.getParentAthleteRelationship;
MemStorage.prototype.getParentAthleteRelationshipsByParentId = parentCoachMethods.getParentAthleteRelationshipsByParentId;
MemStorage.prototype.getParentAthleteRelationshipsByAthleteId = parentCoachMethods.getParentAthleteRelationshipsByAthleteId;
MemStorage.prototype.getParentAthleteRelationships = parentCoachMethods.getParentAthleteRelationships;
MemStorage.prototype.getAthleteParents = parentCoachMethods.getAthleteParents;
MemStorage.prototype.createParentAthleteRelationship = parentCoachMethods.createParentAthleteRelationship;
MemStorage.prototype.updateParentAthleteRelationship = parentCoachMethods.updateParentAthleteRelationship;
MemStorage.prototype.deleteParentAthleteRelationship = parentCoachMethods.deleteParentAthleteRelationship;
MemStorage.prototype.getCoach = parentCoachMethods.getCoach;
MemStorage.prototype.getCoachByUserId = parentCoachMethods.getCoachByUserId;
MemStorage.prototype.createCoach = parentCoachMethods.createCoach;
MemStorage.prototype.updateCoach = parentCoachMethods.updateCoach;
MemStorage.prototype.getCoachesByTeam = parentCoachMethods.getCoachesByTeam;
MemStorage.prototype.getAllCoaches = parentCoachMethods.getAllCoaches;
MemStorage.prototype.deleteCoach = parentCoachMethods.deleteCoach;

// Add saved colleges methods to MemStorage prototype
MemStorage.prototype.getSavedColleges = savedCollegesMethods.getSavedColleges;
MemStorage.prototype.saveCollege = savedCollegesMethods.saveCollege;
MemStorage.prototype.unsaveCollege = savedCollegesMethods.unsaveCollege;
MemStorage.prototype.isCollegeSaved = savedCollegesMethods.isCollegeSaved;

// Add gamification methods to MemStorage prototype
import * as gamificationMethods from './gamification-storage';
MemStorage.prototype.getAthleteAchievements = gamificationMethods.getAthleteAchievements;
MemStorage.prototype.getAthleteAchievementByStringId = gamificationMethods.getAthleteAchievementByStringId;
MemStorage.prototype.getAchievementProgressByUserId = gamificationMethods.getAchievementProgressByUserId;
MemStorage.prototype.getAchievementProgressByAthleteId = gamificationMethods.getAchievementProgressByAthleteId;
MemStorage.prototype.updateAchievementProgress = gamificationMethods.updateAchievementProgress;
MemStorage.prototype.getLeaderboard = gamificationMethods.getLeaderboard;

// Add a method to add team members (not defined elsewhere)
MemStorage.prototype.addTeamMember = async function(teamMember: InsertTeamMember): Promise<TeamMember> {
  const id = ++this.currentTeamMemberId;
  const joinedAt = new Date();
  
  const newTeamMember: TeamMember = {
    id,
    ...teamMember,
    joinedAt
  };
  
  this.teamMembersMap.set(id, newTeamMember);
  return newTeamMember;
};

export const storage = new MemStorage();
