import { randomBytes } from 'crypto';
import { storage } from './storage';
import { 
  ParentAccess, 
  InsertParentAccess, 
  ParentInvite,
  EmailNotificationType
} from '../shared/parent-access';

// In-memory storage for parent access
class ParentAccessService {
  private parentAccessMap: Map<number, ParentAccess>;
  private currentId: number = 0;

  constructor() {
    this.parentAccessMap = new Map();
  }

  // Create a new parent access entry
  async createParentAccess(data: InsertParentAccess): Promise<ParentAccess> {
    const id = ++this.currentId;
    const accessToken = this.generateAccessToken();
    
    const parentAccess: ParentAccess = {
      id,
      ...data,
      accessToken,
      createdAt: new Date(),
      lastEmailSent: null,
      active: true
    };
    
    this.parentAccessMap.set(id, parentAccess);
    return parentAccess;
  }

  // Generate a secure access token
  private generateAccessToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Get parent access by token
  async getParentAccessByToken(token: string): Promise<ParentAccess | undefined> {
    return Array.from(this.parentAccessMap.values()).find(
      access => access.accessToken === token && access.active
    );
  }

  // Get parent access by email and athlete ID
  async getParentAccessByEmail(email: string, athleteId: number): Promise<ParentAccess | undefined> {
    return Array.from(this.parentAccessMap.values()).find(
      access => access.email === email && access.athleteId === athleteId && access.active
    );
  }

  // Get all parent access entries for an athlete
  async getParentAccessesByAthleteId(athleteId: number): Promise<ParentAccess[]> {
    return Array.from(this.parentAccessMap.values()).filter(
      access => access.athleteId === athleteId && access.active
    );
  }

  // Update parent access
  async updateParentAccess(id: number, data: Partial<InsertParentAccess>): Promise<ParentAccess | undefined> {
    const access = this.parentAccessMap.get(id);
    if (!access) return undefined;

    const updated = { ...access, ...data };
    this.parentAccessMap.set(id, updated);
    return updated;
  }

  // Deactivate parent access
  async deactivateParentAccess(id: number): Promise<boolean> {
    const access = this.parentAccessMap.get(id);
    if (!access) return false;

    access.active = false;
    this.parentAccessMap.set(id, access);
    return true;
  }

  // Handle sending an email to parent
  async sendEmail(parentAccess: ParentAccess, type: EmailNotificationType, data: any): Promise<boolean> {
    // This is a placeholder for email sending functionality
    // We'll implement the actual email sending later with SendGrid
    console.log(`Email of type ${type} would be sent to ${parentAccess.email} with data:`, data);
    
    // Update last email sent timestamp
    parentAccess.lastEmailSent = new Date();
    this.parentAccessMap.set(parentAccess.id, parentAccess);
    
    return true;
  }

  // Process a parent invitation
  async inviteParent(invite: ParentInvite): Promise<ParentAccess> {
    // Check if this parent already has access
    const existingAccess = await this.getParentAccessByEmail(invite.email, invite.athleteId);
    if (existingAccess) {
      // Update preferences if needed
      if (existingAccess.receiveUpdates !== invite.receiveUpdates || 
          existingAccess.receiveNutritionInfo !== invite.receiveNutritionInfo) {
        await this.updateParentAccess(existingAccess.id, {
          receiveUpdates: invite.receiveUpdates,
          receiveNutritionInfo: invite.receiveNutritionInfo
        });
      }
      return existingAccess;
    }

    // Create new parent access
    const parentAccess = await this.createParentAccess({
      athleteId: invite.athleteId,
      email: invite.email,
      name: invite.name,
      relationship: invite.relationship,
      receiveUpdates: invite.receiveUpdates,
      receiveNutritionInfo: invite.receiveNutritionInfo,
    });

    // Send invitation email (will be implemented later)
    
    return parentAccess;
  }

  // Generate a secure URL for parent dashboard access
  getParentDashboardUrl(accessToken: string): string {
    return `/parent-view?token=${accessToken}`;
  }
}

export const parentAccessService = new ParentAccessService();