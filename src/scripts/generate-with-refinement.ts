#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config, validateConfig, estimateTotalCost } from '../config';
import { RefinementPipeline } from '../lib/utils/refinement-pipeline';

async function generateWithRefinement() {
  try {
    // Validate configuration
    validateConfig();
    
    console.log('🎭 Folklore Monster Generator with Refinement');
    console.log('============================================');
    
    // Display current settings
    console.log(`\n📊 Generation Settings:`);
    console.log(`   • Count: ${config.generation.count} monsters`);
    console.log(`   • Max Iterations: 3`);
    console.log(`   • Target QA Score: 4.0`);
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
    if (config.development.debug) {
      console.log(`\n🔧 Development Mode:`);
      if (config.development.mockLLM) {
        console.log(`   • Mock LLM: ✅ (using test responses)`);
      }
      if (config.development.mockImageGeneration) {
        console.log(`   • Mock Image Generation: ✅ (skipping actual generation)`);
      }
    }
    
    console.log(`\n🚀 Starting generation with refinement of ${config.generation.count} monster(s)!`);
    
    // Create refinement pipeline
    const pipeline = new RefinementPipeline({
      maxIterations: 3,
      targetQAScore: 4.8, // Increased to force refinement iterations
      enableLogging: true,
      enablePersistence: true,
      delayPDFGeneration: true // PDF generated only after refinement is complete
    });
    
    // Generate monsters with refinement
    const results = [];
    for (let i = 0; i < config.generation.count; i++) {
      try {
        console.log(`\n🎭 Generating Monster #${i + 1} with Refinement...`);
        
        // Use a different region for each monster
        const regions = ['Japan', 'Norse', 'Greece', 'Celtic', 'Slavic', 'Chinese', 'Indian', 'Egyptian', 'Aztec', 'Malaysia'];
        const region = regions[i % regions.length] || 'Japan';
        
        const result = await pipeline.refineMonster(region);
        results.push(result);
        
        console.log(`✅ Monster #${i + 1} completed: ${result.monster.name}`);
        console.log(`📊 Final QA Score: ${result.finalQAScore}/5.0`);
        console.log(`🔄 Iterations: ${result.iterations}`);
        console.log(`🎯 Success: ${result.success ? '✅' : '❌'}`);
        
        if (result.improvements.length > 0) {
          console.log(`🔧 Improvements: ${result.improvements.length}`);
        }
        
        if (result.issues.length > 0) {
          console.log(`⚠️  Remaining Issues: ${result.issues.length}`);
        }
        
      } catch (err) {
        console.error(`❌ Error generating monster #${i + 1}:`, (err as Error).message);
      }
    }
    
    console.log(`\n🎉 Generation with refinement complete! Generated ${results.length} monster(s).`);
    
    // Display summary
    if (results.length > 0) {
      console.log('\n📋 Generated Monsters:');
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.monster.name} (${result.monster.region})`);
        console.log(`      QA Score: ${result.finalQAScore}/5.0`);
        console.log(`      Iterations: ${result.iterations}`);
        console.log(`      Success: ${result.success ? '✅' : '❌'}`);
        if (result.monsterId) {
          console.log(`      Monster ID: ${result.monsterId}`);
        }
      });
      
      // Calculate success rate
      const successfulMonsters = results.filter(r => r.success).length;
      const averageScore = results.reduce((sum, r) => sum + r.finalQAScore, 0) / results.length;
      const averageIterations = results.reduce((sum, r) => sum + r.iterations, 0) / results.length;
      
      console.log('\n📊 Summary Statistics:');
      console.log(`   • Success Rate: ${(successfulMonsters / results.length * 100).toFixed(1)}%`);
      console.log(`   • Average QA Score: ${averageScore.toFixed(2)}/5.0`);
      console.log(`   • Average Iterations: ${averageIterations.toFixed(1)}`);
    }
    
  } catch (error) {
    console.error('❌ Generation Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateWithRefinement().catch(console.error);
}

export { generateWithRefinement }; 