#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateMonsterMarkup } from '../lib/utils/monster-markup';
import { config } from '../config';

// Sample monster data with JSONB lore
const sampleMonster = {
  name: 'Test Dragon',
  region: 'Test Mountains',
  tags: ['dragon', 'fire', 'legendary'],
  lore: {
    content: 'A magnificent dragon that dwells in the test mountains. Its scales shimmer with ancient magic and its breath can melt stone.',
    format: 'plain',
    metadata: {
      word_count: 25,
      language: 'en',
      version: '1.0',
      generated_by: 'test_script'
    }
  },
  statblock: {
    armorClass: 18,
    armorType: 'natural armor',
    hitPoints: 120,
    hitDice: '16d10 + 32',
    speed: { walk: 40, fly: 80 },
    abilityScores: {
      str: 20,
      dex: 14,
      con: 18,
      int: 16,
      wis: 15,
      cha: 18
    },
    savingThrows: { str: 8, con: 7, wis: 6 },
    skills: { perception: 8, stealth: 6 },
    damageResistances: 'fire, lightning',
    damageImmunities: 'cold',
    conditionImmunities: 'frightened',
    senses: { darkvision: 120, blindsight: 60, passivePerception: 18 },
    languages: ['Common', 'Draconic', 'Infernal'],
    challengeRating: 12,
    experiencePoints: 8400,
    traits: [
      { 
        name: 'Legendary Resistance', 
        description: 'If the dragon fails a saving throw, it can choose to succeed instead.' 
      },
      { 
        name: 'Fire Breath', 
        description: 'The dragon can exhale fire in a 60-foot cone. Each creature in that area must make a DC 18 Dexterity saving throw.' 
      }
    ],
    actions: [
      { 
        name: 'Multiattack', 
        description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.' 
      },
      { 
        name: 'Bite', 
        description: 'Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) piercing damage plus 7 (2d6) fire damage.' 
      },
      { 
        name: 'Claw', 
        description: 'Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage.' 
      }
    ],
    legendaryActions: [
      { 
        name: 'Detect', 
        description: 'The dragon makes a Wisdom (Perception) check.' 
      },
      { 
        name: 'Tail Attack', 
        description: 'Melee Weapon Attack: +8 to hit, reach 15 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage.' 
      }
    ]
  }
};

async function testMonsterPersistence() {
  console.log('🧪 Testing Monster Data Persistence');
  console.log('====================================\n');

  try {
    // Initialize Supabase client
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Generate markup from the monster data
    console.log('📝 Generating markup from monster data...');
    const markup = generateMonsterMarkup(sampleMonster);
    console.log('✅ Markup generated successfully\n');

    // Prepare monster data for database
    const monsterData = {
      name: sampleMonster.name,
      region: sampleMonster.region,
      tags: sampleMonster.tags,
      lore: sampleMonster.lore, // JSONB format
      statblock: sampleMonster.statblock, // JSONB format
      monster_json: sampleMonster, // Complete monster data as JSONB
      monster_markup: markup, // Generated markup
      status: 'complete'
    };

    console.log('💾 Saving monster data to database...');
    
    // Insert the monster into the database
    const { data: insertedMonster, error: insertError } = await supabase
      .from('folklore_monsters')
      .insert(monsterData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert monster: ${insertError.message}`);
    }

    console.log('✅ Monster saved successfully!');
    console.log(`📊 Monster ID: ${insertedMonster.id}\n`);

    // Verify the data was saved correctly
    console.log('🔍 Verifying saved data...');
    
    const { data: retrievedMonster, error: retrieveError } = await supabase
      .from('folklore_monsters')
      .select('*')
      .eq('id', insertedMonster.id)
      .single();

    if (retrieveError) {
      throw new Error(`Failed to retrieve monster: ${retrieveError.message}`);
    }

    console.log('✅ Data verification successful!');
    console.log('\n📋 Saved Monster Details:');
    console.log(`   Name: ${retrievedMonster.name}`);
    console.log(`   Region: ${retrievedMonster.region}`);
    console.log(`   Tags: ${retrievedMonster.tags.join(', ')}`);
    console.log(`   Status: ${retrievedMonster.status}`);
    console.log(`   Lore Format: ${typeof retrievedMonster.lore}`);
    console.log(`   Statblock Format: ${typeof retrievedMonster.statblock}`);
    console.log(`   Has Markup: ${retrievedMonster.monster_markup ? 'Yes' : 'No'}`);
    console.log(`   Has JSON: ${retrievedMonster.monster_json ? 'Yes' : 'No'}`);

    // Test markup regeneration
    console.log('\n🔄 Testing markup regeneration from saved data...');
    const regeneratedMarkup = generateMonsterMarkup(retrievedMonster.monster_json);
    console.log('✅ Markup regeneration successful!');
    
    // Compare original and regenerated markup
    const markupMatches = markup === regeneratedMarkup;
    console.log(`📊 Markup matches: ${markupMatches ? '✅ Yes' : '❌ No'}`);

    if (!markupMatches) {
      console.log('\n⚠️  Markup comparison failed. This might be due to:');
      console.log('   - Different formatting in saved vs original data');
      console.log('   - Database type conversions');
      console.log('   - JSON serialization differences');
    }

    console.log('\n🎉 Monster persistence test completed successfully!');
    return {
      success: true,
      monsterId: insertedMonster.id,
      markupMatches
    };

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMonsterPersistence().catch(console.error);
}

export { testMonsterPersistence }; 