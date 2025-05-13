import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { openai } from '../openai';
import { z } from 'zod';

const router = Router();

// Validate athlete authorization
async function validateAthleteAccess(req: Request, athleteId: number): Promise<boolean> {
  if (!req.session || !req.session.userId) return false;
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) return false;
    
    // If admin or coach, grant access
    if (user.userType === 'admin' || user.userType === 'coach') return true;
    
    // If athlete, check if it's their own data
    if (user.userType === 'athlete') {
      const athlete = await storage.getAthleteByUserId(user.id);
      return athlete?.id === athleteId;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating athlete access:', error);
    return false;
  }
}

// Generate athlete bio
router.post('/api/player-branding/generate-bio', async (req: Request, res: Response) => {
  try {
    const bioSchema = z.object({
      athleteId: z.number(),
      length: z.enum(['short', 'medium', 'long']),
      focus: z.enum(['athletic', 'academic', 'balanced'])
    });
    
    const validation = bioSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const { athleteId, length, focus } = validation.data;
    
    // Check authorization
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Get athlete data
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Get additional athlete data
    const metrics = await storage.getCombineMetricsByAthlete(athleteId);
    const achievements = await storage.getAthleteAchievements(athleteId);
    
    // Prepare OpenAI prompt
    let prompt = `Create a professional athlete bio for a high school football player. 
Athlete details:
- Name: ${athlete.firstName} ${athlete.lastName}
- Position: ${athlete.position || 'Unknown'}
- School: ${athlete.school || 'Unknown'}
- Grade/Graduation Year: ${athlete.graduationYear || 'Unknown'}`;

    if (athlete.height && athlete.weight) {
      prompt += `\n- Height: ${Math.floor(athlete.height / 12)}'${athlete.height % 12}"
- Weight: ${athlete.weight} lbs`;
    }
    
    if (metrics && metrics.length > 0) {
      const latest = metrics[0];
      prompt += `\n\nAthletic metrics:`;
      if (latest.fortyYard) prompt += `\n- 40-yard dash: ${latest.fortyYard}s`;
      if (latest.verticalJump) prompt += `\n- Vertical jump: ${latest.verticalJump} inches`;
      if (latest.benchPress) prompt += `\n- Bench press: ${latest.benchPress} lbs`;
      if (latest.squatMax) prompt += `\n- Squat max: ${latest.squatMax} lbs`;
    }
    
    if (athlete.gpa || athlete.actScore) {
      prompt += `\n\nAcademic info:`;
      if (athlete.gpa) prompt += `\n- GPA: ${athlete.gpa}`;
      if (athlete.actScore) prompt += `\n- ACT Score: ${athlete.actScore}`;
    }
    
    if (achievements && achievements.length > 0) {
      prompt += `\n\nAchievements:`;
      achievements.forEach(achievement => {
        prompt += `\n- ${achievement.name}`;
      });
    }
    
    prompt += `\n\nLength: ${length === 'short' ? 'Short (1-2 sentences)' : 
      length === 'medium' ? 'Medium (1 paragraph)' : 
      'Long (2-3 paragraphs)'}`;
    
    prompt += `\n\nFocus: ${focus === 'athletic' ? 'Focus on athletic achievements and potential' : 
      focus === 'academic' ? 'Focus on academic achievements and character' : 
      'Balanced focus on both athletic and academic achievements'}`;
    
    prompt += `\n\nPlease write in third person and create a professional, recruiter-friendly bio.`;
    
    // Generate bio using OpenAI
    try {
      const bioResponse = await openai.generateCoachingResponse(prompt);
      
      return res.status(200).json({
        bio: bioResponse,
      });
    } catch (error) {
      console.error('Error generating bio with OpenAI:', error);
      return res.status(500).json({ message: 'Error generating bio' });
    }
  } catch (error) {
    console.error('Error in bio generation endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Generate social media caption
router.post('/api/player-branding/generate-caption', async (req: Request, res: Response) => {
  try {
    const captionSchema = z.object({
      athleteId: z.number(),
      templateType: z.string(),
      customHashtags: z.array(z.string()).optional()
    });
    
    const validation = captionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const { athleteId, templateType, customHashtags } = validation.data;
    
    // Check authorization
    if (!(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // Get athlete data
    const athlete = await storage.getAthlete(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    
    // Prepare OpenAI prompt
    let prompt = `Create a social media caption for a high school football player. 
Athlete details:
- Name: ${athlete.firstName} ${athlete.lastName}
- Position: ${athlete.position || 'Unknown'}
- School: ${athlete.school || 'Unknown'}
- Grade/Graduation Year: ${athlete.graduationYear || 'Unknown'}`;

    prompt += `\n\nCaption type: ${templateType}`;
    
    switch (templateType) {
      case 'highlight':
        prompt += ' (highlight reel video)';
        break;
      case 'gameday':
        prompt += ' (game day post)';
        break;
      case 'announcement':
        prompt += ' (college commitment announcement)';
        break;
      case 'camp':
        prompt += ' (football camp/combine attendance)';
        break;
      case 'training':
        prompt += ' (training/workout update)';
        break;
    }
    
    if (customHashtags && customHashtags.length > 0) {
      prompt += `\n\nInclude these hashtags: ${customHashtags.join(', ')}`;
    }
    
    // Generate default hashtags based on position and school
    const position = athlete.position?.replace(/[()]/g, '').toLowerCase() || '';
    const positionHashtag = position ? `#${position.replace(/\\s+/g, '')}` : '';
    const schoolHashtag = athlete.school ? `#${athlete.school.replace(/\\s+/g, '')}` : '';
    
    prompt += `\n\nAlso include these hashtags: ${positionHashtag} ${schoolHashtag} #football #athlete #gridiron #recruit`;
    
    prompt += `\n\nThe caption should be:
1. Engaging and authentic
2. Appropriate for college recruiters to see
3. Include emojis where appropriate
4. Not too long (max 1-2 sentences plus hashtags)`;
    
    // Generate caption using OpenAI
    try {
      const captionResponse = await openai.generateCoachingResponse(prompt);
      
      return res.status(200).json({
        caption: captionResponse,
      });
    } catch (error) {
      console.error('Error generating caption with OpenAI:', error);
      return res.status(500).json({ message: 'Error generating caption' });
    }
  } catch (error) {
    console.error('Error in caption generation endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Scan social media profile
router.post('/api/player-branding/scan-profile', async (req: Request, res: Response) => {
  try {
    const scanSchema = z.object({
      athleteId: z.number().optional(),
      profileUrl: z.string()
    });
    
    const validation = scanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const { athleteId, profileUrl } = validation.data;
    
    // Check authorization if athleteId is provided
    if (athleteId && !(await validateAthleteAccess(req, athleteId))) {
      return res.status(403).json({ message: 'Not authorized to access this athlete\'s data' });
    }
    
    // NOTE: In a real implementation, we would integrate with a social media API
    // Since we're not connecting to real APIs in this project, we'll simulate a profile scan
    
    // Generate a simulated profile scan result
    // In a real app, this would come from analyzing actual social media content
    const simulatedScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-99
    const flaggedCount = simulatedScore > 90 ? 0 : Math.floor(Math.random() * 3) + 1;
    
    const possibleIssues = [
      'Profile contains potentially inappropriate language',
      'Some posts contain references to prohibited substances',
      'Profile picture may not present a professional image',
      'Several posts contain political content that could be divisive',
      'Found posts with negative comments about coaches/teammates'
    ];
    
    const selectedIssues = flaggedCount > 0 
      ? possibleIssues.sort(() => 0.5 - Math.random()).slice(0, flaggedCount) 
      : [];
    
    const recommendations = [
      'Review your profile from a recruiter\'s perspective',
      'Consider removing posts that could be viewed as controversial',
      'Add more content that showcases your athletic achievements',
      'Include academic achievements in your profile',
      'Use a professional profile picture in your uniform or team gear'
    ];
    
    // Add profile-specific recommendation
    if (profileUrl.includes('twitter') || profileUrl.includes('x.com')) {
      recommendations.push('Set your Twitter profile to "private" during recruiting season');
    } else if (profileUrl.includes('instagram')) {
      recommendations.push('Archive old Instagram posts that don\'t reflect your current goals');
    } else if (profileUrl.includes('tiktok')) {
      recommendations.push('Be cautious with TikTok trends that could be viewed negatively by recruiters');
    }
    
    return res.status(200).json({
      profileUrl,
      score: simulatedScore,
      flaggedItems: flaggedCount,
      issues: selectedIssues,
      recommendations: recommendations.sort(() => 0.5 - Math.random()).slice(0, 3),
      scanDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in profile scan endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;