#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { QAReview, QAIssue } from '../types/qa-feedback';
import { classifyQAIssues } from '../lib/utils/qa-classification';
import { LoreAgent, LoreAgentInput } from '../agents/LoreAgent';
import { StatBlockAgent, StatBlockAgentInput } from '../agents/StatBlockAgent';
import { CitationAgent, CitationAgentInput } from '../agents/CitationAgent';
import { ArtPromptAgent, ArtPromptAgentInput } from '../agents/ArtPromptAgent';
import { QAAgent } from '../agents/QAAgent';

// Mock monster type
interface Monster {
  name: string;
  region: string;
  lore: string;
  statblock: any;
  citations?: any[];
  artPrompt?: any;
  refinementLog?: string[];
}

// Real QA agent
async function realQAAgent(monster: Monster): Promise<QAReview> {
  const qaAgent = new QAAgent('qa-refinement');
  const result = await qaAgent.execute({
    name: monster.name,
    region: monster.region,
    lore: monster.lore,
    statblock: monster.statblock,
    citations: monster.citations || [],
    artPrompt: monster.artPrompt || {}
  });
  
  // Use our classification system to add affectedAgent and instruction properties
  const classifiedIssues = classifyQAIssues(result.qaReview);
  
  return {
    ...result.qaReview,
    issues: classifiedIssues
  };
}

// Real LoreAgent
async function realLoreAgent(monster: Monster, feedback: string): Promise<Partial<Monster>> {
  const loreAgent = new LoreAgent('lore-refinement');
  const input: LoreAgentInput = {
    region: monster.region,
    name: monster.name,
    qaFeedback: feedback
  };
  const result = await loreAgent.execute(input);
  return { 
    name: result.name || monster.name, 
    lore: result.lore || monster.lore 
  };
}

// Real StatBlockAgent
async function realStatBlockAgent(monster: Monster, feedback: string): Promise<Partial<Monster>> {
  const statBlockAgent = new StatBlockAgent('statblock-refinement');
  const input: StatBlockAgentInput = {
    lore: monster.lore,
    name: monster.name,
    region: monster.region,
    qaFeedback: feedback
  };
  const result = await statBlockAgent.execute(input);
  return { statblock: result.statblock };
}

// Real CitationAgent
async function realCitationAgent(monster: Monster, feedback: string): Promise<Partial<Monster>> {
  const citationAgent = new CitationAgent('citation-refinement');
  const input: CitationAgentInput = {
    name: monster.name,
    region: monster.region,
    description: monster.lore,
    qaFeedback: feedback
  };
  const result = await citationAgent.execute(input);
  return { citations: result.citations };
}

// Real ArtPromptAgent
async function realArtPromptAgent(monster: Monster, feedback: string): Promise<Partial<Monster>> {
  const artPromptAgent = new ArtPromptAgent('artprompt-refinement');
  const input: ArtPromptAgentInput = {
    name: monster.name,
    region: monster.region,
    lore: monster.lore,
    qaFeedback: feedback
  };
  const result = await artPromptAgent.execute(input);
  return { artPrompt: result.artPrompt };
}

// Agent router
async function applyAgentAction(monster: Monster, issue: QAIssue): Promise<Monster> {
  let update: Partial<Monster> = {};
  if (issue.affectedAgent === 'LoreAgent') {
    update = await realLoreAgent(monster, issue.instruction || '');
  } else if (issue.affectedAgent === 'StatBlockAgent') {
    update = await realStatBlockAgent(monster, issue.instruction || '');
  } else if (issue.affectedAgent === 'CitationAgent') {
    update = await realCitationAgent(monster, issue.instruction || '');
  } else if (issue.affectedAgent === 'ArtPromptAgent') {
    update = await realArtPromptAgent(monster, issue.instruction || '');
  }
  const logEntry = `Applied ${issue.affectedAgent} for issue: [${issue.category}] ${issue.issue}`;
  return { ...monster, ...update, refinementLog: [...(monster.refinementLog || []), logEntry] };
}

// Refinement loop
async function refinementLoop(monster: Monster, maxIterations = 3): Promise<Monster> {
  let current: Monster = { ...monster, refinementLog: monster.refinementLog ?? [] };
  for (let i = 0; i < maxIterations; i++) {
    console.log(`\n🔄 Iteration ${i + 1}`);
    const qa = await realQAAgent(current);
    console.log('QA Review:', qa.summary);
    if (qa.issues.length === 0) {
      console.log('✅ No issues found. QA passed!');
      break;
    }
    for (const issue of qa.issues) {
      console.log(`  - Issue: [${issue.category}] ${issue.issue} (Severity: ${issue.severity})`);
      console.log(`    → Action: ${issue.affectedAgent} | ${issue.instruction}`);
      current = await applyAgentAction(current, issue);
    }
    console.log('Refinement log so far:', current.refinementLog);
  }
  return current;
}

// Test runner
async function testRefinementLoop() {
  console.log('🧪 Testing Real Agent Refinement Loop');
  console.log('=====================================\n');

  // Start with a generic monster
  const monster: Monster = {
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.',
    statblock: { challengeRating: 3 },
    refinementLog: []
  };

  const result = await refinementLoop(monster, 3);

  console.log('\n🎉 Final Monster After Refinement:');
  console.log(result);
  console.log('\n📝 Refinement Log:');
  (result.refinementLog || []).forEach((entry, i) => console.log(`  ${i + 1}. ${entry}`));
}

if (require.main === module) {
  testRefinementLoop().catch(console.error);
} 