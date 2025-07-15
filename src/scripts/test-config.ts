#!/usr/bin/env ts-node

import { config, estimateTotalCost } from '../config';

async function main() {
  console.log('🎭 Folklore Configuration Test');
  console.log('==============================');
  
  // Display current settings (without validation)
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
  
  // Estimate costs for different scenarios
  console.log(`\n💰 Cost Estimates:`);
  console.log(`   • 1 monster: $${estimateTotalCost(1).toFixed(4)}`);
  console.log(`   • 10 monsters: $${estimateTotalCost(10).toFixed(4)}`);
  console.log(`   • 100 monsters: $${estimateTotalCost(100).toFixed(4)}`);
  console.log(`   • 1000 monsters: $${estimateTotalCost(1000).toFixed(4)}`);
  console.log(`   • 3000 monsters: $${estimateTotalCost(3000).toFixed(4)}`);
  
  // Show how to change settings
  console.log(`\n🔧 How to Change Settings:`);
  console.log(`   • Set GENERATION_COUNT=10 for 10 monsters`);
  console.log(`   • Set DALLE_SIZE=256x256 for cheaper images`);
  console.log(`   • Set USE_DALLE_3=true for premium quality`);
  console.log(`   • Set ENABLE_IMAGE_GENERATION=false to skip images`);
  
  console.log(`\n✅ Configuration system ready!`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as testConfig }; 