import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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
  
  // Agent Model Configuration
  agents: {
    lore: string;
    statblock: string;
    citation: string;
    artPrompt: string;
    pdf: string;
  };
  
  // Iteration Model Configuration
  iterations: {
    iteration1: string;
    iteration2: string;
    iteration3: string;
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
    enableArtGeneration: boolean;     // Whether to generate art prompts
    generatePDF: boolean;             // Whether to generate PDFs (from GENERATE_PDF env var)
  };
  
  // Quality Settings
  quality: {
    useDALL_E3: boolean;             // Use DALL-E 3 for premium quality
    imageSize: '256x256' | '512x512' | '1024x1024';
    enableQAReview: boolean;          // Enable QA review step
    strictMode: boolean;              // Strict validation mode
  };
  
  // Refinement Settings
  refinement: {
    iterations: number;               // Always 3 iterations
    forceImprovement: boolean;        // Force improvement on first iteration
    mockMode: boolean;                // Use mock responses for refinement
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
  
  agents: {
    lore: process.env['LORE_AGENT_MODEL'] || 'gpt-4',
    statblock: process.env['STATBLOCK_AGENT_MODEL'] || 'gpt-4',
    citation: process.env['CITATION_AGENT_MODEL'] || 'gpt-4',
    artPrompt: process.env['ART_PROMPT_AGENT_MODEL'] || 'gpt-4',
    pdf: process.env['PDF_AGENT_MODEL'] || 'gpt-4',
  },
  
  iterations: {
    iteration1: process.env['ITERATION_1_MODEL'] || 'gpt-4',
    iteration2: process.env['ITERATION_2_MODEL'] || 'gpt-4-turbo',
    iteration3: process.env['ITERATION_3_MODEL'] || 'gpt-3.5-turbo',
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
    enableArtGeneration: process.env['ENABLE_ART_GENERATION'] !== 'false',
    generatePDF: process.env['GENERATE_PDF'] !== 'false',
  },
  
  quality: {
    useDALL_E3: process.env['USE_DALLE_3'] === 'true',
    imageSize: (process.env['IMAGE_SIZE'] as '256x256' | '512x512' | '1024x1024') || '512x512',
    enableQAReview: process.env['ENABLE_QA_REVIEW'] !== 'false',
    strictMode: process.env['STRICT_MODE'] === 'true',
  },
  
  refinement: {
    iterations: parseInt(process.env['REFINEMENT_ITERATIONS'] || '3'), // Always 3
    forceImprovement: process.env['FORCE_IMPROVEMENT'] !== 'false',
    mockMode: process.env['MOCK_MODE'] === 'true',
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
  
  if (config.refinement.iterations !== 3) {
    errors.push('REFINEMENT_ITERATIONS must be exactly 3');
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

// Helper function to get model for specific iteration
export function getIterationModel(iteration: number): string {
  switch (iteration) {
    case 1: return config.iterations.iteration1;
    case 2: return config.iterations.iteration2;
    case 3: return config.iterations.iteration3;
    default: return config.openai.model;
  }
} 