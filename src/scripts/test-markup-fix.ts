import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { MonsterPersistence } from '../lib/utils/monster-persistence';

async function testMarkupFix() {
  console.log('🔍 Testing Homebrewery Markup Fix\n');
  
  const persistence = new MonsterPersistence();
  
  try {
    // Get the latest monster from the database
    const monsters = await persistence.getAllMonsters();
    
    if (monsters.length === 0) {
      console.log('❌ No monsters found in database');
      return;
    }
    
    // Get the most recent monster by created_at timestamp
    const latestMonster = monsters.sort((a, b) => {
      const aTime = new Date((a as any).created_at || 0).getTime();
      const bTime = new Date((b as any).created_at || 0).getTime();
      return bTime - aTime;
    })[0];
    
    if (!latestMonster) {
      console.log('❌ No monster found');
      return;
    }
    
    console.log(`📋 Latest Monster: ${latestMonster.name} (${latestMonster.region})`);
    console.log(`🆔 Monster ID: ${latestMonster.id}`);
    
    // Get the markup directly from the database
    const { data: markupData } = await (persistence as any).supabase
      .from('folklore_monsters')
      .select('monster_markup_homebrew')
      .eq('id', latestMonster.id)
      .single();
    
    const markup = markupData?.monster_markup_homebrew;
    if (markup) {
      console.log('\n📄 Homebrewery Markup:');
      console.log('='.repeat(50));
      console.log(markup);
      console.log('='.repeat(50));
      
      // Check for specific issues
      
      if (markup.includes('undefined')) {
        console.log('\n❌ Found "undefined" in markup - ability scores not fixed');
      } else {
        console.log('\n✅ No "undefined" found - ability scores look good');
      }
      
      if (markup.includes('++')) {
        console.log('\n❌ Found "++" in markup - saving throws/skills not fixed');
      } else {
        console.log('\n✅ No "++" found - saving throws/skills look good');
      }
      
      if (markup.includes(':\n**')) {
        console.log('\n✅ Colons are properly placed on separate lines');
      } else {
        console.log('\n❌ Colons may not be properly formatted');
      }
      
    } else {
      console.log('\n❌ No Homebrewery markup found for this monster');
    }
    
  } catch (error) {
    console.error('❌ Error testing markup:', error);
  }
}

// Run the test
testMarkupFix().catch(console.error); 