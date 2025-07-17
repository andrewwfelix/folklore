#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { generateHomebreweryV3StatBlock } from '../lib/utils/homebrewery-export';

// Interface for monster records from database
interface MonsterRecord {
  id: string;
  name: string;
  region: string;
  monster_json: any;
  monster_markup_homebrew?: string;
}

interface PopulationResult {
  success: boolean;
  totalMonsters: number;
  processedMonsters: number;
  skippedMonsters: number;
  failedMonsters: number;
  errors: string[];
  processingTime: number;
}

async function populateAllMonsterMarkup(): Promise<PopulationResult> {
  console.log('🏠 Populating All Monster Markup');
  console.log('================================\n');

  const startTime = Date.now();
  const errors: string[] = [];
  let processedMonsters = 0;
  let skippedMonsters = 0;
  let failedMonsters = 0;

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

    // Step 1: Get all monsters with monster_json data
    console.log('📊 Fetching all monsters with monster_json data...');
    const { data: monsters, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, region, monster_json, monster_markup_homebrew')
      .not('monster_json', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch monsters: ${fetchError.message}`);
    }

    if (!monsters || monsters.length === 0) {
      console.log('❌ No monsters found with monster_json data');
      return {
        success: false,
        totalMonsters: 0,
        processedMonsters: 0,
        skippedMonsters: 0,
        failedMonsters: 0,
        errors: ['No monsters found with monster_json data'],
        processingTime: Date.now() - startTime
      };
    }

    const totalMonsters = monsters.length;
    console.log(`✅ Found ${totalMonsters} monsters with monster_json data\n`);

    // Step 2: Process each monster
    console.log('🔄 Processing monsters...\n');

    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      if (!monster) {
        console.log(`   ⚠️  Skipping undefined monster at index ${i}`);
        failedMonsters++;
        continue;
      }
      
      const progress = `${i + 1}/${totalMonsters}`;
      console.log(`📝 ${progress} Processing: ${monster.name} (${monster.region})`);

      try {
        // Check if markup already exists
        if (monster.monster_markup_homebrew) {
          console.log(`   ⏭️  Skipping - markup already exists`);
          skippedMonsters++;
          continue;
        }

        // Generate Homebrewery V3 markup
        const markup = generateHomebreweryV3StatBlock(monster.monster_json);
        
        if (!markup || markup.trim().length === 0) {
          console.log(`   ⚠️  Generated markup is empty`);
          errors.push(`${monster.name}: Generated markup is empty`);
          failedMonsters++;
          continue;
        }

        // Update the monster record with the generated markup
        const { error: updateError } = await supabase
          .from('folklore_monsters')
          .update({ 
            monster_markup_homebrew: markup,
            updated_at: new Date().toISOString()
          })
          .eq('id', monster.id);

        if (updateError) {
          console.log(`   ❌ Failed to update: ${updateError.message}`);
          errors.push(`${monster.name}: ${updateError.message}`);
          failedMonsters++;
        } else {
          console.log(`   ✅ Generated markup (${markup.length} chars)`);
          processedMonsters++;
        }

      } catch (error) {
        console.log(`   ❌ Error processing: ${(error as Error).message}`);
        errors.push(`${monster.name}: ${(error as Error).message}`);
        failedMonsters++;
      }

      // Add a small delay to avoid overwhelming the database
      if (i < monsters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const processingTime = Date.now() - startTime;

    // Step 3: Generate summary
    console.log('\n📊 Processing Summary');
    console.log('====================');
    console.log(`Total monsters: ${totalMonsters}`);
    console.log(`Processed: ${processedMonsters}`);
    console.log(`Skipped (already had markup): ${skippedMonsters}`);
    console.log(`Failed: ${failedMonsters}`);
    console.log(`Processing time: ${(processingTime / 1000).toFixed(2)} seconds`);
    console.log(`Average time per monster: ${(processingTime / totalMonsters).toFixed(0)}ms`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }

    // Step 4: Verify results
    console.log('\n🔍 Verifying results...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('folklore_monsters')
      .select('monster_markup_homebrew')
      .not('monster_json', 'is', null);

    if (!verificationError && verificationData) {
      const totalWithJson = verificationData.length;
      const totalWithMarkup = verificationData.filter(m => m.monster_markup_homebrew).length;
      const coveragePercentage = totalWithJson > 0 ? (totalWithMarkup / totalWithJson * 100).toFixed(1) : '0';
      
      console.log(`✅ Verification complete:`);
      console.log(`   Monsters with monster_json: ${totalWithJson}`);
      console.log(`   Monsters with markup: ${totalWithMarkup}`);
      console.log(`   Coverage: ${coveragePercentage}%`);
    } else {
      console.log('❌ Failed to verify results:', verificationError?.message);
    }

    console.log('\n🎉 Markup population completed!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Use the export utilities for fast Homebrewery exports');
    console.log('   2. New monsters will automatically have markup generated');
    console.log('   3. Check the generated files for quality');

    return {
      success: failedMonsters === 0,
      totalMonsters,
      processedMonsters,
      skippedMonsters,
      failedMonsters,
      errors,
      processingTime
    };

  } catch (error) {
    console.error('❌ Script failed:', (error as Error).message);
    return {
      success: false,
      totalMonsters: 0,
      processedMonsters,
      skippedMonsters,
      failedMonsters,
      errors: [(error as Error).message],
      processingTime: Date.now() - startTime
    };
  }
}

// Run the script
if (require.main === module) {
  populateAllMonsterMarkup().catch(console.error);
}

export { populateAllMonsterMarkup }; 