#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { RefinementLogger } from '../lib/utils/refinement-logger';
import { MonsterPersistence } from '../lib/utils/monster-persistence';
import { QAReview } from '../types/qa-feedback';
import { classifyQAIssues } from '../lib/utils/qa-classification';
import { QAAgent } from '../agents/QAAgent';

// Test monster interface
interface TestMonster {
  name: string;
  region: string;
  lore: string;
  statBlock?: any;
  citations?: any[];
  art?: any;
  pdfUrl?: string;
}

// Enhanced QA agent
async function enhancedQAAgent(monster: TestMonster): Promise<QAReview> {
  const qaAgent = new QAAgent('qa-test');
  const result = await qaAgent.execute({
    name: monster.name,
    region: monster.region,
    lore: monster.lore,
    statblock: monster.statBlock || {},
    citations: monster.citations || [],
    artPrompt: monster.art || {}
  });
  
  const classifiedIssues = classifyQAIssues(result.qaReview);
  
  return {
    ...result.qaReview,
    issues: classifiedIssues
  };
}

// Test persistence and logging
async function testPersistenceAndLogging() {
  console.log('🧪 Testing Database Persistence and Logging');
  console.log('===========================================\n');

  const logger = new RefinementLogger();
  const persistence = new MonsterPersistence();

  // Start with a basic monster
  let monster: TestMonster = {
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.',
    statBlock: { challengeRating: 3 }
  };

  console.log('📋 Initial Monster:');
  console.log(`Name: ${monster.name}`);
  console.log(`Region: ${monster.region}`);
  console.log(`Lore: ${monster.lore}`);

  // Start refinement session
  console.log('\n📊 Starting Refinement Session...');
  const sessionId = await logger.startSession({
    session_name: 'Test Refinement Session',
    max_iterations: 3
  });

  // Initial QA review
  console.log('\n🔍 Running Initial QA Review...');
  const initialQA = await enhancedQAAgent(monster);
  console.log(`Initial QA Score: ${initialQA.overallScore}/5.0`);
  console.log(`Issues Found: ${initialQA.issues.length}`);

  // Log first iteration
  console.log('\n📝 Logging First Iteration...');
  await logger.logIteration({
    session_id: sessionId,
    iteration_number: 1,
    qa_score_before: initialQA.overallScore,
    qa_score_after: initialQA.overallScore,
    qa_issues: initialQA.issues,
    agent_actions: [],
    improvements_made: [],
    duration_ms: 5000,
    success: false
  });

  // Simulate some improvements
  console.log('\n🔧 Simulating Improvements...');
  monster.name = 'Frostjaw Wendigo';
  monster.lore = 'Born from the harsh winters and desolate landscapes of the North, the Frostjaw Wendigo is a creature of pure malevolence...';
  monster.statBlock = { challengeRating: 8, armorClass: 16, hitPoints: 120 };

  // Final QA review
  console.log('\n🔍 Running Final QA Review...');
  const finalQA = await enhancedQAAgent(monster);
  console.log(`Final QA Score: ${finalQA.overallScore}/5.0`);
  console.log(`Remaining Issues: ${finalQA.issues.length}`);

  // Log final iteration
  console.log('\n📝 Logging Final Iteration...');
  await logger.logIteration({
    session_id: sessionId,
    iteration_number: 2,
    qa_score_before: initialQA.overallScore,
    qa_score_after: finalQA.overallScore,
    qa_issues: finalQA.issues,
    agent_actions: [
      {
        agent_name: 'LoreAgent',
        feedback_received: 'Name is too generic',
        action_taken: 'Generated distinctive name and enhanced lore',
        duration_ms: 3000,
        success: true
      }
    ],
    improvements_made: ['Enhanced name', 'Improved lore', 'Updated stat block'],
    duration_ms: 8000,
    success: true
  });

  // Complete session
  console.log('\n✅ Completing Refinement Session...');
  await logger.completeSession({
    final_qa_score: finalQA.overallScore,
    total_iterations: 2,
    success_criteria_met: finalQA.overallScore >= 4.0,
    final_status: finalQA.overallScore >= 4.0 ? 'SUCCESS' : 'MAX_ITERATIONS_REACHED'
  });

  // Save monster to database
  console.log('\n💾 Saving Monster to Database...');
  const monsterData = {
    name: monster.name,
    region: monster.region,
    lore: monster.lore,
    statBlock: monster.statBlock,
    citations: monster.citations || [],
    art: monster.art || {},
    pdfUrl: monster.pdfUrl || undefined,
    refinement_session_id: sessionId,
    initial_qa_score: initialQA.overallScore,
    final_qa_score: finalQA.overallScore,
    refinement_iterations: 2,
    refinement_success: finalQA.overallScore >= 4.0
  };

  const monsterId = await persistence.saveMonster(monsterData);
  console.log(`✅ Saved monster with ID: ${monsterId}`);

  // Update monster with refinement metadata
  await logger.updateMonsterRefinement(monsterId, sessionId, {
    initial_qa_score: initialQA.overallScore,
    final_qa_score: finalQA.overallScore,
    refinement_iterations: 2,
    refinement_success: finalQA.overallScore >= 4.0
  });

  // Retrieve and display results
  console.log('\n📊 Retrieving Results...');
  
  // Get refinement summary
  const summary = await logger.getRefinementSummary(monsterId);
  if (summary) {
    console.log('\n📋 Refinement Summary:');
    console.log(`Monster: ${summary.monster_name}`);
    console.log(`Session: ${summary.session_name}`);
    console.log(`Initial Score: ${summary.initial_qa_score}`);
    console.log(`Final Score: ${summary.final_qa_score}`);
    console.log(`Iterations: ${summary.total_iterations}`);
    console.log(`Status: ${summary.final_status}`);
    console.log(`Duration: ${summary.total_duration_ms}ms`);
  }

  // Get all refinement sessions
  const sessions = await logger.getAllRefinementSessions();
  console.log(`\n📊 Total Refinement Sessions: ${sessions.length}`);

  // Get all monsters
  const monsters = await persistence.getAllMonsters();
  console.log(`📊 Total Monsters in Database: ${monsters.length}`);

  // Get refined monsters
  const refinedMonsters = await persistence.getRefinedMonsters();
  console.log(`📊 Refined Monsters: ${refinedMonsters.length}`);

  console.log('\n✅ Persistence and Logging Test Complete!');
}

if (require.main === module) {
  testPersistenceAndLogging().catch(console.error);
} 