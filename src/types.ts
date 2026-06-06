export interface Agent {
  id: string;
  name: string;
  group: string;
  phase: string;
  timeline: string;
  committee: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  file: string;
  mission: string;
  points: number;
  rank: 'Recruit' | 'Operative' | 'Specialist' | 'Elite' | 'Commander' | 'Sovereign';
  activePenalty: string | null;
  computePriority: number; // 0 to 100
}

export interface PipelineStage {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  checkList: string[];
  durationMs?: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'warning' | 'high' | 'critical';
  status: 'unresolved' | 'investigating' | 'contained' | 'resolved';
  assignedAgent: string;
  timestamp: string;
  description: string;
}

export interface BountyOffer {
  id: string;
  title: string;
  category: 'Security' | 'QA' | 'Feature' | 'Growth';
  pointsReward: number;
  status: 'active' | 'claimed' | 'completed';
  claimedBy?: string;
  description: string;
}
