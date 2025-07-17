#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { 
  populateHomebreweryMarkup, 
  populateAllHomebreweryMarkup, 
  populateHomebreweryMarkupByRegion,
  getHomebreweryMarkup 
} from '../lib/utils/monster-markup-persistence';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

async function testMarkupPersistence() {
  console.log('💾 Testing Markup Persistence');
  console.log('==============================\n');

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

    // Test 1: Get a sample monster from the database
    console.log('🧪 Test 1: Find a sample monster');
    const { data: sampleMonster, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, region, status')
      .not('monster_json', 'is', null)
      .limit(1)
      .single();

    if (fetchError || !sampleMonster) {
      console.log('❌ No monsters found with monster_json data');
      console.log('   Make sure you have generated monsters in your database');
      return;
    }

    console.log(`✅ Found sample monster: ${sampleMonster.name} (${sampleMonster.id})`);
    console.log(`   Region: ${sampleMonster.region}, Status: ${sampleMonster.status}\n`);

    // Test 2: Populate markup for the sample monster
    console.log('🧪 Test 2: Populate markup for sample monster');
    const populateResult = await populateHomebreweryMarkup(sampleMonster.id);
    
    if (populateResult.success) {
      console.log('✅ Markup populated successfully!');
      console.log(`   Monster ID: ${populateResult.monsterId}`);
      console.log(`   Markup length: ${populateResult.markupLength} characters`);
    } else {
      console.log('❌ Failed to populate markup:', populateResult.error);
    }
    console.log('');

    // Test 3: Get the markup back
    console.log('🧪 Test 3: Retrieve stored markup');
    const getResult = await getHomebreweryMarkup(sampleMonster.id);
    
    if (getResult.success && getResult.markup) {
      console.log('✅ Markup retrieved successfully!');
      console.log(`   Markup length: ${getResult.markup.length} characters`);
      console.log(`   First 100 chars: ${getResult.markup.substring(0, 100)}...`);
    } else {
      console.log('❌ Failed to retrieve markup:', getResult.error);
    }
    console.log('');

    // Test 4: Populate markup for all monsters
    console.log('🧪 Test 4: Populate markup for all monsters');
    const allResult = await populateAllHomebreweryMarkup();
    
    if (allResult.success) {
      console.log('✅ Bulk markup population completed!');
      console.log(`   Processed: ${allResult.processed} monsters`);
      if (allResult.errors.length > 0) {
        console.log(`   Errors: ${allResult.errors.length}`);
        allResult.errors.slice(0, 3).forEach(error => console.log(`     - ${error}`));
        if (allResult.errors.length > 3) {
          console.log(`     ... and ${allResult.errors.length - 3} more errors`);
        }
      }
    } else {
      console.log('❌ Failed to populate all markup:', allResult.errors);
    }
    console.log('');

    // Test 5: Populate markup by region
    console.log('🧪 Test 5: Populate markup by region');
    const regionResult = await populateHomebreweryMarkupByRegion(sampleMonster.region);
    
    if (regionResult.success) {
      console.log('✅ Region markup population completed!');
      console.log(`   Region: ${sampleMonster.region}`);
      console.log(`   Processed: ${regionResult.processed} monsters`);
      if (regionResult.errors.length > 0) {
        console.log(`   Errors: ${regionResult.errors.length}`);
        regionResult.errors.slice(0, 3).forEach(error => console.log(`     - ${error}`));
      }
    } else {
      console.log('❌ Failed to populate region markup:', regionResult.errors);
    }
    console.log('');

    // Test 6: Check database statistics
    console.log('🧪 Test 6: Check database statistics');
    const { data: stats, error: statsError } = await supabase
      .from('folklore_monsters')
      .select('monster_markup_homebrew')
      .not('monster_json', 'is', null);

    if (!statsError && stats) {
      const totalMonsters = stats.length;
      const monstersWithMarkup = stats.filter(m => m.monster_markup_homebrew).length;
      const markupPercentage = totalMonsters > 0 ? (monstersWithMarkup / totalMonsters * 100).toFixed(1) : '0';
      
      console.log('✅ Database statistics:');
      console.log(`   Total monsters with monster_json: ${totalMonsters}`);
      console.log(`   Monsters with Homebrewery markup: ${monstersWithMarkup}`);
      console.log(`   Markup coverage: ${markupPercentage}%`);
    } else {
      console.log('❌ Failed to get database statistics:', statsError);
    }
    console.log('');

    console.log('🎉 Markup persistence tests completed!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Run the database migration to add the monster_markup_homebrew column');
    console.log('   2. Use populateAllHomebreweryMarkup() to populate existing monsters');
    console.log('   3. Integrate populateHomebreweryMarkup() into your monster generation pipeline');
    console.log('   4. Use getHomebreweryMarkup() for fast exports without regeneration');

    return {
      success: true,
      sampleMonster: sampleMonster.name,
      populateResult,
      getResult,
      allResult,
      regionResult
    };

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMarkupPersistence().catch(console.error);
}

export { testMarkupPersistence }; 