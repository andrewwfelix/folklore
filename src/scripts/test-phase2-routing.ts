#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { QAIssue } from '../types/qa-feedback';
import { classifyQAIssues } from '../lib/utils/qa-classification';

// Enhanced routing with action plan generation
interface ActionPlan {
  agent: string;
  instruction: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome: string;
  fallbackStrategy: string | undefined;
}

// Intelligent routing logic
function generateActionPlan(issue: QAIssue): ActionPlan {
  const severityPriority = {
    'Critical': 'high' as const,
    'Major': 'high' as const,
    'Minor': 'medium' as const
  };

  const priority = severityPriority[issue.severity] || 'medium';

  // Enhanced instruction generation based on issue type
  let instruction = issue.instruction || '';
  let expectedOutcome = '';

  switch (issue.category) {
    case 'Name Distinctiveness':
      instruction = `Generate a more distinctive and culturally appropriate name for this ${issue.affectedAgent === 'LoreAgent' ? 'monster' : 'creature'}. The current name "${issue.issue.split("'")[1] || 'is too generic'}" needs to be replaced with something unique and memorable.`;
      expectedOutcome = 'A distinctive, culturally authentic monster name';
      break;

    case 'Cultural Authenticity':
      instruction = `Enhance the cultural authenticity by incorporating more specific elements from ${issue.issue.includes('Norse') ? 'Norse mythology' : 'the region\'s folklore'}. Add cultural context, traditional beliefs, or historical references.`;
      expectedOutcome = 'Culturally rich and authentic content';
      break;

    case 'Stat Block Balance':
      instruction = `Adjust the stat block to better reflect the monster's described abilities and threat level. Ensure challenge rating, abilities, and actions are balanced and consistent.`;
      expectedOutcome = 'Balanced and consistent stat block';
      break;

    case 'Quality':
      instruction = `Complete the missing ${issue.issue.includes('Art Prompt') ? 'art prompt' : 'citations'} with detailed, high-quality content that matches the monster's description and cultural background.`;
      expectedOutcome = 'Complete and detailed content';
      break;

    case 'Consistency':
      instruction = `Fix inconsistencies between different components. Ensure the name, lore, stat block, and other elements are coherent and don't contradict each other.`;
      expectedOutcome = 'Consistent and coherent monster description';
      break;

    default:
      instruction = issue.instruction || 'Improve this aspect based on the QA feedback.';
      expectedOutcome = 'Improved quality based on feedback';
  }

  return {
    agent: issue.affectedAgent || 'Unknown',
    instruction,
    priority,
    expectedOutcome,
    fallbackStrategy: priority === 'high' ? 'Retry with different approach' : undefined
  };
}

// Batch routing for multiple issues
function routeIssues(issues: QAIssue[]): Map<string, ActionPlan[]> {
  const agentPlans = new Map<string, ActionPlan[]>();

  // Sort issues by priority (Critical > Major > Minor)
  const sortedIssues = issues.sort((a, b) => {
    const priorityOrder = { 'Critical': 3, 'Major': 2, 'Minor': 1 };
    return priorityOrder[b.severity] - priorityOrder[a.severity];
  });

  for (const issue of sortedIssues) {
    const plan = generateActionPlan(issue);
    const agent = plan.agent;
    
    if (!agentPlans.has(agent)) {
      agentPlans.set(agent, []);
    }
    agentPlans.get(agent)!.push(plan);
  }

  return agentPlans;
}

// Test function
async function testPhase2Routing() {
  console.log('🧪 Testing Phase 2: Intelligent Routing');
  console.log('========================================\n');

  // Sample QA issues from our previous test
  const sampleIssues: QAIssue[] = [
    {
      severity: 'Major',
      category: 'Name Distinctiveness',
      issue: "The monster name 'Troll' is too generic.",
      suggestion: "Change the name to something more distinctive.",
      affectedAgent: 'LoreAgent',
      instruction: 'Generate a more distinctive name.'
    },
    {
      severity: 'Minor',
      category: 'Quality',
      issue: "The 'Art Prompt' field is empty.",
      suggestion: "Add a detailed art prompt.",
      affectedAgent: 'ArtPromptAgent',
      instruction: 'Generate an art prompt.'
    },
    {
      severity: 'Minor',
      category: 'Stat Block Balance',
      issue: "The stat block only contains the challenge rating.",
      suggestion: "Add complete stat block information.",
      affectedAgent: 'StatBlockAgent',
      instruction: 'Generate a complete stat block.'
    },
    {
      severity: 'Major',
      category: 'Cultural Authenticity',
      issue: "The lore does not provide enough detail about the cultural context.",
      suggestion: "Add more cultural context and authenticity.",
      affectedAgent: 'LoreAgent',
      instruction: 'Enhance cultural authenticity.'
    }
  ];

  console.log('📋 Sample QA Issues:');
  sampleIssues.forEach((issue, i) => {
    console.log(`  ${i + 1}. [${issue.severity}] ${issue.category}: ${issue.issue}`);
  });

  console.log('\n🔄 Generating Action Plans...');
  const agentPlans = routeIssues(sampleIssues);

  console.log('\n📝 Action Plans by Agent:');
  for (const [agent, plans] of agentPlans) {
    console.log(`\n🤖 ${agent}:`);
    plans.forEach((plan, i) => {
      console.log(`  ${i + 1}. Priority: ${plan.priority.toUpperCase()}`);
      console.log(`     Instruction: ${plan.instruction}`);
      console.log(`     Expected: ${plan.expectedOutcome}`);
      if (plan.fallbackStrategy) {
        console.log(`     Fallback: ${plan.fallbackStrategy}`);
      }
    });
  }

  // Test with classified issues
  console.log('\n🧪 Testing with Classified Issues...');
  const mockQAReview = {
    issues: sampleIssues,
    overallScore: 2.5,
    status: 'needs_revision' as const,
    summary: 'Multiple issues found',
    recommendations: sampleIssues.map(i => i.suggestion)
  };

  const classifiedIssues = classifyQAIssues(mockQAReview);
  const classifiedPlans = routeIssues(classifiedIssues);

  console.log('\n📊 Classified Issues Routing:');
  for (const [agent, plans] of classifiedPlans) {
    console.log(`\n🤖 ${agent} (${plans.length} tasks):`);
    plans.forEach((plan, i) => {
      console.log(`  ${i + 1}. [${plan.priority}] ${plan.expectedOutcome}`);
    });
  }
}

if (require.main === module) {
  testPhase2Routing().catch(console.error);
} 