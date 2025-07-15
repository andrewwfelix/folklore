#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ArtPromptAgent } from '../agents/ArtPromptAgent';

async function testArtPromptAgent() {
  console.log('🎨 Testing ArtPromptAgent');
  console.log('=========================\n');

  try {
    // Use sample input for testing
    const testInput = {
      name: 'Kitsune-no-Mori',
      region: 'Japan',
      lore: 'A nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers. The creature takes the form of a fox with nine distinct tails, each representing a different aspect of nature\'s power. Local legends speak of travelers who encountered the Kitsune-no-Mori during twilight hours, when the boundary between the mortal realm and the spirit world grows thin.'
    };

    console.log('📝 Test Input:');
    console.log(`  Name: ${testInput.name}`);
    console.log(`  Region: ${testInput.region}`);
    console.log(`  Lore: ${testInput.lore.substring(0, 100)}...\n`);

    // Create and run the agent
    const artPromptAgent = new ArtPromptAgent('test-artprompt-agent');
    console.log('🚀 Running ArtPromptAgent...\n');

    const result = await artPromptAgent.execute(testInput);

    console.log('✅ ArtPromptAgent Results:');
    console.log('  Art Prompt:');
    console.log('─'.repeat(50));
    console.dir(result.artPrompt, { depth: null, colors: true });
    console.log('─'.repeat(50));

    // Validate the result
    if (!result.artPrompt || typeof result.artPrompt !== 'object') {
      throw new Error('No art prompt generated');
    }
    if (!result.artPrompt.prompt || !result.artPrompt.style) {
      throw new Error('Art prompt missing required fields (prompt, style)');
    }

    console.log('\n🎨 Generated Art Prompt:');
    console.log(`  Style: ${result.artPrompt.style}`);
    console.log(`  Prompt Length: ${result.artPrompt.prompt.length} characters`);
    console.log('🎉 ArtPromptAgent test passed!');
    return result;

  } catch (error) {
    console.error('❌ ArtPromptAgent test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testArtPromptAgent().catch(console.error);
}

export { testArtPromptAgent }; 