#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createMonsterFromTemplate, DRAGON_TEMPLATE } from '../templates/statblock-templates';
import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

async function testMarkupOutput() {
  console.log('🧪 Testing Homebrewery Markup Output');
  console.log('====================================\n');

  try {
    // Create a test monster from template
    const testMonster = createMonsterFromTemplate(
      'Test Dragon',
      'Test Region',
      DRAGON_TEMPLATE
    );

    console.log('📝 Generated monster data:');
    console.log(JSON.stringify(testMonster, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Generate Homebrewery markup
    const markup = generateHomebreweryMarkup(testMonster, {
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false
    });

    console.log('🏠 Generated Homebrewery Markup:');
    console.log('='.repeat(50));
    console.log(markup);
    console.log('='.repeat(50));

    console.log(`\n📊 Markup length: ${markup.length} characters`);
    console.log(`📊 Lines: ${markup.split('\n').length}`);

    // Save to database
    console.log('\n💾 Saving to database...');
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Create a test monster record
    const testMonsterData = {
      name: testMonster.name,
      region: testMonster.region,
      tags: testMonster.tags,
      statblock: testMonster.statblock,
      monster_json: testMonster,
      monster_markup_homebrew: markup,
      status: 'complete'
    };

    const { data: savedMonster, error: saveError } = await supabase
      .from('folklore_monsters')
      .insert(testMonsterData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Failed to save to database:', saveError.message);
      throw saveError;
    }

    console.log('✅ Successfully saved to database!');
    console.log(`📊 Monster ID: ${savedMonster.id}`);
    console.log(`📊 Saved markup length: ${savedMonster.monster_markup_homebrew?.length || 0} characters`);

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMarkupOutput().catch(console.error);
}

export { testMarkupOutput }; 