#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { RefinementPipeline } from '../lib/utils/refinement-pipeline';

async function testRefinementPipeline() {
  console.log('🧪 Testing Refinement Pipeline');
  console.log('================================\n');

  const pipeline = new RefinementPipeline({
    maxIterations: 3,
    targetQAScore: 4.0,
    enableLogging: true,
    enablePersistence: true
  });

  try {
    const result = await pipeline.refineMonster('Norse');
    
    console.log('\n📊 Final Results:');
    console.log(`Monster: ${result.monster.name}`);
    console.log(`Final QA Score: ${result.finalQAScore}/5.0`);
    console.log(`Iterations: ${result.iterations}`);
    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    console.log(`Session ID: ${result.sessionId}`);
    console.log(`Monster ID: ${result.monsterId}`);
    console.log(`Improvements: ${result.improvements.length}`);
    console.log(`Remaining Issues: ${result.issues.length}`);

    if (result.improvements.length > 0) {
      console.log('\n🔧 Improvements Made:');
      result.improvements.forEach((improvement, index) => {
        console.log(`${index + 1}. ${improvement}`);
      });
    }

    if (result.issues.length > 0) {
      console.log('\n⚠️  Remaining Issues:');
      result.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.category}: ${issue.issue} (${issue.severity})`);
      });
    }

  } catch (error) {
    console.error('❌ Refinement pipeline test failed:', error);
  }
}

if (require.main === module) {
  testRefinementPipeline().catch(console.error);
} 