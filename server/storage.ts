import { 
  users, type User, type InsertUser, 
  athletes, type Athlete, type InsertAthlete,
  combineMetrics, type CombineMetric, type InsertCombineMetric,
  trainingPlans, type TrainingPlan, type InsertTrainingPlan,
  coachMessages, type CoachMessage, type InsertCoachMessage
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

  // Session Store
  sessionStore: any; // Use any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private athletesMap: Map<number, Athlete>;
  private combineMetricsMap: Map<number, CombineMetric>;
  private trainingPlansMap: Map<number, TrainingPlan>;
  private coachMessagesMap: Map<number, CoachMessage>;
  
  currentUserId: number;
  currentAthleteId: number;
  currentCombineMetricsId: number;
  currentTrainingPlanId: number;
  currentCoachMessageId: number;
  sessionStore: any;

  constructor() {
    this.usersMap = new Map();
    this.athletesMap = new Map();
    this.combineMetricsMap = new Map();
    this.trainingPlansMap = new Map();
    this.coachMessagesMap = new Map();
    
    this.currentUserId = 1;
    this.currentAthleteId = 1;
    this.currentCombineMetricsId = 1;
    this.currentTrainingPlanId = 1;
    this.currentCoachMessageId = 1;
    
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
    const user: User = { ...insertUser, id, createdAt };
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
    const athlete: Athlete = { ...insertAthlete, id };
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
    const metrics: CombineMetric = { ...insertMetrics, id, dateRecorded };
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
    const plan: TrainingPlan = { ...insertPlan, id };
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
    const message: CoachMessage = { ...insertMessage, id, createdAt };
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
}

export const storage = new MemStorage();
