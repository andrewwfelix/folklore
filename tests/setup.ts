// Test setup file for Jest
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock agents
  createMockAgent: (overrides = {}) => ({
    id: 'test-agent-id',
    name: 'Test Agent',
    type: 'data_processor',
    config: {},
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Helper to create mock workflows
  createMockWorkflow: (overrides = {}) => ({
    id: 'test-workflow-id',
    name: 'Test Workflow',
    description: 'A test workflow',
    steps: [],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Helper to create mock executions
  createMockExecution: (overrides = {}) => ({
    id: 'test-execution-id',
    workflowId: 'test-workflow-id',
    status: 'pending',
    startedAt: new Date(),
    results: [],
    ...overrides
  })
};

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockAgent: (overrides?: any) => any;
        createMockWorkflow: (overrides?: any) => any;
        createMockExecution: (overrides?: any) => any;
      };
    }
  }
} 