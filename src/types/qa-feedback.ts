export interface QAIssue {
  severity: 'Critical' | 'Major' | 'Minor';
  category: 'Name Distinctiveness' | 'Cultural Authenticity' | 'Stat Block Balance' | 'Consistency' | 'Quality';
  issue: string;
  suggestion: string;
  affectedAgent: 'LoreAgent' | 'StatBlockAgent' | 'CitationAgent' | 'ArtPromptAgent';
  instruction?: string;
}

export interface QAReview {
  status: 'pass' | 'fail' | 'needs_revision';
  issues: QAIssue[];
  summary: string;
  recommendations: string[];
}

export interface FeedbackAction {
  agent: string;
  priority: 'immediate' | 'high' | 'normal';
  instruction: string;
  originalIssue: QAIssue;
}

export interface RefinementConfig {
  maxIterations: number;
  maxConsecutiveFailures: number;
}

export interface FeedbackMetrics {
  iterationsPerMonster: number;
  successRate: number;
  commonIssues: string[];
  agentEffectiveness: Record<string, number>;
  improvementRate: number;
} 