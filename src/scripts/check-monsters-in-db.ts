import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function checkMonstersInDatabase() {
  console.log('🔍 Checking folklore monsters in database...\n');

  try {
    const { data: monsters, error } = await folkloreSupabase
      .from('folklore_monsters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    if (!monsters || monsters.length === 0) {
      console.log('📭 No folklore monsters found in database');
      return;
    }

    console.log(`📊 Found ${monsters.length} folklore monster(s) in database:\n`);

    monsters.forEach((monster, index) => {
      console.log(`${index + 1}. ${monster.name} (${monster.region})`);
      console.log(`   ID: ${monster.id}`);
      console.log(`   Status: ${monster.status}`);
      console.log(`   Created: ${monster.created_at}`);
      console.log(`   Has Homebrewery Markup: ${monster.monster_markup_homebrew ? 'Yes' : 'No'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkMonstersInDatabase(); 