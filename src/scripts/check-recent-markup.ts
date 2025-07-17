#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function checkRecentMarkup() {
  console.log('🔍 Checking Recent Monster Homebrewery Markup');
  console.log('=============================================\n');

  try {
    // Get the most recent monster
    const { data: monsters, error } = await folkloreSupabase
      .from('folklore_monsters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Database query failed:', error);
      return;
    }

    if (!monsters || monsters.length === 0) {
      console.log('❌ No monsters found in database');
      return;
    }

    const monster = monsters[0];
    console.log(`📝 Monster ID: ${monster.id}`);
    console.log(`📝 Monster Name: ${monster.name}`);
    console.log(`📝 Monster Region: ${monster.region}`);
    
    if (monster.monster_markup_homebrew) {
      console.log('\n🏠 Homebrewery Markup:');
      console.log('======================');
      console.log(monster.monster_markup_homebrew);
    } else {
      console.log('\n❌ No Homebrewery markup found');
    }

    if (monster.monster_json?.lore) {
      console.log('\n📄 Original Lore Structure:');
      console.log('============================');
      console.log(JSON.stringify(monster.monster_json.lore, null, 2));
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkRecentMarkup(); 