/**
 * Calculate the overall IQ level based on progress data
 */
export function calculateOverallLevel(progressData: any[]): string {
  if (!progressData || progressData.length === 0) {
    return "rookie";
  }
  
  // Get all scores
  const levels = progressData.map(p => p.level || "rookie");
  
  // Count occurrences of each level
  const levelCounts: Record<string, number> = {
    rookie: 0,
    developing: 0,
    proficient: 0,
    advanced: 0,
    expert: 0
  };
  
  levels.forEach(level => {
    if (levelCounts[level] !== undefined) {
      levelCounts[level]++;
    }
  });
  
  // Determine predominant level (highest count)
  let maxCount = 0;
  let predominantLevel = "rookie";
  
  for (const [level, count] of Object.entries(levelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predominantLevel = level;
    }
  }
  
  return predominantLevel;
}

/**
 * Get color class for IQ level badge
 */
export function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case "rookie":
      return "bg-slate-500";
    case "developing":
      return "bg-blue-500";
    case "proficient":
      return "bg-green-500";
    case "advanced":
      return "bg-purple-600";
    case "expert":
      return "bg-amber-500";
    default:
      return "bg-slate-500";
  }
}