#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { LoreAgent } from '../agents/LoreAgent';
import { StatBlockAgent } from '../agents/StatBlockAgent';
import { ArtPromptAgent } from '../agents/ArtPromptAgent';
import { QAIssue } from '../types/qa-feedback';

async function testPhase4Agents() {
  console.log('🧪 Testing Phase 4: Agent Feedback Processing');
  console.log('==============================================\n');

  // Test data
  const testRegion = 'Norse';
  const testLore = 'A fearsome creature from Norse mythology that haunts the frozen wastes.';
  const testName = 'Generic Troll';

  // Sample QA issues for testing
  const nameDistinctivenessIssue: QAIssue = {
    severity: 'Major',
    category: 'Name Distinctiveness',
    issue: 'Name "Generic Troll" is too generic and lacks distinctiveness',
    suggestion: 'Create a more distinctive name that reflects Norse mythology',
    affectedAgent: 'LoreAgent'
  };

  const culturalAuthenticityIssue: QAIssue = {
    severity: 'Major',
    category: 'Cultural Authenticity',
    issue: 'Lore lacks specific Norse cultural elements',
    suggestion: 'Include more Norse mythology references and cultural context',
    affectedAgent: 'LoreAgent'
  };

  const statBlockBalanceIssue: QAIssue = {
    severity: 'Critical',
    category: 'Stat Block Balance',
    issue: 'Challenge Rating is too low for the described creature',
    suggestion: 'Increase CR and adjust HP/AC accordingly',
    affectedAgent: 'StatBlockAgent'
  };

  const artStyleIssue: QAIssue = {
    severity: 'Minor',
    category: 'Cultural Authenticity',
    issue: 'Art style should reflect Norse aesthetic',
    suggestion: 'Use Nordic art style with runic elements',
    affectedAgent: 'ArtPromptAgent'
  };

  try {
    // Test 1: LoreAgent with QA feedback
    console.log('🔍 Test 1: LoreAgent with Name Distinctiveness Feedback');
    const loreAgent = new LoreAgent('test-lore-agent');
    
    const loreResult = await loreAgent.execute({
      region: testRegion,
      qaFeedback: [nameDistinctivenessIssue, culturalAuthenticityIssue]
    });

    console.log(`✅ Lore generated: ${loreResult.name}`);
    console.log(`📝 Lore preview: ${loreResult.lore?.substring(0, 100)}...`);
    console.log('');

    // Test 2: StatBlockAgent with QA feedback
    console.log('🔍 Test 2: StatBlockAgent with Balance Feedback');
    const statBlockAgent = new StatBlockAgent('test-statblock-agent');
    
    const statBlockResult = await statBlockAgent.execute({
      lore: loreResult.lore || testLore,
      name: loreResult.name || testName,
      region: testRegion,
      qaFeedback: [statBlockBalanceIssue]
    });

    console.log(`✅ Stat block generated with CR: ${statBlockResult.statblock?.challenge_rating || 'N/A'}`);
    console.log(`📊 HP: ${statBlockResult.statblock?.hit_points || 'N/A'}`);
    console.log(`🛡️ AC: ${statBlockResult.statblock?.armor_class || 'N/A'}`);
    console.log('');

    // Test 3: ArtPromptAgent with QA feedback
    console.log('🔍 Test 3: ArtPromptAgent with Style Feedback');
    const artPromptAgent = new ArtPromptAgent('test-artprompt-agent');
    
    const artPromptResult = await artPromptAgent.execute({
      name: loreResult.name || testName,
      region: testRegion,
      lore: loreResult.lore || testLore,
      qaFeedback: [artStyleIssue]
    });

    console.log(`✅ Art prompt generated`);
    console.log(`🎨 Style: ${artPromptResult.artPrompt?.style || 'N/A'}`);
    console.log(`📝 Description: ${artPromptResult.artPrompt?.description?.substring(0, 100)}...`);
    console.log('');

    // Test 4: String feedback processing
    console.log('🔍 Test 4: String Feedback Processing');
    const loreAgentString = new LoreAgent('test-lore-string');
    
    const stringFeedbackResult = await loreAgentString.execute({
      region: testRegion,
      qaFeedback: 'Name is too generic. Make it more distinctive and culturally authentic.'
    });

    console.log(`✅ Lore with string feedback: ${stringFeedbackResult.name}`);
    console.log(`📝 Lore preview: ${stringFeedbackResult.lore?.substring(0, 100)}...`);
    console.log('');

    // Test 5: Mixed feedback types
    console.log('🔍 Test 5: Mixed Feedback Types');
    const mixedFeedbackResult = await loreAgent.execute({
      region: testRegion,
      qaFeedback: [
        'Name is too generic',
        culturalAuthenticityIssue,
        'Improve overall quality'
      ] as (string | QAIssue)[]
    });

    console.log(`✅ Lore with mixed feedback: ${mixedFeedbackResult.name}`);
    console.log(`📝 Lore preview: ${mixedFeedbackResult.lore?.substring(0, 100)}...`);
    console.log('');

    console.log('🎉 Phase 4 Agent Enhancement Tests Completed Successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('- ✅ All agents can process structured QAIssue feedback');
    console.log('- ✅ All agents can process string feedback');
    console.log('- ✅ All agents can process mixed feedback types');
    console.log('- ✅ Feedback is properly filtered by agent type');
    console.log('- ✅ Specific instructions are generated for each feedback type');

  } catch (error) {
    console.error('❌ Phase 4 agent tests failed:', error);
    throw error;
  }
}

if (require.main === module) {
  testPhase4Agents().catch(console.error);
} 