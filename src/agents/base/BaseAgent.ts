import { AgentStatus, AgentConfig, AgentType } from '@/types';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected type: AgentType;
  protected config: AgentConfig;
  protected status: AgentStatus;

  constructor(id: string, name: string, type: AgentType, config: AgentConfig = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.config = config;
    this.status = AgentStatus.IDLE;
  }

  // Abstract method that must be implemented by subclasses
  abstract execute(input?: any): Promise<any>;

  // Common methods for all agents
  async start(): Promise<void> {
    this.status = AgentStatus.RUNNING;
  }

  async stop(): Promise<void> {
    this.status = AgentStatus.STOPPED;
  }

  async complete(): Promise<void> {
    this.status = AgentStatus.COMPLETED;
  }

  async fail(error: string): Promise<void> {
    this.status = AgentStatus.FAILED;
    console.error(`Agent ${this.name} failed:`, error);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): AgentType {
    return this.type;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  // Setters
  setConfig(config: AgentConfig): void {
    this.config = { ...this.config, ...config };
  }

  // Utility methods
  protected validateConfig(requiredKeys: string[]): boolean {
    return requiredKeys.every(key => key in this.config);
  }

  protected log(message: string): void {
    console.log(`[Agent ${this.name}]: ${message}`);
  }
} 