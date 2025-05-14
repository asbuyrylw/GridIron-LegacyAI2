import { MemStorage } from './storage';
import {
  InsertCoachEvaluation,
  CoachEvaluation,
  InsertEvaluationTemplate,
  EvaluationTemplate,
  InsertDepthChart,
  DepthChart,
  InsertDepthChartPosition,
  DepthChartPosition,
  InsertDepthChartEntry,
  DepthChartEntry
} from '@shared/schema';

// Coach Evaluation Templates
export async function getEvaluationTemplates(this: MemStorage): Promise<EvaluationTemplate[]> {
  const templates = Array.from(this.evaluationTemplateMap.values());
  return templates;
}

export async function getEvaluationTemplateByPosition(this: MemStorage, position: string): Promise<EvaluationTemplate | undefined> {
  return Array.from(this.evaluationTemplateMap.values()).find(t => t.position === position);
}

export async function createEvaluationTemplate(this: MemStorage, template: InsertEvaluationTemplate): Promise<EvaluationTemplate> {
  const id = this.evaluationTemplateMap.size + 1;
  const now = new Date();
  
  const newTemplate: EvaluationTemplate = {
    id,
    ...template,
    createdAt: now,
    updatedAt: now
  };
  
  this.evaluationTemplateMap.set(id, newTemplate);
  return newTemplate;
}

export async function updateEvaluationTemplate(this: MemStorage, id: number, updates: Partial<InsertEvaluationTemplate>): Promise<EvaluationTemplate | undefined> {
  const template = this.evaluationTemplateMap.get(id);
  if (!template) return undefined;
  
  const updatedTemplate: EvaluationTemplate = {
    ...template,
    ...updates,
    updatedAt: new Date()
  };
  
  this.evaluationTemplateMap.set(id, updatedTemplate);
  return updatedTemplate;
}

// Coach Evaluations
export async function getCoachEvaluations(this: MemStorage, filters?: {
  athleteId?: number;
  coachId?: number;
  season?: string;
  position?: string;
}): Promise<CoachEvaluation[]> {
  let evaluations = Array.from(this.coachEvaluationMap.values());
  
  if (filters) {
    if (filters.athleteId) {
      evaluations = evaluations.filter(e => e.athleteId === filters.athleteId);
    }
    if (filters.coachId) {
      evaluations = evaluations.filter(e => e.coachId === filters.coachId);
    }
    if (filters.season) {
      evaluations = evaluations.filter(e => e.season === filters.season);
    }
    if (filters.position) {
      evaluations = evaluations.filter(e => e.position === filters.position);
    }
  }
  
  return evaluations;
}

export async function getCoachEvaluationById(this: MemStorage, id: number): Promise<CoachEvaluation | undefined> {
  return this.coachEvaluationMap.get(id);
}

export async function createCoachEvaluation(this: MemStorage, evaluation: InsertCoachEvaluation): Promise<CoachEvaluation> {
  const id = this.coachEvaluationMap.size + 1;
  const now = new Date();
  
  // Calculate overall rating as average of numeric fields (1-10 scale)
  const numericFields = [
    evaluation.athleticism,
    evaluation.technique,
    evaluation.football_iq,
    evaluation.leadership,
    evaluation.coachability,
    evaluation.work_ethic,
    evaluation.competitiveness
  ].filter(val => val !== undefined && val !== null) as number[];
  
  const overall_rating = numericFields.length > 0 
    ? numericFields.reduce((sum, val) => sum + val, 0) / numericFields.length 
    : undefined;
  
  const newEvaluation: CoachEvaluation = {
    id,
    ...evaluation,
    overall_rating,
    createdAt: now,
    updatedAt: now
  };
  
  this.coachEvaluationMap.set(id, newEvaluation);
  return newEvaluation;
}

export async function updateCoachEvaluation(this: MemStorage, id: number, updates: Partial<InsertCoachEvaluation>): Promise<CoachEvaluation | undefined> {
  const evaluation = this.coachEvaluationMap.get(id);
  if (!evaluation) return undefined;
  
  // Recalculate overall rating if any rating fields are updated
  let overall_rating = evaluation.overall_rating;
  const hasRatingUpdates = [
    'athleticism',
    'technique',
    'football_iq',
    'leadership',
    'coachability',
    'work_ethic',
    'competitiveness'
  ].some(field => field in updates);
  
  if (hasRatingUpdates) {
    const merged = { ...evaluation, ...updates };
    const numericFields = [
      merged.athleticism,
      merged.technique,
      merged.football_iq,
      merged.leadership,
      merged.coachability,
      merged.work_ethic,
      merged.competitiveness
    ].filter(val => val !== undefined && val !== null) as number[];
    
    overall_rating = numericFields.length > 0 
      ? numericFields.reduce((sum, val) => sum + val, 0) / numericFields.length 
      : undefined;
  }
  
  const updatedEvaluation: CoachEvaluation = {
    ...evaluation,
    ...updates,
    overall_rating,
    updatedAt: new Date()
  };
  
  this.coachEvaluationMap.set(id, updatedEvaluation);
  return updatedEvaluation;
}

export async function deleteCoachEvaluation(this: MemStorage, id: number): Promise<boolean> {
  return this.coachEvaluationMap.delete(id);
}

// Depth Charts
export async function getDepthCharts(this: MemStorage, filters?: {
  teamId?: number;
  createdBy?: number;
  isActive?: boolean;
}): Promise<DepthChart[]> {
  let charts = Array.from(this.depthChartMap.values());
  
  if (filters) {
    if (filters.teamId) {
      charts = charts.filter(c => c.teamId === filters.teamId);
    }
    if (filters.createdBy) {
      charts = charts.filter(c => c.createdBy === filters.createdBy);
    }
    if (filters.isActive !== undefined) {
      charts = charts.filter(c => c.isActive === filters.isActive);
    }
  }
  
  return charts;
}

export async function getDepthChartById(this: MemStorage, id: number): Promise<DepthChart | undefined> {
  return this.depthChartMap.get(id);
}

export async function createDepthChart(this: MemStorage, chart: InsertDepthChart): Promise<DepthChart> {
  const id = this.depthChartMap.size + 1;
  const now = new Date();
  
  const newChart: DepthChart = {
    id,
    ...chart,
    createdAt: now,
    updatedAt: now
  };
  
  this.depthChartMap.set(id, newChart);
  return newChart;
}

export async function updateDepthChart(this: MemStorage, id: number, updates: Partial<InsertDepthChart>): Promise<DepthChart | undefined> {
  const chart = this.depthChartMap.get(id);
  if (!chart) return undefined;
  
  const updatedChart: DepthChart = {
    ...chart,
    ...updates,
    updatedAt: new Date()
  };
  
  this.depthChartMap.set(id, updatedChart);
  return updatedChart;
}

export async function deleteDepthChart(this: MemStorage, id: number): Promise<boolean> {
  return this.depthChartMap.delete(id);
}

// Depth Chart Positions
export async function getDepthChartPositions(this: MemStorage, depthChartId: number): Promise<DepthChartPosition[]> {
  return Array.from(this.depthChartPositionMap.values())
    .filter(pos => pos.depthChartId === depthChartId)
    .sort((a, b) => a.order - b.order);
}

export async function getDepthChartPositionById(this: MemStorage, id: number): Promise<DepthChartPosition | undefined> {
  return this.depthChartPositionMap.get(id);
}

export async function createDepthChartPosition(this: MemStorage, position: InsertDepthChartPosition): Promise<DepthChartPosition> {
  const id = this.depthChartPositionMap.size + 1;
  
  const newPosition: DepthChartPosition = {
    id,
    ...position
  };
  
  this.depthChartPositionMap.set(id, newPosition);
  return newPosition;
}

export async function updateDepthChartPosition(this: MemStorage, id: number, updates: Partial<InsertDepthChartPosition>): Promise<DepthChartPosition | undefined> {
  const position = this.depthChartPositionMap.get(id);
  if (!position) return undefined;
  
  const updatedPosition: DepthChartPosition = {
    ...position,
    ...updates
  };
  
  this.depthChartPositionMap.set(id, updatedPosition);
  return updatedPosition;
}

export async function deleteDepthChartPosition(this: MemStorage, id: number): Promise<boolean> {
  // Also delete any entries that belong to this position
  const entriesToDelete = Array.from(this.depthChartEntryMap.values())
    .filter(entry => entry.positionId === id)
    .map(entry => entry.id);
    
  entriesToDelete.forEach(entryId => this.depthChartEntryMap.delete(entryId));
  
  return this.depthChartPositionMap.delete(id);
}

// Depth Chart Entries
export async function getDepthChartEntries(this: MemStorage, positionId: number): Promise<DepthChartEntry[]> {
  return Array.from(this.depthChartEntryMap.values())
    .filter(entry => entry.positionId === positionId)
    .sort((a, b) => a.depth - b.depth);
}

export async function getDepthChartEntriesByAthlete(this: MemStorage, athleteId: number): Promise<DepthChartEntry[]> {
  return Array.from(this.depthChartEntryMap.values())
    .filter(entry => entry.athleteId === athleteId);
}

export async function getDepthChartEntryById(this: MemStorage, id: number): Promise<DepthChartEntry | undefined> {
  return this.depthChartEntryMap.get(id);
}

export async function createDepthChartEntry(this: MemStorage, entry: InsertDepthChartEntry): Promise<DepthChartEntry> {
  const id = this.depthChartEntryMap.size + 1;
  const now = new Date();
  
  const newEntry: DepthChartEntry = {
    id,
    ...entry,
    createdAt: now,
    updatedAt: now
  };
  
  this.depthChartEntryMap.set(id, newEntry);
  return newEntry;
}

export async function updateDepthChartEntry(this: MemStorage, id: number, updates: Partial<InsertDepthChartEntry>): Promise<DepthChartEntry | undefined> {
  const entry = this.depthChartEntryMap.get(id);
  if (!entry) return undefined;
  
  const updatedEntry: DepthChartEntry = {
    ...entry,
    ...updates,
    updatedAt: new Date()
  };
  
  this.depthChartEntryMap.set(id, updatedEntry);
  return updatedEntry;
}

export async function deleteDepthChartEntry(this: MemStorage, id: number): Promise<boolean> {
  return this.depthChartEntryMap.delete(id);
}

// Seed evaluation templates for common positions
export async function seedEvaluationTemplates(storage: MemStorage): Promise<void> {
  // Only seed if no templates exist
  const templates = await storage.getEvaluationTemplates();
  if (templates.length > 0) return;
  
  // QB Template
  await storage.createEvaluationTemplate({
    position: 'Quarterback (QB)',
    metrics: {
      throwing_mechanics: { label: 'Throwing Mechanics', description: 'Proper throwing technique and mechanics' },
      arm_strength: { label: 'Arm Strength', description: 'Raw power in throws' },
      accuracy: { label: 'Accuracy', description: 'Ball placement and consistency' },
      pocket_presence: { label: 'Pocket Presence', description: 'Awareness and movement in the pocket' },
      decision_making: { label: 'Decision Making', description: 'Makes appropriate reads and choices' },
      pre_snap_reads: { label: 'Pre-snap Reads', description: 'Ability to diagnose defense before snap' },
      progressions: { label: 'Progressions', description: 'Can move through multiple receivers' },
      mobility: { label: 'Mobility', description: 'Ability to move and throw outside pocket' }
    }
  });
  
  // OL Template
  await storage.createEvaluationTemplate({
    position: 'Offensive Line (OL)',
    metrics: {
      run_blocking: { label: 'Run Blocking', description: 'Effectiveness creating running lanes' },
      pass_protection: { label: 'Pass Protection', description: 'Ability to protect quarterback' },
      footwork: { label: 'Footwork', description: 'Proper technique in steps and movement' },
      hand_placement: { label: 'Hand Placement', description: 'Proper use of hands in blocking' },
      power: { label: 'Power', description: 'Strength in engagement and drive' },
      leverage: { label: 'Leverage', description: 'Proper pad level and center of gravity' },
      mobility: { label: 'Mobility', description: 'Movement ability for pulls and screens' },
      aggression: { label: 'Aggression', description: 'Physicality and finishing blocks' }
    }
  });
  
  // DB Template
  await storage.createEvaluationTemplate({
    position: 'Defensive Back (DB)',
    metrics: {
      man_coverage: { label: 'Man Coverage', description: 'Ability to cover one-on-one' },
      zone_coverage: { label: 'Zone Coverage', description: 'Understanding of zone responsibilities' },
      hip_fluidity: { label: 'Hip Fluidity', description: 'Change of direction and rotation ability' },
      backpedal: { label: 'Backpedal', description: 'Proper technique moving backward' },
      ball_skills: { label: 'Ball Skills', description: 'Ability to play the football in air' },
      tackling: { label: 'Tackling', description: 'Form and effectiveness in tackling' },
      play_recognition: { label: 'Play Recognition', description: 'Diagnosing plays accurately' },
      closing_speed: { label: 'Closing Speed', description: 'Ability to close gaps quickly' }
    }
  });
  
  // WR Template
  await storage.createEvaluationTemplate({
    position: 'Wide Receiver (WR)',
    metrics: {
      route_running: { label: 'Route Running', description: 'Precision and technique in routes' },
      hands: { label: 'Hands', description: 'Catching ability and consistency' },
      release: { label: 'Release', description: 'Ability to get off press coverage' },
      separation: { label: 'Separation', description: 'Creating space from defenders' },
      body_control: { label: 'Body Control', description: 'Adjusting to ball and sideline awareness' },
      yards_after_catch: { label: 'Yards After Catch', description: 'Ability with ball after reception' },
      blocking: { label: 'Blocking', description: 'Effort and technique in run game' },
      ball_tracking: { label: 'Ball Tracking', description: 'Locating and adjusting to deep balls' }
    }
  });
  
  // RB Template
  await storage.createEvaluationTemplate({
    position: 'Running Back (RB)',
    metrics: {
      vision: { label: 'Vision', description: 'Finding and hitting proper holes' },
      burst: { label: 'Burst', description: 'Acceleration when hitting hole' },
      power: { label: 'Power', description: 'Breaking tackles and pushing pile' },
      elusiveness: { label: 'Elusiveness', description: 'Making defenders miss' },
      receiving: { label: 'Receiving', description: 'Route running and catching ability' },
      ball_security: { label: 'Ball Security', description: 'Proper carrying technique, low fumbles' },
      blocking: { label: 'Blocking', description: 'Pass protection effectiveness' },
      cutback_ability: { label: 'Cutback Ability', description: 'Finding alternate lanes and cuts' }
    }
  });
  
  // LB Template
  await storage.createEvaluationTemplate({
    position: 'Linebacker (LB)',
    metrics: {
      run_defense: { label: 'Run Defense', description: 'Diagnosing and attacking run plays' },
      tackling: { label: 'Tackling', description: 'Form and effectiveness in tackling' },
      coverage: { label: 'Coverage', description: 'Ability in zone and man coverage' },
      blitzing: { label: 'Blitzing', description: 'Effectiveness rushing passer' },
      block_shedding: { label: 'Block Shedding', description: 'Disengaging from blockers' },
      play_recognition: { label: 'Play Recognition', description: 'Diagnosing plays accurately' },
      sideline_to_sideline: { label: 'Sideline to Sideline', description: 'Range and lateral movement' },
      instincts: { label: 'Instincts', description: 'Natural feel for position and anticipation' }
    }
  });
  
  // DL Template
  await storage.createEvaluationTemplate({
    position: 'Defensive Line (DL)',
    metrics: {
      get_off: { label: 'Get Off', description: 'First-step quickness after snap' },
      power: { label: 'Power', description: 'Strength at point of attack' },
      hand_usage: { label: 'Hand Usage', description: 'Technique with hands to defeat blocks' },
      leverage: { label: 'Leverage', description: 'Pad level and use of leverage' },
      pass_rush: { label: 'Pass Rush', description: 'Ability to pressure quarterback' },
      run_defense: { label: 'Run Defense', description: 'Holding point against run game' },
      pursuit: { label: 'Pursuit', description: 'Effort and angles in chase situations' },
      gap_integrity: { label: 'Gap Integrity', description: 'Maintaining assigned gap responsibility' }
    }
  });
  
  console.log('Evaluation templates seeded successfully');
}

// Helper function to extend MemStorage with coach evaluation methods
export function extendMemStorageWithCoachEvaluations(storage: MemStorage): void {
  // Initialize maps if they don't exist
  storage.coachEvaluationMap = storage.coachEvaluationMap || new Map();
  storage.evaluationTemplateMap = storage.evaluationTemplateMap || new Map();
  storage.depthChartMap = storage.depthChartMap || new Map();
  storage.depthChartPositionMap = storage.depthChartPositionMap || new Map();
  storage.depthChartEntryMap = storage.depthChartEntryMap || new Map();
  
  // Add methods to storage
  storage.getEvaluationTemplates = getEvaluationTemplates.bind(storage);
  storage.getEvaluationTemplateByPosition = getEvaluationTemplateByPosition.bind(storage);
  storage.createEvaluationTemplate = createEvaluationTemplate.bind(storage);
  storage.updateEvaluationTemplate = updateEvaluationTemplate.bind(storage);
  
  storage.getCoachEvaluations = getCoachEvaluations.bind(storage);
  storage.getCoachEvaluationById = getCoachEvaluationById.bind(storage);
  storage.createCoachEvaluation = createCoachEvaluation.bind(storage);
  storage.updateCoachEvaluation = updateCoachEvaluation.bind(storage);
  storage.deleteCoachEvaluation = deleteCoachEvaluation.bind(storage);
  
  storage.getDepthCharts = getDepthCharts.bind(storage);
  storage.getDepthChartById = getDepthChartById.bind(storage);
  storage.createDepthChart = createDepthChart.bind(storage);
  storage.updateDepthChart = updateDepthChart.bind(storage);
  storage.deleteDepthChart = deleteDepthChart.bind(storage);
  
  storage.getDepthChartPositions = getDepthChartPositions.bind(storage);
  storage.getDepthChartPositionById = getDepthChartPositionById.bind(storage);
  storage.createDepthChartPosition = createDepthChartPosition.bind(storage);
  storage.updateDepthChartPosition = updateDepthChartPosition.bind(storage);
  storage.deleteDepthChartPosition = deleteDepthChartPosition.bind(storage);
  
  storage.getDepthChartEntries = getDepthChartEntries.bind(storage);
  storage.getDepthChartEntriesByAthlete = getDepthChartEntriesByAthlete.bind(storage);
  storage.getDepthChartEntryById = getDepthChartEntryById.bind(storage);
  storage.createDepthChartEntry = createDepthChartEntry.bind(storage);
  storage.updateDepthChartEntry = updateDepthChartEntry.bind(storage);
  storage.deleteDepthChartEntry = deleteDepthChartEntry.bind(storage);
}