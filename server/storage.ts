import { 
  users, type User, type InsertUser, 
  athletes, type Athlete, type InsertAthlete,
  combineMetrics, type CombineMetric, type InsertCombineMetric,
  trainingPlans, type TrainingPlan, type InsertTrainingPlan,
  coachMessages, type CoachMessage, type InsertCoachMessage,
  nutritionPlans, type NutritionPlan, type InsertNutritionPlan,
  mealLogs, type MealLog, type InsertMealLog,
  aiMealSuggestions, type AiMealSuggestion, type InsertAiMealSuggestion
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

  // Session Store
  sessionStore: any; // Use any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private athletesMap: Map<number, Athlete>;
  private combineMetricsMap: Map<number, CombineMetric>;
  private trainingPlansMap: Map<number, TrainingPlan>;
  private coachMessagesMap: Map<number, CoachMessage>;
  private nutritionPlansMap: Map<number, NutritionPlan>;
  private mealLogsMap: Map<number, MealLog>;
  private aiMealSuggestionsMap: Map<number, AiMealSuggestion>;
  
  currentUserId: number;
  currentAthleteId: number;
  currentCombineMetricsId: number;
  currentTrainingPlanId: number;
  currentCoachMessageId: number;
  currentNutritionPlanId: number;
  currentMealLogId: number;
  currentAiMealSuggestionId: number;
  sessionStore: any;

  constructor() {
    this.usersMap = new Map();
    this.athletesMap = new Map();
    this.combineMetricsMap = new Map();
    this.trainingPlansMap = new Map();
    this.coachMessagesMap = new Map();
    this.nutritionPlansMap = new Map();
    this.mealLogsMap = new Map();
    this.aiMealSuggestionsMap = new Map();
    
    this.currentUserId = 1;
    this.currentAthleteId = 1;
    this.currentCombineMetricsId = 1;
    this.currentTrainingPlanId = 1;
    this.currentCoachMessageId = 1;
    this.currentNutritionPlanId = 1;
    this.currentMealLogId = 1;
    this.currentAiMealSuggestionId = 1;
    
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
}

export const storage = new MemStorage();
