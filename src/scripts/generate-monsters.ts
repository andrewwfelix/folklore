#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config, validateConfig, estimateTotalCost } from '../config';
import { RefinementPipeline } from '../lib/utils/refinement-pipeline';
import { orchestrateMonster } from './orchestrate-monsters';
import { MonsterPersistence } from '../lib/utils/monster-persistence';

async function generateMonsters() {
  try {
    // Validate configuration
    validateConfig();
    
    // Check if refinements should be used
    const useRefinements = process.env['USE_REFINEMENTS'] !== 'false';
    
    console.log('🎭 Folklore Monster Generator');
    console.log('============================');
    
    // Display current settings
    console.log(`\n📊 Generation Settings:`);
    console.log(`   • Count: ${config.generation.count} monsters`);
    console.log(`   • Use Refinements: ${useRefinements ? '✅' : '❌'}`);
    if (useRefinements) {
      console.log(`   • Max Iterations: ${config.refinement.iterations}`);
      console.log(`   • Force Improvement: ${config.refinement.forceImprovement ? '✅' : '❌'}`);
    }
    console.log(`   • Image Generation: ${config.generation.enableImageGeneration ? '✅' : '❌'}`);
    console.log(`   • PDF Generation: ${config.generation.generatePDF ? '✅' : '❌'}`);
    console.log(`   • Art Generation: ${config.generation.generateArt ? '✅' : '❌'}`);
    console.log(`   • QA Review: ${config.quality.enableQAReview ? '✅' : '❌'}`);
    
    console.log(`\n🎨 Image Settings:`);
    console.log(`   • Model: ${config.dalle.model}`);
    console.log(`   • Size: ${config.quality.imageSize}`);
    console.log(`   • Quality: ${config.dalle.quality}`);
    
    // Estimate costs
    const estimatedCost = estimateTotalCost(config.generation.count);
    console.log(`\n💰 Estimated Cost: $${estimatedCost.toFixed(4)}`);
    
    // Development mode warnings
    console.log(`\n🔧 Development Mode:`);
    console.log(`   • DEBUG: config.development.mockLLM = ${config.development.mockLLM}`);
    console.log(`   • DEBUG: process.env.MOCK_LLM = ${process.env['MOCK_LLM']}`);
    if (config.development.mockLLM) {
      console.log(`   • Mock LLM: ✅ (using test responses)`);
    } else {
      console.log(`   • Mock LLM: ❌ (using real API)`);
    }
    if (config.development.mockImageGeneration) {
      console.log(`   • Mock Image Generation: ✅ (skipping actual generation)`);
    } else {
      console.log(`   • Mock Image Generation: ❌ (using real API)`);
    }
    
    console.log(`\n🚀 Starting generation of ${config.generation.count} monster(s)!`);
    
    const results = [];
    
    if (useRefinements) {
      // Use refinement pipeline
      console.log('🔄 Using Refinement Pipeline');
      
      const pipeline = new RefinementPipeline({
        maxIterations: config.refinement.iterations,
        enableLogging: true,
        enablePersistence: true,
        delayPDFGeneration: true // PDF generated only after refinement is complete
      });
      
      // Generate monsters with refinement
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
          console.log(`🎯 Status: ✅ Completed`);
          
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
    } else {
      // Use simple generation without refinements
      console.log('⚡ Using Simple Generation (No Refinements)');
      
      const persistence = new MonsterPersistence();
      
      for (let i = 0; i < config.generation.count; i++) {
        try {
          console.log(`\n🎭 Generating Monster #${i + 1}...`);
          
          const result = await orchestrateMonster(i + 1);
          
          // Save monster to database
          console.log(`💾 Saving monster to database...`);
          const monsterData = {
            name: result.name,
            region: result.region,
            lore: result.lore,
            statBlock: result.statblock,
            citations: result.citations,
            art: result.artPrompt,
            pdfUrl: result.pdfUrl,
            imageUrl: result.imageUrl,
            monsterJson: {
              name: result.name,
              region: result.region,
              lore: result.lore,
              statblock: result.statblock,
              citations: result.citations,
              art: result.artPrompt,
              pdfLayout: result.pdfLayout,
              pdfUrl: result.pdfUrl,
              imageUrl: result.imageUrl
            }
          };
          
          const monsterId = await persistence.saveMonster(monsterData);
          console.log(`✅ Monster saved to database with ID: ${monsterId}`);
          
          results.push({
            monster: result,
            finalQAScore: 0, // No QA score for simple generation
            iterations: 1,
            success: true,
            improvements: [],
            issues: [],
            monsterId: monsterId
          });
          
          console.log(`✅ Monster #${i + 1} completed: ${result.name}`);
          console.log(`🎯 Status: ✅ Completed`);
          
        } catch (err) {
          console.error(`❌ Error generating monster #${i + 1}:`, (err as Error).message);
        }
      }
    }
    
    console.log(`\n🎉 Generation complete! Generated ${results.length} monster(s).`);
    
    // Display summary
    if (results.length > 0) {
      console.log('\n📋 Generated Monsters:');
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.monster.name} (${result.monster.region})`);
        if (useRefinements) {
          console.log(`      QA Score: ${result.finalQAScore}/5.0}`);
          console.log(`      Iterations: ${result.iterations}`);
        }
        console.log(`      Status: ✅ Completed`);
        if (result.monsterId) {
          console.log(`      Monster ID: ${result.monsterId}`);
        }
      });
      
      // Calculate completion statistics
      const completedMonsters = results.length;
      
      console.log('\n📊 Summary Statistics:');
      console.log(`   • Completion Rate: ${(completedMonsters / results.length * 100).toFixed(1)}%`);
      
      if (useRefinements) {
        const averageScore = results.reduce((sum, r) => sum + r.finalQAScore, 0) / results.length;
        const averageIterations = results.reduce((sum, r) => sum + r.iterations, 0) / results.length;
        console.log(`   • Average QA Score: ${averageScore.toFixed(2)}/5.0`);
        console.log(`   • Average Iterations: ${averageIterations.toFixed(1)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Generation Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateMonsters().catch(console.error);
}

export { generateMonsters }; 