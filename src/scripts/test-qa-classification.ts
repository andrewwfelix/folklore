#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { classifyQAIssues, determineAffectedAgent, mapSeverityToPriority, generateSpecificInstruction } from '../lib/utils/qa-classification';
import { QAReview } from '../types/qa-feedback';

async function testQAClassification() {
  console.log('🔍 Testing QA Issue Classification (Phase 1)');
  console.log('============================================\n');

  try {
    // Test 1: Sample QA review with various issues
    console.log('🧪 Test 1: Classify QA issues from sample review');
    
    const sampleQAReview: QAReview = {
      overallScore: 3.0,
      status: 'needs_revision',
      issues: [
        {
          severity: 'Major',
          category: 'Name Distinctiveness',
          issue: "The monster's name is listed as 'Troll', which doesn't match the lore description or cultural origin.",
          suggestion: "Change the monster's name to 'Hrímþursar Frost Giant' to match the lore and cultural origin.",
          affectedAgent: 'LoreAgent'
        },
        {
          severity: 'Minor',
          category: 'Stat Block Balance',
          issue: 'The challenge rating seems slightly low for a creature with such high ability scores.',
          suggestion: 'Consider increasing the challenge rating to better match the creature\'s abilities.',
          affectedAgent: 'StatBlockAgent'
        },
        {
          severity: 'Critical',
          category: 'Cultural Authenticity',
          issue: "The monster's region is listed as Norse, but the lore and citations reference Japanese culture.",
          suggestion: 'Change the region to Japan to match the lore and citations.',
          affectedAgent: 'LoreAgent'
        }
      ],
      summary: 'The entry needs revision due to naming and cultural inconsistencies.',
      recommendations: [
        'Change the monster\'s name to be more distinctive',
        'Adjust the challenge rating',
        'Fix cultural region consistency'
      ]
    };

    console.log('📝 Sample QA Review:');
    console.log(`  Overall Score: ${sampleQAReview.overallScore}/5`);
    console.log(`  Status: ${sampleQAReview.status}`);
    console.log(`  Issues: ${sampleQAReview.issues.length}\n`);

    // Classify the issues
    const classifiedIssues = classifyQAIssues(sampleQAReview);
    
    console.log('✅ Classification Results:');
    classifiedIssues.forEach((issue, index) => {
      console.log(`  Issue ${index + 1}:`);
      console.log(`    Severity: ${issue.severity}`);
      console.log(`    Category: ${issue.category}`);
      console.log(`    Affected Agent: ${issue.affectedAgent}`);
      console.log(`    Priority: ${mapSeverityToPriority(issue.severity)}`);
      console.log(`    Instruction: ${generateSpecificInstruction(issue)}`);
      console.log('');
    });

    // Test 2: Test individual agent determination
    console.log('🧪 Test 2: Test agent determination for specific issues');
    
    const testCases = [
      { category: 'Name Distinctiveness', issue: 'Name is too generic', expected: 'LoreAgent' },
      { category: 'Stat Block Balance', issue: 'CR is too low', expected: 'StatBlockAgent' },
      { category: 'Cultural Authenticity', issue: 'Region mismatch', expected: 'LoreAgent' },
      { category: 'Quality', issue: 'Art style needs improvement', expected: 'ArtPromptAgent' }
    ];

    testCases.forEach((testCase, index) => {
      const agent = determineAffectedAgent(testCase.category, testCase.issue);
      const passed = agent === testCase.expected;
      console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} ${testCase.category} → ${agent} (expected: ${testCase.expected})`);
    });

    // Test 3: Test severity mapping
    console.log('\n🧪 Test 3: Test severity to priority mapping');
    
    const severityTests = [
      { severity: 'Critical', expected: 'immediate' },
      { severity: 'Major', expected: 'high' },
      { severity: 'Minor', expected: 'normal' }
    ];

    severityTests.forEach((test, index) => {
      const priority = mapSeverityToPriority(test.severity);
      const passed = priority === test.expected;
      console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} ${test.severity} → ${priority} (expected: ${test.expected})`);
    });

    console.log('\n🎉 QA Classification test completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - Issues classified: ${classifiedIssues.length}`);
    console.log(`  - Agent routing tested: ${testCases.length} cases`);
    console.log(`  - Severity mapping tested: ${severityTests.length} cases`);

  } catch (error) {
    console.error('❌ QA Classification test failed:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testQAClassification().catch(console.error);
} 