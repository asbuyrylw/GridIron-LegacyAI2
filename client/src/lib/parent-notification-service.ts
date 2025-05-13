import { apiRequest, RequestOptions } from "./queryClient";

/**
 * Service to handle sending notifications to parents
 */

/**
 * Send achievement notifications to parents of an athlete
 * 
 * @param athleteId - The ID of the athlete
 * @param achievementIds - Array of achievement IDs to notify about
 * @param options - Options for who to notify
 * @returns Promise with the result of the notification attempt
 */
export async function sendAchievementNotifications(
  athleteId: number,
  achievementIds: string[],
  options?: {
    parentIds?: number[]; // Specific parent IDs to notify, if not specified will notify all
    sendToAll?: boolean; // Force send to all parents regardless of notification preferences
  }
) {
  if (!athleteId || !achievementIds.length) {
    throw new Error('Athlete ID and at least one achievement ID are required');
  }

  try {
    const requestOptions: RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        achievementIds,
        parentIds: options?.parentIds || [],
        sendToAll: options?.sendToAll || false
      })
    };

    const response = await apiRequest(
      `/api/athlete/${athleteId}/achievement-notification`,
      requestOptions
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send achievement notifications');
    }

    return response.json();
  } catch (error) {
    console.error('Error sending achievement notifications:', error);
    throw error;
  }
}

/**
 * Send a notification about newly unlocked achievements
 * This is a convenience function that can be called after an achievement is unlocked
 * 
 * @param athleteId - The ID of the athlete
 * @param unlockedAchievements - Array of newly unlocked achievement IDs
 */
export async function notifyParentsOfNewAchievements(
  athleteId: number,
  unlockedAchievements: string[]
) {
  if (!unlockedAchievements.length) return;
  
  try {
    const result = await sendAchievementNotifications(athleteId, unlockedAchievements);
    return result;
  } catch (error) {
    console.error('Failed to notify parents of new achievements:', error);
    return null;
  }
}