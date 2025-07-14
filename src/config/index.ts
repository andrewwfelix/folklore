// Configuration for the Folklore application

export const config = {
  // Application settings
  app: {
    name: 'Folklore',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Agent settings
  agents: {
    timeout: parseInt(process.env.AGENT_TIMEOUT || '30000'),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_AGENTS || '10'),
    retryAttempts: parseInt(process.env.AGENT_RETRY_ATTEMPTS || '3'),
  },

  // Database settings
  database: {
    url: process.env.DATABASE_URL,
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV !== 'production',
  },

  // API settings
  api: {
    baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  },
};

export default config; 