#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { QAReview } from '../types/qa-feedback';
import { classifyQAIssues } from '../lib/utils/qa-classification';
import { LoreAgent } from '../agents/LoreAgent';
import { StatBlockAgent } from '../agents/StatBlockAgent';
import { CitationAgent } from '../agents/CitationAgent';
import { ArtPromptAgent } from '../agents/ArtPromptAgent';
import { QAAgent } from '../agents/QAAgent';

// Test monster interface
interface TestMonster {
  name: string;
  region: string;
  lore: string;
  statblock: any;
  citations?: any[];
  artPrompt?: any;
}

// Enhanced QA agent
async function enhancedQAAgent(monster: TestMonster): Promise<QAReview> {
  const qaAgent = new QAAgent('qa-test');
  const result = await qaAgent.execute({
    name: monster.name,
    region: monster.region,
    lore: monster.lore,
    statblock: monster.statblock,
    citations: monster.citations || [],
    artPrompt: monster.artPrompt || {}
  });
  
  const classifiedIssues = classifyQAIssues(result.qaReview);
  
  return {
    ...result.qaReview,
    issues: classifiedIssues
  };
}

// Test individual agents with feedback
async function testLoreAgentWithFeedback() {
  console.log('\n🧪 Testing LoreAgent with QA Feedback');
  console.log('=====================================');
  
  const loreAgent = new LoreAgent('lore-test');
  
  // Test 1: No feedback
  console.log('\n📝 Test 1: No QA Feedback');
  const result1 = await loreAgent.execute({
    region: 'Norse',
    name: 'Troll'
  });
  console.log(`Name: ${result1.name}`);
  console.log(`Lore: ${result1.lore?.substring(0, 100)}...`);
  
  // Test 2: With feedback
  console.log('\n📝 Test 2: With QA Feedback');
  const result2 = await loreAgent.execute({
    region: 'Norse',
    name: 'Troll',
    qaFeedback: 'The name is too generic. Generate a more distinctive, culturally authentic name and lore.'
  });
  console.log(`Name: ${result2.name}`);
  console.log(`Lore: ${result2.lore?.substring(0, 100)}...`);
  
  // Test 3: Multiple feedback items
  console.log('\n📝 Test 3: Multiple QA Feedback Items');
  const result3 = await loreAgent.execute({
    region: 'Norse',
    name: 'Troll',
    qaFeedback: [
      'The name is too generic.',
      'Add more cultural context and Norse mythology references.'
    ]
  });
  console.log(`Name: ${result3.name}`);
  console.log(`Lore: ${result3.lore?.substring(0, 100)}...`);
}

async function testStatBlockAgentWithFeedback() {
  console.log('\n🧪 Testing StatBlockAgent with QA Feedback');
  console.log('===========================================');
  
  const statBlockAgent = new StatBlockAgent('statblock-test');
  const sampleLore = 'A fearsome giant from the icy north with the ability to breathe gales of glacial wind.';
  
  // Test 1: No feedback
  console.log('\n📝 Test 1: No QA Feedback');
  const result1 = await statBlockAgent.execute({
    lore: sampleLore,
    name: 'Troll',
    region: 'Norse'
  });
  console.log(`Challenge Rating: ${result1.statblock?.challengeRating || 'N/A'}`);
  console.log(`Actions: ${result1.statblock?.actions?.length || 0} actions`);
  
  // Test 2: With feedback
  console.log('\n📝 Test 2: With QA Feedback');
  const result2 = await statBlockAgent.execute({
    lore: sampleLore,
    name: 'Troll',
    region: 'Norse',
    qaFeedback: 'The challenge rating is too low for the described abilities. Increase it and add more powerful actions.'
  });
  console.log(`Challenge Rating: ${result2.statblock?.challengeRating || 'N/A'}`);
  console.log(`Actions: ${result2.statblock?.actions?.length || 0} actions`);
}

async function testCitationAgentWithFeedback() {
  console.log('\n🧪 Testing CitationAgent with QA Feedback');
  console.log('==========================================');
  
  const citationAgent = new CitationAgent('citation-test');
  
  // Test 1: No feedback
  console.log('\n📝 Test 1: No QA Feedback');
  const result1 = await citationAgent.execute({
    name: 'Troll',
    region: 'Norse',
    description: 'A fearsome giant from the icy north.'
  });
  console.log(`Citations: ${result1.citations?.length || 0} citations`);
  
  // Test 2: With feedback
  console.log('\n📝 Test 2: With QA Feedback');
  const result2 = await citationAgent.execute({
    name: 'Troll',
    region: 'Norse',
    description: 'A fearsome giant from the icy north.',
    qaFeedback: 'Add more scholarly sources and primary Norse mythology references.'
  });
  console.log(`Citations: ${result2.citations?.length || 0} citations`);
}

async function testArtPromptAgentWithFeedback() {
  console.log('\n🧪 Testing ArtPromptAgent with QA Feedback');
  console.log('===========================================');
  
  const artPromptAgent = new ArtPromptAgent('artprompt-test');
  
  // Test 1: No feedback
  console.log('\n📝 Test 1: No QA Feedback');
  const result1 = await artPromptAgent.execute({
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.'
  });
  console.log(`Art Prompt Style: ${result1.artPrompt?.style || 'N/A'}`);
  
  // Test 2: With feedback
  console.log('\n📝 Test 2: With QA Feedback');
  const result2 = await artPromptAgent.execute({
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.',
    qaFeedback: 'Make the art style more culturally authentic to Norse mythology and use a Nordic woodcut style.'
  });
  console.log(`Art Prompt Style: ${result2.artPrompt?.style || 'N/A'}`);
}

// Test full refinement loop with enhanced agents
async function testFullRefinementLoop() {
  console.log('\n🧪 Testing Full Refinement Loop with Enhanced Agents');
  console.log('=====================================================');
  
  // Start with a basic monster
  let monster: TestMonster = {
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.',
    statblock: { challengeRating: 3 }
  };
  
  console.log('\n📋 Initial Monster:');
  console.log(`Name: ${monster.name}`);
  console.log(`Lore: ${monster.lore}`);
  console.log(`Stat Block: ${JSON.stringify(monster.statblock)}`);
  
  // Run QA to identify issues
  console.log('\n🔍 Running QA Review...');
  const qaReview = await enhancedQAAgent(monster);
  console.log(`QA Score: ${qaReview.overallScore}/5.0`);
  console.log(`Issues Found: ${qaReview.issues.length}`);
  
  // Apply targeted feedback to each agent
  for (const issue of qaReview.issues) {
    console.log(`\n🔧 Fixing: [${issue.category}] ${issue.issue}`);
    console.log(`Target Agent: ${issue.affectedAgent}`);
    
    let feedback = issue.instruction || issue.suggestion;
    
    switch (issue.affectedAgent) {
      case 'LoreAgent':
        const loreAgent = new LoreAgent('lore-refinement');
        const loreResult = await loreAgent.execute({
          region: monster.region,
          name: monster.name,
          qaFeedback: feedback
        });
        monster.name = loreResult.name || monster.name;
        monster.lore = loreResult.lore || monster.lore;
        console.log(`✅ Updated: Name="${monster.name}", Lore="${monster.lore.substring(0, 50)}..."`);
        break;
        
      case 'StatBlockAgent':
        const statBlockAgent = new StatBlockAgent('statblock-refinement');
        const statResult = await statBlockAgent.execute({
          lore: monster.lore,
          name: monster.name,
          region: monster.region,
          qaFeedback: feedback
        });
        monster.statblock = statResult.statblock;
        console.log(`✅ Updated: Stat Block with CR ${monster.statblock?.challengeRating || 'N/A'}`);
        break;
        
      case 'CitationAgent':
        const citationAgent = new CitationAgent('citation-refinement');
        const citationResult = await citationAgent.execute({
          name: monster.name,
          region: monster.region,
          description: monster.lore,
          qaFeedback: feedback
        });
        monster.citations = citationResult.citations;
        console.log(`✅ Updated: ${monster.citations?.length || 0} citations`);
        break;
        
      case 'ArtPromptAgent':
        const artPromptAgent = new ArtPromptAgent('artprompt-refinement');
        const artResult = await artPromptAgent.execute({
          name: monster.name,
          region: monster.region,
          lore: monster.lore,
          qaFeedback: feedback
        });
        monster.artPrompt = artResult.artPrompt;
        console.log(`✅ Updated: Art Prompt with style "${monster.artPrompt?.style || 'N/A'}"`);
        break;
    }
  }
  
  // Final QA review
  console.log('\n🔍 Final QA Review...');
  const finalQA = await enhancedQAAgent(monster);
  console.log(`Final QA Score: ${finalQA.overallScore}/5.0`);
  console.log(`Remaining Issues: ${finalQA.issues.length}`);
  
  console.log('\n📋 Final Monster:');
  console.log(`Name: ${monster.name}`);
  console.log(`Lore: ${monster.lore.substring(0, 100)}...`);
  console.log(`Stat Block: CR ${monster.statblock?.challengeRating || 'N/A'}`);
  console.log(`Citations: ${monster.citations?.length || 0}`);
  console.log(`Art Prompt: ${monster.artPrompt ? 'Generated' : 'None'}`);
}

// Main test function
async function testPhase4Agents() {
  console.log('🧪 Testing Phase 4: Enhanced Agents with QA Feedback');
  console.log('=====================================================\n');
  
  // Test individual agents
  await testLoreAgentWithFeedback();
  await testStatBlockAgentWithFeedback();
  await testCitationAgentWithFeedback();
  await testArtPromptAgentWithFeedback();
  
  // Test full refinement loop
  await testFullRefinementLoop();
}

if (require.main === module) {
  testPhase4Agents().catch(console.error);
} 