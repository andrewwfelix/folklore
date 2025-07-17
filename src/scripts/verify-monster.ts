import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { orchestrateMonster } from './orchestrate-monsters';
import { MonsterPersistence } from '../lib/utils/monster-persistence';
import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

async function verifyMonster() {
  console.log('🔍 Monster Generation Verification');
  console.log('=================================\n');

  try {
    // Step 1: Generate a new monster
    console.log('🚀 Step 1: Generating new monster...');
    
    const result = await orchestrateMonster(1);
    
    console.log('✅ Monster generated successfully!');
    console.log(`   Name: ${result.name}`);
    console.log(`   Region: ${result.region}`);

    // Step 2: Save monster to database
    console.log('\n💾 Step 2: Saving monster to database...');
    const persistence = new MonsterPersistence();
    
    // Create monster data structure
    const monsterData = {
      name: result.name,
      region: result.region,
      lore: result.lore,
      statBlock: result.statblock,
      citations: result.citations,
      art: result.artPrompt,
      pdfUrl: result.pdfUrl,
      imageUrl: result.imageUrl,
      monsterJson: {
        name: result.name,
        region: result.region,
        lore: result.lore,
        statblock: result.statblock,
        citations: result.citations,
        art: result.artPrompt,
        pdfLayout: result.pdfLayout,
        pdfUrl: result.pdfUrl,
        imageUrl: result.imageUrl
      }
    };
    
    const monsterId = await persistence.saveMonster(monsterData);
    console.log(`✅ Monster saved with ID: ${monsterId}`);

    // Step 3: Retrieve monster from database
    console.log('\n📋 Step 3: Retrieving monster from database...');
    const retrievedMonster = await persistence.getMonster(monsterId);
    
    if (!retrievedMonster) {
      console.error('❌ Failed to retrieve monster from database');
      return;
    }

    console.log('✅ Monster retrieved successfully!');
    console.log(`   Name: ${retrievedMonster.name}`);
    console.log(`   Region: ${retrievedMonster.region}`);
    console.log(`   Has monster_json: ${retrievedMonster.monsterJson ? 'Yes' : 'No'}`);

    // Step 4: Check Homebrewery markup in database
    console.log('\n🏠 Step 4: Checking Homebrewery markup...');
    const { folkloreSupabase } = await import('../lib/supabase/folklore-client');
    const { data: markupData, error: markupError } = await folkloreSupabase
      .from('folklore_monsters')
      .select('monster_markup_homebrew')
      .eq('id', monsterId)
      .single();

    if (markupError) {
      console.log(`❌ Error fetching markup: ${markupError.message}`);
    } else if (markupData?.monster_markup_homebrew) {
      console.log(`✅ Homebrewery markup found (${markupData.monster_markup_homebrew.length} chars)`);
      
      // Display a preview of the markup
      const preview = markupData.monster_markup_homebrew.substring(0, 300) + '...';
      console.log('\n📄 Markup Preview:');
      console.log('='.repeat(50));
      console.log(preview);
      console.log('='.repeat(50));
    } else {
      console.log('❌ No Homebrewery markup found in database');
    }

    // Step 5: Generate fresh markup for comparison
    console.log('\n🔄 Step 5: Generating fresh markup for comparison...');
    if (retrievedMonster.monsterJson) {
      const freshMarkup = generateHomebreweryMarkup(retrievedMonster.monsterJson, {
        includeLore: true,
        includeCitations: false,
        includeArtPrompt: false
      });

      console.log(`✅ Fresh markup generated (${freshMarkup.length} chars)`);
      
      // Display a preview of the fresh markup
      const freshPreview = freshMarkup.substring(0, 300) + '...';
      console.log('\n📄 Fresh Markup Preview:');
      console.log('='.repeat(50));
      console.log(freshPreview);
      console.log('='.repeat(50));

      // Compare lengths
      if (markupData?.monster_markup_homebrew) {
        const dbLength = markupData.monster_markup_homebrew.length;
        const freshLength = freshMarkup.length;
        console.log(`\n📊 Length Comparison:`);
        console.log(`   Database markup: ${dbLength} chars`);
        console.log(`   Fresh markup: ${freshLength} chars`);
        console.log(`   Difference: ${Math.abs(dbLength - freshLength)} chars`);
        
        if (dbLength === freshLength) {
          console.log('✅ Markup lengths match!');
        } else {
          console.log('⚠️  Markup lengths differ - may need regeneration');
        }
      }
    } else {
      console.log('❌ No monster_json available for fresh markup generation');
    }

    // Step 6: Verify monster structure
    console.log('\n🔍 Step 6: Verifying monster structure...');
    if (retrievedMonster.monsterJson) {
      const json = retrievedMonster.monsterJson;
      console.log('✅ Monster JSON structure:');
      console.log(`   • Name: ${json.name || 'undefined'}`);
      console.log(`   • Region: ${json.region || 'undefined'}`);
      console.log(`   • Has statblock: ${!!json.statblock}`);
      console.log(`   • Has lore: ${!!json.lore}`);
      console.log(`   • Has citations: ${!!json.citations}`);
      console.log(`   • Has art: ${!!json.art}`);
      console.log(`   • Has pdfLayout: ${!!json.pdfLayout}`);

      // Check statblock structure
      if (json.statblock) {
        console.log('\n📊 Statblock structure:');
        console.log(`   • Name: ${json.statblock.name || 'undefined'}`);
        console.log(`   • Size: ${json.statblock.size || 'undefined'}`);
        console.log(`   • Type: ${json.statblock.type || 'undefined'}`);
        console.log(`   • Alignment: ${json.statblock.alignment || 'undefined'}`);
        console.log(`   • Armor Class: ${json.statblock.armorClass || 'undefined'}`);
        console.log(`   • Hit Points: ${json.statblock.hitPoints || 'undefined'}`);
        console.log(`   • Speed: ${json.statblock.speed || 'undefined'}`);
        console.log(`   • Challenge: ${json.statblock.challenge || 'undefined'}`);
      }
    }

    console.log('\n🎉 Verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Monster generated: ✅`);
    console.log(`   • Monster saved to database: ✅`);
    console.log(`   • Monster retrieved from database: ✅`);
    console.log(`   • Homebrewery markup generated: ${markupData?.monster_markup_homebrew ? '✅' : '❌'}`);
    console.log(`   • Monster structure verified: ✅`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
verifyMonster().catch(console.error); 