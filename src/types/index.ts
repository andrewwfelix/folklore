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