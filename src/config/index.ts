import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  // Database
  supabase: {
    url: string;
    serviceKey: string;
  };
  
  // OpenAI
  openai: {
    apiKey: string;
    model: string;
  };
  
  // DALL-E Image Generation
  dalle: {
    apiKey: string;
    model: 'dall-e-2' | 'dall-e-3';
    defaultSize: '256x256' | '512x512' | '1024x1024';
    quality: 'standard' | 'hd';
  };
  
  // Monster Generation
  generation: {
    count: number;                    // Number of monsters to generate
    batchSize: number;                // Process monsters in batches
    maxRetries: number;               // Max retries per generation step
    timeoutMs: number;                // Timeout for each generation step
    enableImageGeneration: boolean;   // Whether to generate images
    enablePDFGeneration: boolean;     // Whether to generate PDFs
  };
  
  // Quality Settings
  quality: {
    useDALL_E3: boolean;             // Use DALL-E 3 for premium quality
    imageSize: '256x256' | '512x512' | '1024x1024';
    enableQAReview: boolean;          // Enable QA review step
    strictMode: boolean;              // Strict validation mode
  };
  
  // Development
  development: {
    debug: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    mockLLM: boolean;                 // Use mock responses for testing
    mockImageGeneration: boolean;     // Skip actual image generation
  };
}

export const config: Config = {
  supabase: {
    url: process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'] || '',
    serviceKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_SERVICE_KEY'] || '',
  },
  
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] || '',
    model: process.env['OPENAI_MODEL'] || 'gpt-4',
  },
  
  dalle: {
    apiKey: process.env['OPENAI_API_KEY'] || '', // Same as OpenAI
    model: (process.env['DALLE_MODEL'] as 'dall-e-2' | 'dall-e-3') || 'dall-e-2',
    defaultSize: (process.env['DALLE_SIZE'] as '256x256' | '512x512' | '1024x1024') || '512x512',
    quality: (process.env['DALLE_QUALITY'] as 'standard' | 'hd') || 'standard',
  },
  
  generation: {
    count: parseInt(process.env['GENERATION_COUNT'] || '1'), // Start with 1 for beta
    batchSize: parseInt(process.env['GENERATION_BATCH_SIZE'] || '5'),
    maxRetries: parseInt(process.env['GENERATION_MAX_RETRIES'] || '3'),
    timeoutMs: parseInt(process.env['GENERATION_TIMEOUT_MS'] || '30000'),
    enableImageGeneration: process.env['ENABLE_IMAGE_GENERATION'] !== 'false',
    enablePDFGeneration: process.env['ENABLE_PDF_GENERATION'] !== 'false',
  },
  
  quality: {
    useDALL_E3: process.env['USE_DALLE_3'] === 'true',
    imageSize: (process.env['IMAGE_SIZE'] as '256x256' | '512x512' | '1024x1024') || '512x512',
    enableQAReview: process.env['ENABLE_QA_REVIEW'] !== 'false',
    strictMode: process.env['STRICT_MODE'] === 'true',
  },
  
  development: {
    debug: process.env['DEBUG'] === 'true',
    logLevel: (process.env['LOG_LEVEL'] as 'error' | 'warn' | 'info' | 'debug') || 'info',
    mockLLM: process.env['MOCK_LLM'] === 'true',
    mockImageGeneration: process.env['MOCK_IMAGE_GENERATION'] === 'true',
  },
};

// Validation
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.supabase.url) errors.push('SUPABASE_URL is required');
  if (!config.supabase.serviceKey) errors.push('SUPABASE_SERVICE_KEY is required');
  if (!config.openai.apiKey) errors.push('OPENAI_API_KEY is required');
  
  if (config.generation.count < 1) {
    errors.push('GENERATION_COUNT must be at least 1');
  }
  
  if (config.generation.batchSize < 1) {
    errors.push('GENERATION_BATCH_SIZE must be at least 1');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
}

// Helper functions
export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] === 'development';
}

export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function getImageCost(size: string): number {
  const costs = {
    '256x256': 0.0025,
    '512x512': 0.005,
    '1024x1024': 0.02,
  };
  return costs[size as keyof typeof costs] || 0.005;
}

export function estimateTotalCost(monsterCount: number): number {
  const imageCost = getImageCost(config.quality.imageSize);
  const totalImageCost = monsterCount * imageCost;
  
  // Rough estimate: $0.01 per monster for LLM calls
  const llmCost = monsterCount * 0.01;
  
  return totalImageCost + llmCost;
} 