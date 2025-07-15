import { LoreAgent } from '@/agents/LoreAgent';
import { AgentType, AgentStatus, MonsterGenerationInput } from '@/types';

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a test lore description for a monster from Japanese folklore. It has mystical properties and is deeply rooted in cultural traditions.'
              }
            }
          ]
        })
      }
    }
  }))
}));

describe('LoreAgent', () => {
  let agent: LoreAgent;

  beforeEach(() => {
    agent = new LoreAgent('test-lore-agent');
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.getId()).toBe('test-lore-agent');
      expect(agent.getName()).toBe('Lore Agent');
      expect(agent.getType()).toBe(AgentType.DATA_PROCESSOR);
      expect(agent.getStatus()).toBe(AgentStatus.IDLE);
    });
  });

  describe('execute', () => {
    it('should generate lore for a monster', async () => {
      const input: MonsterGenerationInput = {
        region: 'Japan',
        tags: ['yokai', 'supernatural'],
        description: 'A mysterious creature from Japanese folklore'
      };

      const result = await agent.execute(input);

      expect(result).toMatchObject({
        name: expect.any(String),
        region: 'Japan',
        tags: ['yokai', 'supernatural'],
        lore: expect.stringContaining('test lore description'),
        status: 'draft'
      });

      expect(result.name).toBeTruthy();
      expect(result.lore).toBeTruthy();
      expect(result.lore.length).toBeGreaterThan(100);
    });

    it('should generate name when not provided', async () => {
      const input: MonsterGenerationInput = {
        region: 'Japan'
      };

      const result = await agent.execute(input);

      expect(result.name).toBeTruthy();
      expect(['Yokai', 'Oni', 'Tengu', 'Kappa', 'Nue']).toContain(result.name);
    });

    it('should handle errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = require('openai').default;
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const agentWithError = new LoreAgent('error-agent');
      const input: MonsterGenerationInput = {
        region: 'Japan'
      };

      await expect(agentWithError.execute(input)).rejects.toThrow('API Error');
      expect(agentWithError.getStatus()).toBe(AgentStatus.FAILED);
    });
  });

  describe('status management', () => {
    it('should transition through statuses during execution', async () => {
      const input: MonsterGenerationInput = {
        region: 'Japan'
      };

      expect(agent.getStatus()).toBe(AgentStatus.IDLE);

      const executionPromise = agent.execute(input);
      
      // Status should be RUNNING during execution
      expect(agent.getStatus()).toBe(AgentStatus.RUNNING);

      await executionPromise;
      
      // Status should be COMPLETED after successful execution
      expect(agent.getStatus()).toBe(AgentStatus.COMPLETED);
    });
  });
}); 