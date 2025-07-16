import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { RefinementPipeline } from '../lib/utils/refinement-pipeline';
import { MonsterPersistence } from '../lib/utils/monster-persistence';

async function testMonsterJsonPersistence() {
  console.log('🧪 Testing Monster JSON Persistence');
  console.log('===================================\n');

  try {
    // Create refinement pipeline
    const pipeline = new RefinementPipeline({
      maxIterations: 3,
      enableLogging: true,
      enablePersistence: true,
      delayPDFGeneration: true
    });

    // Generate a monster
    console.log('🎭 Generating monster with JSON persistence...');
    const result = await pipeline.refineMonster('Japan');

    console.log('\n✅ Monster generation completed!');
    console.log(`📝 Monster ID: ${result.monsterId}`);
    console.log(`📝 Monster Name: ${result.monster.name}`);
    console.log(`📝 Monster Region: ${result.monster.region}`);

    // Check if monster JSON was saved
    if (result.monster.monsterJson) {
      console.log('\n📄 Monster JSON Structure:');
      console.log('==========================');
      console.log(`   • Name: ${result.monster.monsterJson.name}`);
      console.log(`   • Region: ${result.monster.monsterJson.region}`);
      console.log(`   • Lore length: ${result.monster.monsterJson.lore?.length || 0} characters`);
      console.log(`   • Statblock exists: ${!!result.monster.monsterJson.statblock}`);
      console.log(`   • Citations count: ${result.monster.monsterJson.citations?.length || 0}`);
      console.log(`   • Art exists: ${!!result.monster.monsterJson.art}`);
      console.log(`   • PDF Layout exists: ${!!result.monster.monsterJson.pdfLayout}`);
      
      console.log('\n📄 Complete Monster JSON:');
      console.log(JSON.stringify(result.monster.monsterJson, null, 2));
    } else {
      console.log('\n❌ Monster JSON was not saved!');
    }

    // Verify in database
    if (result.monsterId) {
      console.log('\n💾 Verifying database persistence...');
      const persistence = new MonsterPersistence();
      const savedMonster = await persistence.getMonster(result.monsterId);
      
      if (savedMonster?.monsterJson) {
        console.log('✅ Monster JSON found in database!');
        console.log(`   • Database monster JSON size: ${JSON.stringify(savedMonster.monsterJson).length} characters`);
        console.log(`   • Contains PDF Layout: ${!!savedMonster.monsterJson.pdfLayout}`);
      } else {
        console.log('❌ Monster JSON not found in database!');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMonsterJsonPersistence().catch(console.error); 