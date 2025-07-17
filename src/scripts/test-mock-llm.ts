import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config } from '../config';
import { LoreAgent } from '../agents/LoreAgent';
import { StatBlockAgent } from '../agents/StatBlockAgent';

async function testMockLLM() {
  console.log('🧪 Testing MOCK_LLM functionality\n');
  
  console.log(`📋 Current MOCK_LLM setting: ${config.development.mockLLM ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔧 Environment variable: ${process.env['MOCK_LLM']}\n`);
  
  // Test LoreAgent
  console.log('📚 Testing LoreAgent with mock mode...');
  const loreAgent = new LoreAgent('test-lore');
  
  try {
    const loreResult = await loreAgent.execute({
      region: 'Japan',
      tags: ['mythical', 'dangerous']
    });
    
    console.log('✅ LoreAgent mock test passed');
    console.log(`📖 Generated lore: ${loreResult.lore?.substring(0, 100)}...\n`);
  } catch (error) {
    console.log('❌ LoreAgent mock test failed:', error);
  }
  
  // Test StatBlockAgent
  console.log('⚔️ Testing StatBlockAgent with mock mode...');
  const statBlockAgent = new StatBlockAgent('test-statblock');
  
  try {
    const statBlockResult = await statBlockAgent.execute({
      lore: 'A mythical creature from Japanese folklore',
      name: 'Nue',
      region: 'Japan'
    });
    
    console.log('✅ StatBlockAgent mock test passed');
    console.log(`📊 Generated stat block name: ${statBlockResult.statblock?.name}`);
    console.log(`📊 Generated stat block CR: ${statBlockResult.statblock?.challengeRating}\n`);
  } catch (error) {
    console.log('❌ StatBlockAgent mock test failed:', error);
  }
  
  console.log('🎯 Mock LLM test completed!');
}

// Run the test
testMockLLM().catch(console.error); 