#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config, validateConfig, estimateTotalCost } from '../config';
import { isDevelopment } from '../config';

async function main() {
  try {
    // Validate configuration
    validateConfig();
    
    console.log('🎭 Folklore Monster Generator');
    console.log('=============================');
    
    // Display current settings
    console.log(`\n📊 Generation Settings:`);
    console.log(`   • Count: ${config.generation.count} monsters`);
    console.log(`   • Batch Size: ${config.generation.batchSize}`);
    console.log(`   • Image Generation: ${config.generation.enableImageGeneration ? '✅' : '❌'}`);
    console.log(`   • PDF Generation: ${config.generation.enablePDFGeneration ? '✅' : '❌'}`);
    console.log(`   • QA Review: ${config.quality.enableQAReview ? '✅' : '❌'}`);
    
    console.log(`\n🎨 Image Settings:`);
    console.log(`   • Model: ${config.dalle.model}`);
    console.log(`   • Size: ${config.quality.imageSize}`);
    console.log(`   • Quality: ${config.dalle.quality}`);
    
    // Estimate costs
    const estimatedCost = estimateTotalCost(config.generation.count);
    console.log(`\n💰 Estimated Cost: $${estimatedCost.toFixed(4)}`);
    
    // Development mode warnings
    if (isDevelopment()) {
      console.log(`\n🔧 Development Mode:`);
      if (config.development.mockLLM) {
        console.log(`   • Mock LLM: ✅ (using test responses)`);
      }
      if (config.development.mockImageGeneration) {
        console.log(`   • Mock Image Generation: ✅ (skipping actual generation)`);
      }
    }
    
    console.log(`\n🚀 Ready to generate ${config.generation.count} monster(s)!`);
    
    // TODO: Implement actual generation logic
    console.log(`\n📝 TODO: Implement generation pipeline with:`);
    console.log(`   • LoreAgent`);
    console.log(`   • StatBlockAgent`); 
    console.log(`   • CitationAgent`);
    console.log(`   • ArtPromptAgent`);
    console.log(`   • QAAgent`);
    console.log(`   • PDFAgent`);
    
  } catch (error) {
    console.error('❌ Configuration Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as generateMonsters }; 