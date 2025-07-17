#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { MonsterPersistence } from '../lib/utils/monster-persistence';
import { createMonsterFromTemplate, DRAGON_TEMPLATE } from '../templates/statblock-templates';

async function testHomebreweryIntegration() {
  console.log('🏠 Testing Homebrewery Integration');
  console.log('==================================\n');

  try {
    // Create a test monster from template
    const testMonster = createMonsterFromTemplate(
      'Test Dragon',
      'Test Mountains',
      DRAGON_TEMPLATE
    );

    // Add custom lore to the monster
    testMonster.lore = {
      content: 'A magnificent dragon that dwells in the test mountains. Its scales shimmer with ancient magic and its breath can melt stone.',
      format: 'plain',
      metadata: {
        word_count: 25,
        language: 'en',
        version: '1.0',
        generated_by: 'test_script'
      }
    };

    console.log('📝 Created test monster:');
    console.log(`   Name: ${testMonster.name}`);
    console.log(`   Region: ${testMonster.region}`);
    console.log(`   CR: ${testMonster.statblock.challengeRating}`);
    console.log(`   HP: ${testMonster.statblock.hitPoints}`);
    console.log('');

    // Save the monster using the persistence system
    const persistence = new MonsterPersistence();
    const monsterId = await persistence.saveMonster({
      name: testMonster.name,
      region: testMonster.region,
      tags: testMonster.tags,
      lore: testMonster.lore.content,
      statBlock: testMonster.statblock,
      monsterJson: testMonster,
      status: 'complete'
    });

    console.log(`✅ Monster saved with ID: ${monsterId}`);

    // Retrieve the monster and check if Homebrewery markup was generated
    const retrievedMonster = await persistence.getMonster(monsterId);
    
    if (retrievedMonster) {
      console.log('\n📋 Retrieved Monster Details:');
      console.log(`   Name: ${retrievedMonster.name}`);
      console.log(`   Region: ${retrievedMonster.region}`);
      console.log(`   Has monster_json: ${retrievedMonster.monsterJson ? '✅ Yes' : '❌ No'}`);
      
      // Check if Homebrewery markup was saved by querying the database directly
      const { folkloreSupabase } = await import('../lib/supabase/folklore-client');
      const { data: markupData, error: markupError } = await folkloreSupabase
        .from('folklore_monsters')
        .select('monster_markup_homebrew')
        .eq('id', monsterId)
        .single();

      if (markupError) {
        console.log(`   ❌ Error fetching markup: ${markupError.message}`);
      } else if (markupData && markupData.monster_markup_homebrew) {
        console.log(`   🏠 Has Homebrewery markup: ✅ Yes (${markupData.monster_markup_homebrew.length} chars)`);
        
        // Display a preview of the markup
        const preview = markupData.monster_markup_homebrew.substring(0, 200) + '...';
        console.log(`   📄 Markup preview: ${preview}`);
      } else {
        console.log(`   🏠 Has Homebrewery markup: ❌ No`);
      }

      if (markupError) {
        console.log(`   ❌ Error fetching markup: ${markupError.message}`);
      } else if (markupData.monster_markup_homebrew) {
        console.log(`   🏠 Has Homebrewery markup: ✅ Yes (${markupData.monster_markup_homebrew.length} chars)`);
        
        // Display a preview of the markup
        const preview = markupData.monster_markup_homebrew.substring(0, 200) + '...';
        console.log(`   📄 Markup preview: ${preview}`);
      } else {
        console.log(`   🏠 Has Homebrewery markup: ❌ No`);
      }
    } else {
      console.log('❌ Failed to retrieve monster');
    }

    console.log('\n🎉 Homebrewery integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testHomebreweryIntegration().catch(console.error);
}

export { testHomebreweryIntegration }; 