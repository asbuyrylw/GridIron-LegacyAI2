import { MemStorage } from './storage';
import { 
  ExternalServiceToken, 
  InsertExternalServiceToken,
  HudlVideo,
  InsertHudlVideo,
  MaxPrepsStats,
  InsertMaxPrepsStats,
  TwitterPost,
  InsertTwitterPost
} from '../shared/external-integrations';

// External Service Token Methods
export async function getExternalServiceTokens(this: MemStorage, userId: number): Promise<ExternalServiceToken[]> {
  return Array.from(this.externalServiceTokensMap.values()).filter(token => token.userId === userId);
}

export async function getExternalServiceTokenById(this: MemStorage, id: number): Promise<ExternalServiceToken | undefined> {
  return this.externalServiceTokensMap.get(id);
}

export async function getExternalServiceTokenByUserAndService(
  this: MemStorage, 
  userId: number, 
  service: string
): Promise<ExternalServiceToken | undefined> {
  return Array.from(this.externalServiceTokensMap.values()).find(
    token => token.userId === userId && token.service === service
  );
}

export async function createExternalServiceToken(this: MemStorage, token: InsertExternalServiceToken): Promise<ExternalServiceToken> {
  const id = this.externalServiceTokenId++;
  const newToken: ExternalServiceToken = {
    ...token,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  this.externalServiceTokensMap.set(id, newToken);
  return newToken;
}

export async function updateExternalServiceToken(
  this: MemStorage, 
  id: number, 
  updates: Partial<InsertExternalServiceToken>
): Promise<ExternalServiceToken | undefined> {
  const token = this.externalServiceTokensMap.get(id);
  if (!token) return undefined;
  
  const updatedToken: ExternalServiceToken = {
    ...token,
    ...updates,
    updatedAt: new Date()
  };
  this.externalServiceTokensMap.set(id, updatedToken);
  return updatedToken;
}

export async function deleteExternalServiceToken(this: MemStorage, id: number): Promise<boolean> {
  return this.externalServiceTokensMap.delete(id);
}

// Hudl Video Methods
export async function getHudlVideosByAthlete(
  this: MemStorage, 
  athleteId: number, 
  highlightsOnly: boolean = false
): Promise<HudlVideo[]> {
  const videos = Array.from(this.hudlVideosMap.values()).filter(video => video.athleteId === athleteId);
  
  if (highlightsOnly) {
    return videos.filter(video => video.isHighlight);
  }
  
  return videos;
}

export async function getHudlVideoById(this: MemStorage, id: number): Promise<HudlVideo | undefined> {
  return this.hudlVideosMap.get(id);
}

export async function getHudlVideoByHudlId(this: MemStorage, hudlId: string): Promise<HudlVideo | undefined> {
  return Array.from(this.hudlVideosMap.values()).find(video => video.hudlId === hudlId);
}

export async function createHudlVideo(this: MemStorage, video: InsertHudlVideo): Promise<HudlVideo> {
  const id = this.hudlVideoId++;
  const newVideo: HudlVideo = {
    ...video,
    id,
    syncedAt: new Date()
  };
  this.hudlVideosMap.set(id, newVideo);
  return newVideo;
}

export async function updateHudlVideo(
  this: MemStorage, 
  id: number, 
  updates: Partial<InsertHudlVideo>
): Promise<HudlVideo | undefined> {
  const video = this.hudlVideosMap.get(id);
  if (!video) return undefined;
  
  const updatedVideo: HudlVideo = {
    ...video,
    ...updates,
    syncedAt: new Date()
  };
  this.hudlVideosMap.set(id, updatedVideo);
  return updatedVideo;
}

export async function deleteHudlVideo(this: MemStorage, id: number): Promise<boolean> {
  return this.hudlVideosMap.delete(id);
}

// MaxPreps Stats Methods
export async function getMaxPrepsStatsByAthlete(this: MemStorage, athleteId: number): Promise<MaxPrepsStats[]> {
  return Array.from(this.maxPrepsStatsMap.values()).filter(stats => stats.athleteId === athleteId);
}

export async function getMaxPrepsStatsById(this: MemStorage, id: number): Promise<MaxPrepsStats | undefined> {
  return this.maxPrepsStatsMap.get(id);
}

export async function getMaxPrepsStatsByAthleteSeason(
  this: MemStorage, 
  athleteId: number, 
  season: string
): Promise<MaxPrepsStats | undefined> {
  return Array.from(this.maxPrepsStatsMap.values()).find(
    stats => stats.athleteId === athleteId && stats.season === season
  );
}

export async function createMaxPrepsStats(this: MemStorage, stats: InsertMaxPrepsStats): Promise<MaxPrepsStats> {
  const id = this.maxPrepsStatsId++;
  const newStats: MaxPrepsStats = {
    ...stats,
    id,
    lastSynced: new Date()
  };
  this.maxPrepsStatsMap.set(id, newStats);
  return newStats;
}

export async function updateMaxPrepsStats(
  this: MemStorage, 
  id: number, 
  updates: Partial<InsertMaxPrepsStats>
): Promise<MaxPrepsStats | undefined> {
  const stats = this.maxPrepsStatsMap.get(id);
  if (!stats) return undefined;
  
  const updatedStats: MaxPrepsStats = {
    ...stats,
    ...updates,
    lastSynced: new Date()
  };
  this.maxPrepsStatsMap.set(id, updatedStats);
  return updatedStats;
}

export async function deleteMaxPrepsStats(this: MemStorage, id: number): Promise<boolean> {
  return this.maxPrepsStatsMap.delete(id);
}

// Twitter Posts Methods
export async function getTwitterPostsByUser(this: MemStorage, userId: number): Promise<TwitterPost[]> {
  return Array.from(this.twitterPostsMap.values()).filter(post => post.userId === userId);
}

export async function getTwitterPostById(this: MemStorage, id: number): Promise<TwitterPost | undefined> {
  return this.twitterPostsMap.get(id);
}

export async function createTwitterPost(this: MemStorage, post: InsertTwitterPost): Promise<TwitterPost> {
  const id = this.twitterPostId++;
  const newPost: TwitterPost = {
    ...post,
    id,
    createdAt: new Date()
  };
  this.twitterPostsMap.set(id, newPost);
  return newPost;
}

export async function updateTwitterPost(
  this: MemStorage, 
  id: number, 
  updates: Partial<InsertTwitterPost>
): Promise<TwitterPost | undefined> {
  const post = this.twitterPostsMap.get(id);
  if (!post) return undefined;
  
  const updatedPost: TwitterPost = {
    ...post,
    ...updates
  };
  this.twitterPostsMap.set(id, updatedPost);
  return updatedPost;
}

export async function deleteTwitterPost(this: MemStorage, id: number): Promise<boolean> {
  return this.twitterPostsMap.delete(id);
}

// Additional utility method for CombineMetrics
export async function getCombineMetricsById(this: MemStorage, id: number): Promise<any | undefined> {
  return this.combineMetricsMap.get(id);
}