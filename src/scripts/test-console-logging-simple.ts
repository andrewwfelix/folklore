#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function testConsoleLogging() {
  console.log('🔍 Testing Console Logging');
  console.log('==========================\n');

  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    
    const { data, error } = await folkloreSupabase
      .from('folklore_monsters')
      .select('id, name, region, console_log')
      .limit(5);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }

    console.log(`✅ Database connection successful!`);
    console.log(`📊 Found ${data.length} monsters in database\n`);

    let logsFound = 0;
    
    for (const monster of data) {
      if (monster.console_log) {
        logsFound++;
        console.log(`\n📝 Monster: ${monster.name} (${monster.region})`);
        console.log(`🆔 ID: ${monster.id}`);
        console.log(`📄 Console Log Length: ${monster.console_log.length} characters`);
        console.log('\n--- Console Log Content ---');
        console.log(monster.console_log);
        console.log('--- End Console Log ---\n');
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   • Total monsters: ${data.length}`);
    console.log(`   • Monsters with logs: ${logsFound}`);
    console.log(`   • Monsters without logs: ${data.length - logsFound}`);

    if (logsFound === 0) {
      console.log('\n⚠️  No console logs found. This could mean:');
      console.log('   • No monsters have been generated yet');
      console.log('   • Logging is not working properly');
      console.log('   • Logs are not being saved to the database');
      console.log('\n💡 To test logging:');
      console.log('   • Run a monster generation with refinement');
      console.log('   • Then run this script again');
    } else {
      console.log('\n✅ Console logging is working!');
    }

  } catch (error) {
    console.error('❌ Error testing console logging:', error);
  }
}

// Run the test
if (require.main === module) {
  testConsoleLogging().catch(console.error);
} 