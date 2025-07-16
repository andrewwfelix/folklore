import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function testLoreJsonValidation() {
  console.log('🔍 Testing Lore JSON Validation');
  console.log('===============================\n');

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
    
    console.log('\n📄 Lore Field Analysis:');
    console.log('========================');
    console.log(`   • Lore field type: ${typeof monster.lore}`);
    console.log(`   • Lore field length: ${monster.lore?.length || 0} characters`);
    console.log(`   • Lore field starts with '{': ${monster.lore?.startsWith('{')}`);
    console.log(`   • Lore field ends with '}': ${monster.lore?.endsWith('}')}`);
    
    if (monster.lore) {
      console.log('\n📄 Lore Content Preview:');
      console.log('========================');
      console.log(monster.lore.substring(0, 200) + '...');
      
      // Try to parse as JSON
      console.log('\n🔍 JSON Validation:');
      console.log('==================');
      try {
        const parsedLore = JSON.parse(monster.lore);
        console.log('✅ Lore is valid JSON!');
        console.log(`   • Parsed type: ${typeof parsedLore}`);
        console.log(`   • Has 'Creature' property: ${!!parsedLore.Creature}`);
        console.log(`   • Has 'Region' property: ${!!parsedLore.Region}`);
        
        if (parsedLore.Creature) {
          console.log(`   • Creature Name: ${parsedLore.Creature.Name}`);
          console.log(`   • Has Description: ${!!parsedLore.Creature.Description}`);
          console.log(`   • Has Cultural_Significance: ${!!parsedLore.Creature.Cultural_Significance}`);
          console.log(`   • Has Notable_Abilities: ${!!parsedLore.Creature.Notable_Abilities}`);
          console.log(`   • Has Historical_Context: ${!!parsedLore.Creature.Historical_Context}`);
        }
        
        console.log('\n📄 Parsed Lore Structure:');
        console.log(JSON.stringify(parsedLore, null, 2));
        
      } catch (parseError) {
        console.log('❌ Lore is NOT valid JSON!');
        console.log(`   • Parse error: ${(parseError as Error).message}`);
        
        // Try to identify the issue
        console.log('\n🔍 JSON Structure Analysis:');
        console.log('==========================');
        
        // Check for common issues
        const loreStr = monster.lore;
        
        // Check for escaped quotes
        const hasEscapedQuotes = loreStr.includes('\\"');
        console.log(`   • Has escaped quotes: ${hasEscapedQuotes}`);
        
        // Check for unescaped quotes
        const quoteCount = (loreStr.match(/"/g) || []).length;
        console.log(`   • Total quote count: ${quoteCount}`);
        
        // Check for newlines
        const hasNewlines = loreStr.includes('\\n');
        console.log(`   • Has escaped newlines: ${hasNewlines}`);
        
        // Try to fix common issues
        console.log('\n🔧 Attempting to fix JSON...');
        let fixedLore = loreStr;
        
        // Remove escaped newlines
        if (hasNewlines) {
          fixedLore = fixedLore.replace(/\\n/g, '\n');
          console.log('   • Removed escaped newlines');
        }
        
        // Try parsing again
        try {
          const fixedParsed = JSON.parse(fixedLore);
          console.log('✅ Fixed JSON is valid!');
          console.log(`   • Fixed type: ${typeof fixedParsed}`);
        } catch (fixedError) {
          console.log('❌ Fixed JSON still invalid:');
          console.log(`   • Error: ${(fixedError as Error).message}`);
        }
      }
    }

    // Also check monster_json field
    if (monster.monster_json) {
      console.log('\n📄 Monster JSON Field Analysis:');
      console.log('===============================');
      console.log(`   • monster_json type: ${typeof monster.monster_json}`);
      console.log(`   • monster_json lore type: ${typeof monster.monster_json.lore}`);
      console.log(`   • monster_json lore length: ${monster.monster_json.lore?.length || 0}`);
      
      if (monster.monster_json.lore) {
        console.log(`   • monster_json lore starts with '{': ${monster.monster_json.lore.startsWith('{')}`);
        console.log(`   • monster_json lore ends with '}': ${monster.monster_json.lore.endsWith('}')}`);
        
        try {
          const parsedMonsterLore = JSON.parse(monster.monster_json.lore);
          console.log('✅ Monster JSON lore is valid JSON!');
          console.log(`   • Parsed type: ${typeof parsedMonsterLore}`);
        } catch (parseError) {
          console.log('❌ Monster JSON lore is NOT valid JSON!');
          console.log(`   • Parse error: ${(parseError as Error).message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLoreJsonValidation().catch(console.error); 