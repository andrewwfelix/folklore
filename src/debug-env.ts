import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Debugging Environment Variables\n');

// Database Configuration
console.log('🗄️  Database Configuration:');
const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];
console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
console.log(`  SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Not set'}`);

// OpenAI Configuration
console.log('\n🤖 OpenAI Configuration:');
const openaiApiKey = process.env['OPENAI_API_KEY'];
const openaiModel = process.env['OPENAI_MODEL'];
console.log(`  OPENAI_API_KEY: ${openaiApiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`  OPENAI_MODEL: ${openaiModel || 'gpt-4 (default)'}`);

// DALL-E Image Generation
console.log('\n🎨 DALL-E Configuration:');
const dalleModel = process.env['DALLE_MODEL'];
const dalleSize = process.env['DALLE_SIZE'];
const dalleQuality = process.env['DALLE_QUALITY'];
const useDalle3 = process.env['USE_DALLE_3'];
console.log(`  DALLE_MODEL: ${dalleModel || 'dall-e-2 (default)'}`);
console.log(`  DALLE_SIZE: ${dalleSize || '512x512 (default)'}`);
console.log(`  DALLE_QUALITY: ${dalleQuality || 'standard (default)'}`);
console.log(`  USE_DALLE_3: ${useDalle3 === 'true' ? '✅ Enabled' : '❌ Disabled'}`);

// Monster Generation Settings
console.log('\n🎭 Monster Generation Settings:');
const generationCount = process.env['GENERATION_COUNT'];
const generationBatchSize = process.env['GENERATION_BATCH_SIZE'];
const generationMaxRetries = process.env['GENERATION_MAX_RETRIES'];
const generationTimeoutMs = process.env['GENERATION_TIMEOUT_MS'];
console.log(`  GENERATION_COUNT: ${generationCount || '1 (default)'}`);
console.log(`  GENERATION_BATCH_SIZE: ${generationBatchSize || '5 (default)'}`);
console.log(`  GENERATION_MAX_RETRIES: ${generationMaxRetries || '3 (default)'}`);
console.log(`  GENERATION_TIMEOUT_MS: ${generationTimeoutMs || '30000 (default)'}`);

// Feature Flags
console.log('\n🚩 Feature Flags:');
const enableImageGeneration = process.env['ENABLE_IMAGE_GENERATION'];
const enablePDFGeneration = process.env['ENABLE_PDF_GENERATION'];
const enableQAReview = process.env['ENABLE_QA_REVIEW'];
console.log(`  ENABLE_IMAGE_GENERATION: ${enableImageGeneration !== 'false' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`  ENABLE_PDF_GENERATION: ${enablePDFGeneration !== 'false' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`  ENABLE_QA_REVIEW: ${enableQAReview !== 'false' ? '✅ Enabled' : '❌ Disabled'}`);

// Quality Settings
console.log('\n⭐ Quality Settings:');
const imageSize = process.env['IMAGE_SIZE'];
const strictMode = process.env['STRICT_MODE'];
console.log(`  IMAGE_SIZE: ${imageSize || '512x512 (default)'}`);
console.log(`  STRICT_MODE: ${strictMode === 'true' ? '✅ Enabled' : '❌ Disabled'}`);

// Development Settings
console.log('\n🔧 Development Settings:');
const debug = process.env['DEBUG'];
const logLevel = process.env['LOG_LEVEL'];
const mockLLM = process.env['MOCK_LLM'];
const mockImageGeneration = process.env['MOCK_IMAGE_GENERATION'];
console.log(`  DEBUG: ${debug === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`  LOG_LEVEL: ${logLevel || 'info (default)'}`);
console.log(`  MOCK_LLM: ${mockLLM === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`  MOCK_IMAGE_GENERATION: ${mockImageGeneration === 'true' ? '✅ Enabled' : '❌ Disabled'}`);

// Legacy/Other Variables
console.log('\n📝 Legacy/Other Variables:');
const blobToken = process.env['BLOB_READ_WRITE_TOKEN'];
const vercelUrl = process.env['VERCEL_URL'];
console.log(`  BLOB_READ_WRITE_TOKEN: ${blobToken ? '✅ Set' : '❌ Not set'}`);
console.log(`  VERCEL_URL: ${vercelUrl ? '✅ Set' : '❌ Not set'}`);

// Summary
console.log('\n📊 Summary:');
const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'OPENAI_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length === 0) {
  console.log('  ✅ All required environment variables are set!');
} else {
  console.log('  ❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`    - ${varName}`));
}

console.log('\n💡 Tips:');
console.log('• Set GENERATION_COUNT=1 for beta testing');
console.log('• Set DALLE_SIZE=256x256 for cheaper images');
console.log('• Set MOCK_LLM=true for development without API calls');
console.log('• Set ENABLE_IMAGE_GENERATION=false to skip image generation'); 