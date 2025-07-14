import { BaseAgent } from '@/agents/base/BaseAgent';
import { AgentType, AgentStatus } from '@/types';

// Mock agent implementation for testing
class MockAgent extends BaseAgent {
  constructor(id: string, name: string, config = {}) {
    super(id, name, AgentType.DATA_PROCESSOR, config);
  }

  async execute(input?: any): Promise<any> {
    this.log('Executing mock agent');
    return { processed: input, timestamp: new Date() };
  }
}

describe('BaseAgent', () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent('test-id', 'Test Agent', { testConfig: 'value' });
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.getId()).toBe('test-id');
      expect(agent.getName()).toBe('Test Agent');
      expect(agent.getType()).toBe(AgentType.DATA_PROCESSOR);
      expect(agent.getConfig()).toEqual({ testConfig: 'value' });
      expect(agent.getStatus()).toBe(AgentStatus.IDLE);
    });
  });

  describe('status management', () => {
    it('should start the agent', async () => {
      await agent.start();
      expect(agent.getStatus()).toBe(AgentStatus.RUNNING);
    });

    it('should stop the agent', async () => {
      await agent.start();
      await agent.stop();
      expect(agent.getStatus()).toBe(AgentStatus.STOPPED);
    });

    it('should complete the agent', async () => {
      await agent.start();
      await agent.complete();
      expect(agent.getStatus()).toBe(AgentStatus.COMPLETED);
    });

    it('should fail the agent', async () => {
      const errorMessage = 'Test error';
      await agent.fail(errorMessage);
      expect(agent.getStatus()).toBe(AgentStatus.FAILED);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = { newKey: 'newValue' };
      agent.setConfig(newConfig);
      expect(agent.getConfig()).toEqual({ testConfig: 'value', newKey: 'newValue' });
    });

    it('should validate configuration', () => {
      const requiredKeys = ['testConfig'];
      expect(agent['validateConfig'](requiredKeys)).toBe(true);
      
      const missingKeys = ['missingKey'];
      expect(agent['validateConfig'](missingKeys)).toBe(false);
    });
  });

  describe('execution', () => {
    it('should execute and return result', async () => {
      const input = { data: 'test' };
      const result = await agent.execute(input);
      
      expect(result).toEqual({
        processed: input,
        timestamp: expect.any(Date)
      });
    });
  });
}); 