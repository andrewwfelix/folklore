#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { MonsterPersistence } from '../lib/utils/monster-persistence';

async function checkConsoleLogs() {
  console.log('🔍 Checking Console Logs in Database');
  console.log('=====================================\n');

  const persistence = new MonsterPersistence();

  try {
    // Get all monsters with console logs
    const monsters = await persistence.getAllMonsters();
    
    console.log(`📊 Found ${monsters.length} monsters in database\n`);

    let logsFound = 0;
    
    for (const monster of monsters) {
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
    console.log(`   • Total monsters: ${monsters.length}`);
    console.log(`   • Monsters with logs: ${logsFound}`);
    console.log(`   • Monsters without logs: ${monsters.length - logsFound}`);

    if (logsFound === 0) {
      console.log('\n⚠️  No console logs found. This could mean:');
      console.log('   • No monsters have been generated yet');
      console.log('   • Logging is not working properly');
      console.log('   • Logs are not being saved to the database');
    }

  } catch (error) {
    console.error('❌ Error checking console logs:', error);
  }
}

// Run the check
if (require.main === module) {
  checkConsoleLogs().catch(console.error);
} 