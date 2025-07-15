#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { StatBlockAgent } from '../agents/StatBlockAgent';

async function testStatBlockAgent() {
  console.log('🛡️  Testing StatBlockAgent');
  console.log('==========================\n');

  try {
    // Use a sample lore string (from the LoreAgent test or statblock prompt example)
    const testInput = {
      lore: 'The Kitsune-no-Mori is a nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers.'
    };

    console.log('📝 Test Input:');
    console.log(`  Lore: ${testInput.lore}\n`);

    // Create and run the agent
    const statBlockAgent = new StatBlockAgent('test-statblock-agent');
    console.log('🚀 Running StatBlockAgent...\n');

    const result = await statBlockAgent.execute(testInput);

    console.log('✅ StatBlockAgent Results:');
    console.log('  Stat Block:');
    console.log('─'.repeat(50));
    console.dir(result.statblock, { depth: null, colors: true });
    console.log('─'.repeat(50));

    // Validate the result
    if (!result.statblock || typeof result.statblock !== 'object') {
      throw new Error('No stat block generated');
    }
    if (!result.statblock.armorClass || !result.statblock.hitPoints) {
      throw new Error('Stat block missing required fields');
    }

    console.log('\n🎉 StatBlockAgent test passed!');
    return result;

  } catch (error) {
    console.error('❌ StatBlockAgent test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testStatBlockAgent().catch(console.error);
}

export { testStatBlockAgent }; 