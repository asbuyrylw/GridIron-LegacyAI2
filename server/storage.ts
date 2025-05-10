import { 
  users, type User, type InsertUser, 
  athletes, type Athlete, type InsertAthlete,
  combineMetrics, type CombineMetric, type InsertCombineMetric,
  trainingPlans, type TrainingPlan, type InsertTrainingPlan,
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
  recruitingPreferences, type RecruitingPreferences, type InsertRecruitingPreferences
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Athlete Methods
  getAthlete(id: number): Promise<Athlete | undefined>;
  getAthleteByUserId(userId: number): Promise<Athlete | undefined>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  updateAthlete(id: number, athlete: Partial<InsertAthlete>): Promise<Athlete | undefined>;
  getAllAthletes(): Promise<Athlete[]>;
  
  // Combine Metrics Methods
  getCombineMetrics(athleteId: number): Promise<CombineMetric[]>;
  getLatestCombineMetrics(athleteId: number): Promise<CombineMetric | undefined>;
  createCombineMetrics(metrics: InsertCombineMetric): Promise<CombineMetric>;
  
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
  
  // Training Plan Methods
  getTrainingPlans(athleteId: number): Promise<TrainingPlan[]>;
  getTrainingPlanByDate(athleteId: number, date: Date): Promise<TrainingPlan | undefined>;
  createTrainingPlan(plan: InsertTrainingPlan): Promise<TrainingPlan>;
  updateTrainingPlan(id: number, plan: Partial<InsertTrainingPlan>): Promise<TrainingPlan | undefined>;
  
  // Coach Messages Methods
  getCoachMessages(athleteId: number): Promise<CoachMessage[]>;
  createCoachMessage(message: InsertCoachMessage): Promise<CoachMessage>;
  markMessageAsRead(id: number): Promise<CoachMessage | undefined>;

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

  // Social Post Methods
  getSocialPosts(userId: number): Promise<SocialPost[]>;
  getSocialPostById(id: number): Promise<SocialPost | undefined>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  updateSocialPostStatus(id: number, status: string, postedAt?: Date, errorMessage?: string): Promise<SocialPost | undefined>;

  // Achievement Methods
  getAchievements(category?: string): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Athlete Achievement Methods
  getAthleteAchievements(athleteId: number): Promise<AthleteAchievement[]>;
  getAthleteAchievementById(id: number): Promise<AthleteAchievement | undefined>;
  createAthleteAchievement(athleteAchievement: InsertAthleteAchievement): Promise<AthleteAchievement>;
  updateAthleteAchievementProgress(id: number, progress: number, completed?: boolean): Promise<AthleteAchievement | undefined>;

  // Leaderboard Methods
  getLeaderboards(active?: boolean): Promise<Leaderboard[]>;
  getLeaderboardById(id: number): Promise<Leaderboard | undefined>;
  createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard>;
  updateLeaderboard(id: number, active: boolean): Promise<Leaderboard | undefined>;

  // Leaderboard Entry Methods
  getLeaderboardEntries(leaderboardId: number): Promise<LeaderboardEntry[]>;
  getAthleteLeaderboardEntry(leaderboardId: number, athleteId: number): Promise<LeaderboardEntry | undefined>;
  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  updateLeaderboardEntry(id: number, value: number, rank?: number): Promise<LeaderboardEntry | undefined>;

  // Session Store
  sessionStore: any; // Use any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private athletesMap: Map<number, Athlete>;
  private combineMetricsMap: Map<number, CombineMetric>;
  private strengthConditioningMap: Map<number, StrengthConditioning>;
  private nutritionInfoMap: Map<number, NutritionInfo>;
  private recruitingPreferencesMap: Map<number, RecruitingPreferences>;
  private trainingPlansMap: Map<number, TrainingPlan>;
  private coachMessagesMap: Map<number, CoachMessage>;
  private nutritionPlansMap: Map<number, NutritionPlan>;
  private mealLogsMap: Map<number, MealLog>;
  private aiMealSuggestionsMap: Map<number, AiMealSuggestion>;
  private socialConnectionsMap: Map<number, SocialConnection>;
  private socialPostsMap: Map<number, SocialPost>;
  private achievementsMap: Map<number, Achievement>;
  private athleteAchievementsMap: Map<number, AthleteAchievement>;
  private leaderboardsMap: Map<number, Leaderboard>;
  private leaderboardEntriesMap: Map<number, LeaderboardEntry>;
  
  currentUserId: number;
  currentAthleteId: number;
  currentCombineMetricsId: number;
  currentStrengthConditioningId: number;
  currentNutritionInfoId: number;
  currentRecruitingPreferencesId: number;
  currentTrainingPlanId: number;
  currentCoachMessageId: number;
  currentNutritionPlanId: number;
  currentMealLogId: number;
  currentAiMealSuggestionId: number;
  currentSocialConnectionId: number;
  currentSocialPostId: number;
  currentAchievementId: number;
  currentAthleteAchievementId: number;
  currentLeaderboardId: number;
  currentLeaderboardEntryId: number;
  sessionStore: any;

  constructor() {
    this.usersMap = new Map();
    this.athletesMap = new Map();
    this.combineMetricsMap = new Map();
    this.strengthConditioningMap = new Map();
    this.nutritionInfoMap = new Map();
    this.recruitingPreferencesMap = new Map();
    this.trainingPlansMap = new Map();
    this.coachMessagesMap = new Map();
    this.nutritionPlansMap = new Map();
    this.mealLogsMap = new Map();
    this.aiMealSuggestionsMap = new Map();
    this.socialConnectionsMap = new Map();
    this.socialPostsMap = new Map();
    this.achievementsMap = new Map();
    this.athleteAchievementsMap = new Map();
    this.leaderboardsMap = new Map();
    this.leaderboardEntriesMap = new Map();
    
    this.currentUserId = 1;
    this.currentAthleteId = 1;
    this.currentCombineMetricsId = 1;
    this.currentStrengthConditioningId = 1;
    this.currentNutritionInfoId = 1;
    this.currentRecruitingPreferencesId = 1;
    this.currentTrainingPlanId = 1;
    this.currentCoachMessageId = 1;
    this.currentNutritionPlanId = 1;
    this.currentMealLogId = 1;
    this.currentAiMealSuggestionId = 1;
    this.currentSocialConnectionId = 1;
    this.currentSocialPostId = 1;
    this.currentAchievementId = 1;
    this.currentAthleteAchievementId = 1;
    this.currentLeaderboardId = 1;
    this.currentLeaderboardEntryId = 1;
    
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
  async getSocialPosts(userId: number): Promise<SocialPost[]> {
    return Array.from(this.socialPostsMap.values())
      .filter((post) => post.userId === userId)
      .sort((a, b) => {
        // First sort by scheduledFor (if available)
        if (a.scheduledFor && b.scheduledFor) {
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        }
        
        // Then by createdAt (most recent first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async getSocialPostById(id: number): Promise<SocialPost | undefined> {
    return this.socialPostsMap.get(id);
  }

  async createSocialPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const id = this.currentSocialPostId++;
    const createdAt = new Date();
    
    const post: SocialPost = {
      ...insertPost,
      id,
      createdAt,
      status: insertPost.status ?? "pending",
      scheduledFor: insertPost.scheduledFor ?? null,
      postedAt: null,
      errorMessage: null,
      mediaUrl: insertPost.mediaUrl ?? null
    };
    
    this.socialPostsMap.set(id, post);
    return post;
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

  // Achievement Methods
  async getAchievements(category?: string): Promise<Achievement[]> {
    let achievements = Array.from(this.achievementsMap.values());
    
    if (category) {
      achievements = achievements.filter(achievement => achievement.category === category);
    }
    
    return achievements.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAchievementById(id: number): Promise<Achievement | undefined> {
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
        
        // Then by earnedAt date (most recent first)
        return b.earnedAt.getTime() - a.earnedAt.getTime();
      });
  }

  async getAthleteAchievementById(id: number): Promise<AthleteAchievement | undefined> {
    return this.athleteAchievementsMap.get(id);
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

  async updateAthleteAchievementProgress(id: number, progress: number, completed?: boolean): Promise<AthleteAchievement | undefined> {
    const athleteAchievement = this.athleteAchievementsMap.get(id);
    if (!athleteAchievement) return undefined;
    
    const isNewlyCompleted = completed ?? (progress >= 100);
    
    const updatedAthleteAchievement: AthleteAchievement = {
      ...athleteAchievement,
      progress: Math.min(Math.max(0, progress), 100), // Ensure progress is between 0-100
      completed: isNewlyCompleted
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
}

export const storage = new MemStorage();
