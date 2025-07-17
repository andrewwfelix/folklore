import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function checkLatestMarkup() {
  console.log('🔍 Checking latest monster markup...\n');

  try {
    const { data: monsters, error } = await folkloreSupabase
      .from('folklore_monsters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    if (!monsters || monsters.length === 0) {
      console.log('📭 No monsters found in database');
      return;
    }

    const monster = monsters[0];
    console.log(`📋 Latest Monster: ${monster.name} (${monster.region})`);
    console.log(`   ID: ${monster.id}`);
    console.log(`   Created: ${monster.created_at}`);
    console.log(`   Has Homebrewery Markup: ${monster.monster_markup_homebrew ? 'Yes' : 'No'}`);
    
    if (monster.monster_markup_homebrew) {
      console.log(`\n📄 Homebrewery Markup:`);
      console.log('='.repeat(50));
      console.log(monster.monster_markup_homebrew);
      console.log('='.repeat(50));
      console.log(`\n📊 Markup length: ${monster.monster_markup_homebrew.length} characters`);
    }

  } catch (error) {
    console.error('❌ Error checking markup:', error);
  }
}

checkLatestMarkup(); 