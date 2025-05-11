// Implementation of recruiting methods for MemStorage class

import { MemStorage } from "./storage";
import { InsertRecruitingAnalytics, InsertRecruitingMessage } from "@shared/schema";

// Recruiting Analytics Methods
export async function getRecruitingAnalytics(this: MemStorage, athleteId: number) {
  return Array.from(this.recruitingAnalyticsMap.values()).find(a => a.athleteId === athleteId);
}

export async function createRecruitingAnalytics(this: MemStorage, analytics: InsertRecruitingAnalytics) {
  const newAnalytics = {
    ...analytics,
    id: this.currentRecruitingAnalyticsId++,
    lastUpdated: new Date()
  };
  this.recruitingAnalyticsMap.set(newAnalytics.id, newAnalytics);
  return newAnalytics;
}

export async function updateRecruitingAnalytics(this: MemStorage, id: number, analytics: Partial<InsertRecruitingAnalytics>) {
  const existing = this.recruitingAnalyticsMap.get(id);
  if (!existing) return undefined;
  
  const updated = {
    ...existing,
    ...analytics,
    lastUpdated: new Date()
  };
  
  this.recruitingAnalyticsMap.set(id, updated);
  return updated;
}

export async function incrementProfileViews(this: MemStorage, athleteId: number) {
  let analytics = await this.getRecruitingAnalytics(athleteId);
  
  if (!analytics) {
    // Create new analytics record if it doesn't exist
    analytics = await this.createRecruitingAnalytics({
      athleteId,
      profileViews: 1,
      uniqueViewers: 1,
      interestLevel: 10,
      bookmarksCount: 0,
      messagesSent: 0,
      connectionsCount: 0,
      viewsOverTime: [{ date: new Date().toISOString().split('T')[0], count: 1 }],
      interestBySchoolType: [],
      interestByPosition: [],
      interestByRegion: [],
      topSchools: []
    });
    return analytics;
  }
  
  // Increment profile views
  const updatedViews = analytics.profileViews + 1;
  
  // Update views over time
  const today = new Date().toISOString().split('T')[0];
  let viewsOverTime = analytics.viewsOverTime as any[];
  
  if (viewsOverTime.length === 0) {
    viewsOverTime = [{ date: today, count: 1 }];
  } else {
    const lastEntry = viewsOverTime[viewsOverTime.length - 1];
    if (lastEntry.date === today) {
      lastEntry.count++;
    } else {
      viewsOverTime.push({ date: today, count: 1 });
    }
  }
  
  return this.updateRecruitingAnalytics(analytics.id, {
    profileViews: updatedViews,
    viewsOverTime: viewsOverTime
  });
}

// Recruiting Messages Methods
export async function getRecruitingMessages(this: MemStorage, userId: number) {
  return Array.from(this.recruitingMessagesMap.values()).filter(
    m => m.senderId === userId || m.recipientId === userId
  );
}

export async function getRecruitingMessageById(this: MemStorage, id: number) {
  return this.recruitingMessagesMap.get(id);
}

export async function createRecruitingMessage(this: MemStorage, message: InsertRecruitingMessage) {
  const newMessage = {
    ...message,
    id: this.currentRecruitingMessageId++,
    sentAt: new Date()
  };
  this.recruitingMessagesMap.set(newMessage.id, newMessage);
  
  // If recipient has analytics, increment their message count
  if (message.recipientId) {
    const recipient = await this.getUser(message.recipientId);
    if (recipient?.athlete) {
      const analytics = await this.getRecruitingAnalytics(recipient.athlete.id);
      if (analytics) {
        await this.updateRecruitingAnalytics(analytics.id, {
          messagesSent: analytics.messagesSent + 1
        });
      }
    }
  }
  
  return newMessage;
}

export async function markRecruitingMessageAsRead(this: MemStorage, id: number) {
  const message = this.recruitingMessagesMap.get(id);
  if (!message) return undefined;
  
  message.read = true;
  this.recruitingMessagesMap.set(id, message);
  
  return message;
}