import { BaseAgent } from '@/agents/base/BaseAgent';
import { Workflow, WorkflowStep, Execution, ExecutionStatus, ExecutionResult } from '@/types';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, Execution> = new Map();

  // Register an agent
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getId(), agent);
  }

  // Unregister an agent
  unregisterAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  // Get an agent by ID
  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  // Get all agents
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  // Register a workflow
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  // Get a workflow by ID
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string, input?: any): Promise<Execution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: Execution = {
      id: this.generateId(),
      workflowId,
      status: ExecutionStatus.PENDING,
      startedAt: new Date(),
      results: []
    };

    this.executions.set(execution.id, execution);

    try {
      execution.status = ExecutionStatus.RUNNING;
      
      // Sort steps by order
      const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);
      
      // Execute steps sequentially (can be enhanced for parallel execution)
      for (const step of sortedSteps) {
        const result = await this.executeStep(step, input);
        execution.results!.push(result);
        
        if (result.status === ExecutionStatus.FAILED) {
          execution.status = ExecutionStatus.FAILED;
          execution.error = result.error;
          break;
        }
      }

      if (execution.status !== ExecutionStatus.FAILED) {
        execution.status = ExecutionStatus.COMPLETED;
        execution.completedAt = new Date();
      }
    } catch (error) {
      execution.status = ExecutionStatus.FAILED;
      execution.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return execution;
  }

  // Execute a single step
  private async executeStep(step: WorkflowStep, input?: any): Promise<ExecutionResult> {
    const agent = this.agents.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    const result: ExecutionResult = {
      stepId: step.id,
      agentId: step.agentId,
      status: ExecutionStatus.PENDING,
      startedAt: new Date()
    };

    try {
      result.status = ExecutionStatus.RUNNING;
      await agent.start();
      
      const output = await agent.execute(input);
      
      result.status = ExecutionStatus.COMPLETED;
      result.output = output;
      result.completedAt = new Date();
      
      await agent.complete();
    } catch (error) {
      result.status = ExecutionStatus.FAILED;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.completedAt = new Date();
      
      await agent.fail(result.error);
    }

    return result;
  }

  // Get execution by ID
  getExecution(executionId: string): Execution | undefined {
    return this.executions.get(executionId);
  }

  // Get all executions
  getAllExecutions(): Execution[] {
    return Array.from(this.executions.values());
  }

  // Generate a unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 