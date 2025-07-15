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

// Enhanced monster type with tracking
interface Monster {
  name: string;
  region: string;
  lore: string;
  statblock: any;
  citations?: any[];
  artPrompt?: any;
  refinementLog?: string[];
  qaScore?: number;
  iterationCount?: number;
}

// Refinement configuration
interface RefinementConfig {
  maxIterations: number;
  minScore: number;
  maxConsecutiveFailures: number;
  improvementThreshold: number;
}

// Iteration result tracking
interface IterationResult {
  monster: Monster;
  qaReview: QAReview;
  improvements: string[];
  scoreChange: number;
  success: boolean;
}

// Enhanced QA agent with scoring
async function enhancedQAAgent(monster: Monster): Promise<QAReview> {
  const qaAgent = new QAAgent('qa-refinement');
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

// Real agents with feedback
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

// Enhanced agent router with tracking
async function applyAgentAction(monster: Monster, issue: QAIssue): Promise<Monster> {
  let update: Partial<Monster> = {};
  let agentUsed = 'Unknown';
  
  if (issue.affectedAgent === 'LoreAgent') {
    update = await realLoreAgent(monster, issue.instruction || '');
    agentUsed = 'LoreAgent';
  } else if (issue.affectedAgent === 'StatBlockAgent') {
    update = await realStatBlockAgent(monster, issue.instruction || '');
    agentUsed = 'StatBlockAgent';
  } else if (issue.affectedAgent === 'CitationAgent') {
    update = await realCitationAgent(monster, issue.instruction || '');
    agentUsed = 'CitationAgent';
  } else if (issue.affectedAgent === 'ArtPromptAgent') {
    update = await realArtPromptAgent(monster, issue.instruction || '');
    agentUsed = 'ArtPromptAgent';
  }
  
  const logEntry = `Applied ${agentUsed} for issue: [${issue.category}] ${issue.issue} (Severity: ${issue.severity})`;
  return { 
    ...monster, 
    ...update, 
    refinementLog: [...(monster.refinementLog || []), logEntry],
    iterationCount: (monster.iterationCount || 0) + 1
  };
}

// Enhanced refinement loop with success criteria
async function enhancedRefinementLoop(
  monster: Monster, 
  config: RefinementConfig = {
    maxIterations: 3,
    minScore: 4.0,
    maxConsecutiveFailures: 2,
    improvementThreshold: 0.5
  }
): Promise<{ monster: Monster; iterations: IterationResult[]; finalStatus: string }> {
  let current: Monster = { 
    ...monster, 
    refinementLog: monster.refinementLog ?? [],
    iterationCount: 0
  };
  
  const iterations: IterationResult[] = [];
  let consecutiveFailures = 0;
  let bestMonster = current;
  let bestScore = 0;

  console.log(`🎯 Starting refinement with config:`, config);

  for (let i = 0; i < config.maxIterations; i++) {
    console.log(`\n🔄 Iteration ${i + 1}/${config.maxIterations}`);
    
    // Get QA review
    const qaReview = await enhancedQAAgent(current);
    const currentScore = qaReview.overallScore;
    
    console.log(`📊 QA Score: ${currentScore.toFixed(1)}/5.0 (Target: ${config.minScore})`);
    console.log(`📝 QA Summary: ${qaReview.summary}`);
    
    // Track best version
    if (currentScore > bestScore) {
      bestMonster = { ...current };
      bestScore = currentScore;
    }
    
    // Check success criteria
    if (currentScore >= config.minScore) {
      console.log(`✅ Success! Score ${currentScore.toFixed(1)} >= ${config.minScore}`);
      iterations.push({
        monster: current,
        qaReview,
        improvements: [],
        scoreChange: currentScore - (iterations[iterations.length - 1]?.qaReview.overallScore || 0),
        success: true
      });
      break;
    }
    
    // Check for no issues (perfect score)
    if (qaReview.issues.length === 0) {
      console.log(`🎉 Perfect! No issues found.`);
      iterations.push({
        monster: current,
        qaReview,
        improvements: [],
        scoreChange: currentScore - (iterations[iterations.length - 1]?.qaReview.overallScore || 0),
        success: true
      });
      break;
    }
    
         // Apply improvements
     const improvements: string[] = [];
     for (const issue of qaReview.issues) {
       console.log(`  🔧 Fixing: [${issue.category}] ${issue.issue} (Severity: ${issue.severity})`);
       current = await applyAgentAction(current, issue);
       improvements.push(`${issue.affectedAgent}: ${issue.category}`);
     }
    
    // Track iteration result
    const scoreChange = currentScore - (iterations[iterations.length - 1]?.qaReview.overallScore || 0);
    const iterationResult: IterationResult = {
      monster: current,
      qaReview,
      improvements,
      scoreChange,
      success: scoreChange > config.improvementThreshold
    };
    
    iterations.push(iterationResult);
    
    // Check for consecutive failures
    if (scoreChange <= config.improvementThreshold) {
      consecutiveFailures++;
      console.log(`⚠️  No significant improvement (${scoreChange.toFixed(1)}). Consecutive failures: ${consecutiveFailures}`);
      
      if (consecutiveFailures >= config.maxConsecutiveFailures) {
        console.log(`🛑 Too many consecutive failures. Using best version.`);
        break;
      }
    } else {
      consecutiveFailures = 0;
      console.log(`📈 Improvement: +${scoreChange.toFixed(1)}`);
    }
    
    console.log(`📋 Refinement log: ${current.refinementLog?.length || 0} actions`);
  }
  
  // Determine final status
  const finalScore = iterations[iterations.length - 1]?.qaReview.overallScore || 0;
  let finalStatus: string;
  
  if (finalScore >= config.minScore) {
    finalStatus = 'SUCCESS';
  } else if (iterations.length >= config.maxIterations) {
    finalStatus = 'MAX_ITERATIONS_REACHED';
  } else if (consecutiveFailures >= config.maxConsecutiveFailures) {
    finalStatus = 'CONSECUTIVE_FAILURES';
  } else {
    finalStatus = 'UNKNOWN';
  }
  
  return {
    monster: bestMonster,
    iterations,
    finalStatus
  };
}

// Test function
async function testPhase3Refinement() {
  console.log('🧪 Testing Phase 3: Enhanced Iterative Refinement Loop');
  console.log('======================================================\n');

  // Start with a generic monster
  const monster: Monster = {
    name: 'Troll',
    region: 'Norse',
    lore: 'A fearsome giant from the icy north.',
    statblock: { challengeRating: 3 },
    refinementLog: []
  };

  // Test with different configs
  const configs = [
    {
      name: 'Strict Config',
      config: {
        maxIterations: 3,
        minScore: 4.5,
        maxConsecutiveFailures: 1,
        improvementThreshold: 0.5
      }
    },
    {
      name: 'Balanced Config',
      config: {
        maxIterations: 3,
        minScore: 4.0,
        maxConsecutiveFailures: 2,
        improvementThreshold: 0.3
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\n🎯 Testing ${name}:`);
    console.log(`   Max Iterations: ${config.maxIterations}`);
    console.log(`   Min Score: ${config.minScore}`);
    console.log(`   Max Consecutive Failures: ${config.maxConsecutiveFailures}`);
    console.log(`   Improvement Threshold: ${config.improvementThreshold}`);
    
    const result = await enhancedRefinementLoop(monster, config);
    
    console.log(`\n📊 Results for ${name}:`);
    console.log(`   Final Status: ${result.finalStatus}`);
    console.log(`   Iterations: ${result.iterations.length}`);
    console.log(`   Best Score: ${result.monster.qaScore?.toFixed(1) || 'N/A'}`);
    console.log(`   Final Monster: ${result.monster.name}`);
    
    if (result.iterations.length > 0) {
      console.log(`   Score Progression: ${result.iterations.map(i => i.qaReview.overallScore.toFixed(1)).join(' → ')}`);
    }
  }
}

if (require.main === module) {
  testPhase3Refinement().catch(console.error);
} 