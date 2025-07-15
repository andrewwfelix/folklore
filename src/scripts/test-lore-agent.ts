#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { LoreAgent } from '../agents/LoreAgent';

async function testLoreAgent() {
  console.log('🧙‍♂️ Testing LoreAgent');
  console.log('=====================\n');

  try {
    // Create a test input
    const testInput: any = {
      region: 'Japan',
      tags: ['yokai', 'supernatural'],
      description: 'A mysterious creature from Japanese folklore that dwells in sacred groves'
    };
    // Let the agent generate a name by not providing one

    console.log('📝 Test Input:');
    console.log(`  Region: ${testInput.region}`);
    console.log(`  Tags: ${testInput.tags?.join(', ')}`);
    console.log(`  Description: ${testInput.description}\n`);

    // Create and run the agent
    const loreAgent = new LoreAgent('test-lore-agent');
    console.log('🚀 Running LoreAgent...\n');

    const result = await loreAgent.execute(testInput);

    console.log('✅ LoreAgent Results:');
    console.log(`  Name: ${result.name}`);
    console.log(`  Region: ${result.region}`);
    console.log(`  Tags: ${result.tags?.join(', ')}`);
    console.log(`  Status: ${result.status}`);
    console.log('\n📖 Generated Lore:');
    console.log('─'.repeat(50));
    console.log(result.lore);
    console.log('─'.repeat(50));

    // Validate the result
    if (!result.lore || result.lore.length < 100) {
      throw new Error('Generated lore is too short');
    }

    if (!result.name) {
      throw new Error('No name generated');
    }

    console.log('\n🎉 LoreAgent test passed!');
    return result;

  } catch (error) {
    console.error('❌ LoreAgent test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testLoreAgent().catch(console.error);
}

export { testLoreAgent }; 