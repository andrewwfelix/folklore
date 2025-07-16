import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function checkMonsterJson() {
  console.log('🔍 Checking Monster JSON in Database');
  console.log('====================================\n');

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
    console.log(`📝 Created At: ${monster.created_at}`);
    
    console.log('\n📄 Monster JSON Status:');
    console.log('========================');
    console.log(`   • monster_json field exists: ${'monster_json' in monster}`);
    console.log(`   • monster_json is null: ${monster.monster_json === null}`);
    console.log(`   • monster_json type: ${typeof monster.monster_json}`);
    
    if (monster.monster_json) {
      console.log(`   • monster_json size: ${JSON.stringify(monster.monster_json).length} characters`);
      console.log(`   • Contains name: ${!!monster.monster_json.name}`);
      console.log(`   • Contains region: ${!!monster.monster_json.region}`);
      console.log(`   • Contains lore: ${!!monster.monster_json.lore}`);
      console.log(`   • Contains statblock: ${!!monster.monster_json.statblock}`);
      console.log(`   • Contains citations: ${!!monster.monster_json.citations}`);
      console.log(`   • Contains art: ${!!monster.monster_json.art}`);
      console.log(`   • Contains pdfLayout: ${!!monster.monster_json.pdfLayout}`);
      
      console.log('\n📄 Complete Monster JSON:');
      console.log(JSON.stringify(monster.monster_json, null, 2));
    } else {
      console.log('\n❌ monster_json is null or undefined');
    }

    // Also check the database schema
    console.log('\n🔍 Database Schema Check:');
    console.log('========================');
    let columns = null;
    let schemaError = null;
    try {
      const result = await folkloreSupabase
        .rpc('get_table_columns', { table_name: 'folklore_monsters' });
      columns = result.data;
      schemaError = result.error;
    } catch {
      schemaError = 'RPC not available';
    }

    if (schemaError) {
      console.log('   • Could not check schema via RPC, checking manually...');
      const hasMonsterJson = 'monster_json' in monster;
      console.log(`   • monster_json column exists: ${hasMonsterJson}`);
    } else if (columns) {
      const hasMonsterJson = columns.some((col: any) => col.column_name === 'monster_json');
      console.log(`   • monster_json column exists: ${hasMonsterJson}`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkMonsterJson().catch(console.error); 