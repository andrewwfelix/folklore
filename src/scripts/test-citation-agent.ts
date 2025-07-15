#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { CitationAgent } from '../agents/CitationAgent';

async function testCitationAgent() {
  console.log('📚 Testing CitationAgent');
  console.log('========================\n');

  try {
    // Use sample input for testing
    const testInput = {
      name: 'Kitsune-no-Mori',
      region: 'Japan',
      description: 'A nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers'
    };

    console.log('📝 Test Input:');
    console.log(`  Name: ${testInput.name}`);
    console.log(`  Region: ${testInput.region}`);
    console.log(`  Description: ${testInput.description}\n`);

    // Create and run the agent
    const citationAgent = new CitationAgent('test-citation-agent');
    console.log('🚀 Running CitationAgent...\n');

    const result = await citationAgent.execute(testInput);

    console.log('✅ CitationAgent Results:');
    console.log('  Citations:');
    console.log('─'.repeat(50));
    console.dir(result.citations, { depth: null, colors: true });
    console.log('─'.repeat(50));

    // Validate the result
    if (!result.citations || !Array.isArray(result.citations)) {
      throw new Error('No citations array generated');
    }
    if (result.citations.length === 0) {
      throw new Error('Citations array is empty');
    }
    
    // Validate each citation has required fields
    for (const citation of result.citations) {
      if (!citation.title || !citation.url || !citation.source) {
        throw new Error('Citation missing required fields (title, url, source)');
      }
    }

    console.log(`\n📊 Generated ${result.citations.length} citations`);
    console.log('🎉 CitationAgent test passed!');
    return result;

  } catch (error) {
    console.error('❌ CitationAgent test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCitationAgent().catch(console.error);
}

export { testCitationAgent }; 