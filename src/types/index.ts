// Core types for the Folklore agent orchestration platform

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  config: AgentConfig;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum AgentType {
  DATA_PROCESSOR = 'data_processor',
  API_CALLER = 'api_caller',
  WORKFLOW_TRIGGER = 'workflow_trigger',
  QUALITY_CONTROL = 'quality_control',
  CUSTOM = 'custom'
}

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped'
}

export interface AgentConfig {
  [key: string]: any;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  order: number;
  config?: Record<string, any>;
  dependencies?: string[]; // IDs of steps that must complete first
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  results?: ExecutionResult[];
  error?: string;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ExecutionResult {
  stepId: string;
  agentId: string;
  status: ExecutionStatus;
  output?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Monster-specific types
export interface Monster {
  id: string;
  name: string;
  region: string;
  tags: string[];
  lore: string;
  statBlock: StatBlock;
  citations: Citation[];
  art: ArtPrompt;
  pdfUrl?: string;
  imageUrl?: string;
  status: MonsterStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MonsterStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface StatBlock {
  armorClass: number;
  hitPoints: number;
  speed: Speed;
  abilityScores: AbilityScores;
  savingThrows?: SavingThrows;
  skills?: Skills;
  senses: Senses;
  languages: string[];
  challengeRating: number;
  experiencePoints: number;
  traits: Trait[];
  actions: Action[];
  legendaryActions?: LegendaryAction[];
  lairActions?: LairAction[];
}

export interface Speed {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface Skills {
  [skill: string]: number;
}

export interface Senses {
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
  passivePerception: number;
}

export interface Trait {
  name: string;
  description: string;
}

export interface Action {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: Damage;
  reach?: number;
  targets?: string;
}

export interface Damage {
  type: string;
  roll: string;
  bonus?: number;
}

export interface LegendaryAction {
  name: string;
  description: string;
  cost: number;
}

export interface LairAction {
  name: string;
  description: string;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  relevance: string;
}

export interface ArtPrompt {
  id: string;
  prompt: string;
  style: string;
  description: string;
  imageUrl?: string;
}

export interface MonsterGenerationInput {
  name?: string;
  region: string;
  tags?: string[];
  description?: string;
}

export interface MonsterGenerationResult {
  monster: Monster;
  success: boolean;
  error?: string;
  agentResults: AgentResult[];
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  status: ExecutionStatus;
  output?: any;
  error?: string;
  duration: number;
} 