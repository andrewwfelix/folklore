#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config, validateConfig, estimateTotalCost } from '../config';
import { isDevelopment } from '../config';
import { orchestrateMonster } from './orchestrate-monsters';

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
    
    console.log(`\n🚀 Starting generation of ${config.generation.count} monster(s)!`);
    
    // Run the orchestrator for each monster
    const monsters = [];
    for (let i = 0; i < config.generation.count; i++) {
      try {
        console.log(`\n🎭 Generating Monster #${i + 1}...`);
        const monster = await orchestrateMonster(i + 1);
        monsters.push(monster);
        console.log(`✅ Monster #${i + 1} completed: ${monster.name}`);
      } catch (err) {
        console.error(`❌ Error generating monster #${i + 1}:`, (err as Error).message);
      }
    }
    
    console.log(`\n🎉 Generation complete! Generated ${monsters.length} monster(s).`);
    
    // Display summary
    if (monsters.length > 0) {
      console.log('\n📋 Generated Monsters:');
      monsters.forEach((monster, index) => {
        console.log(`   ${index + 1}. ${monster.name} (${monster.region})`);
        if (monster.pdfUrl) console.log(`      PDF: ${monster.pdfUrl}`);
        if (monster.imageUrl) console.log(`      Image: ${monster.imageUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Generation Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as generateMonsters }; 