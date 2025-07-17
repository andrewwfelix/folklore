#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { 
  applyTemplate,
  HUMANOID_TEMPLATE,
  DRAGON_TEMPLATE,
  UNDEAD_TEMPLATE,
  BEAST_TEMPLATE,
  CONSTRUCT_TEMPLATE,
  FIEND_TEMPLATE,
  CELESTIAL_TEMPLATE
} from '../templates/statblock-templates';
import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

interface MonsterRecord {
  id: string;
  name: string;
  region: string;
  tags: string[];
  monster_json: any;
  monster_markup_homebrew?: string;
  status: string;
}

interface ProcessingResult {
  monsterId: string;
  name: string;
  templateUsed: string;
  success: boolean;
  error?: string;
  markupLength?: number;
  markup?: string;
}

/**
 * Determine the best template to use based on monster data
 */
function selectTemplate(monster: any): any {
  const tags = monster.tags || [];
  const name = monster.name?.toLowerCase() || '';
  const region = monster.region?.toLowerCase() || '';
  
  // Check tags first
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('dragon') || lowerTag.includes('wyrm') || lowerTag.includes('drake')) {
      return DRAGON_TEMPLATE;
    }
    if (lowerTag.includes('undead') || lowerTag.includes('ghost') || lowerTag.includes('zombie') || lowerTag.includes('skeleton')) {
      return UNDEAD_TEMPLATE;
    }
    if (lowerTag.includes('beast') || lowerTag.includes('animal') || lowerTag.includes('creature')) {
      return BEAST_TEMPLATE;
    }
    if (lowerTag.includes('construct') || lowerTag.includes('golem') || lowerTag.includes('automaton')) {
      return CONSTRUCT_TEMPLATE;
    }
    if (lowerTag.includes('fiend') || lowerTag.includes('demon') || lowerTag.includes('devil')) {
      return FIEND_TEMPLATE;
    }
    if (lowerTag.includes('celestial') || lowerTag.includes('angel') || lowerTag.includes('divine')) {
      return CELESTIAL_TEMPLATE;
    }
    if (lowerTag.includes('humanoid') || lowerTag.includes('bandit') || lowerTag.includes('guard')) {
      return HUMANOID_TEMPLATE;
    }
  }
  
  // Check name for clues
  if (name.includes('dragon') || name.includes('wyrm') || name.includes('drake')) {
    return DRAGON_TEMPLATE;
  }
  if (name.includes('ghost') || name.includes('zombie') || name.includes('skeleton') || name.includes('wraith')) {
    return UNDEAD_TEMPLATE;
  }
  if (name.includes('beast') || name.includes('wolf') || name.includes('bear') || name.includes('eagle')) {
    return BEAST_TEMPLATE;
  }
  if (name.includes('golem') || name.includes('construct') || name.includes('automaton')) {
    return CONSTRUCT_TEMPLATE;
  }
  if (name.includes('demon') || name.includes('devil') || name.includes('fiend')) {
    return FIEND_TEMPLATE;
  }
  if (name.includes('angel') || name.includes('celestial') || name.includes('divine')) {
    return CELESTIAL_TEMPLATE;
  }
  
  // Check region for clues
  if (region.includes('crypt') || region.includes('haunted') || region.includes('undead')) {
    return UNDEAD_TEMPLATE;
  }
  if (region.includes('mountain') || region.includes('cave') || region.includes('wilderness')) {
    return BEAST_TEMPLATE;
  }
  if (region.includes('palace') || region.includes('city') || region.includes('village')) {
    return HUMANOID_TEMPLATE;
  }
  
  // Default to humanoid for unknown types
  return HUMANOID_TEMPLATE;
}

/**
 * Process a single monster and generate Homebrewery markup
 */
async function processMonster(
  supabase: any,
  monster: MonsterRecord
): Promise<ProcessingResult> {
  try {
    console.log(`  📝 Processing: ${monster.name} (${monster.id})`);
    
    // Select appropriate template
    const template = selectTemplate(monster);
    console.log(`    🏷️  Using template: ${template.name}`);
    
    // Apply template to monster data
    const enhancedMonster = applyTemplate(monster.monster_json, template);
    
    // Generate Homebrewery markup
    const markup = generateHomebreweryMarkup(enhancedMonster, {
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false
    });

    // Update the database
    const { error: updateError } = await supabase
      .from('folklore_monsters')
      .update({ 
        monster_markup_homebrew: markup,
        updated_at: new Date().toISOString()
      })
      .eq('id', monster.id);
    
    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    
    console.log(`    ✅ Updated successfully (${markup.length} chars)`);
    
    return {
      monsterId: monster.id,
      name: monster.name,
      templateUsed: template.name,
      success: true,
      markupLength: markup.length,
      markup: markup
    };
    
  } catch (error) {
    console.log(`    ❌ Failed: ${(error as Error).message}`);
    return {
      monsterId: monster.id,
      name: monster.name,
      templateUsed: 'unknown',
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Main function to populate Homebrewery markup for all monsters
 */
async function populateHomebreweryMarkup() {
  console.log('🏠 Populating Homebrewery Markup for All Monsters');
  console.log('================================================\n');

  try {
    // Initialize Supabase client
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Fetch all monsters that have monster_json but may not have monster_markup_homebrew
    console.log('📊 Fetching monsters from database...');
    const { data: monsters, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, region, tags, monster_json, monster_markup_homebrew, status')
      .not('monster_json', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch monsters: ${fetchError.message}`);
    }

    if (!monsters || monsters.length === 0) {
      console.log('❌ No monsters found with monster_json data');
      return;
    }

    console.log(`✅ Found ${monsters.length} monsters to process\n`);

    // Process each monster
    const results: ProcessingResult[] = [];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const monster of monsters) {
      processedCount++;
      console.log(`\n🔄 [${processedCount}/${monsters.length}] Processing monster...`);
      
      const result = await processMonster(supabase, monster);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Generate summary report
    console.log('\n📋 Processing Summary');
    console.log('====================');
    console.log(`Total Monsters: ${monsters.length}`);
    console.log(`Successfully Processed: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Success Rate: ${((successCount / monsters.length) * 100).toFixed(1)}%`);

    // Template usage statistics
    const templateStats = results
      .filter(r => r.success)
      .reduce((acc, result) => {
        acc[result.templateUsed] = (acc[result.templateUsed] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    console.log('\n📊 Template Usage:');
    Object.entries(templateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([template, count]) => {
        console.log(`  ${template}: ${count} monsters`);
      });

    // Show errors if any
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => {
        console.log(`  ${error.name}: ${error.error}`);
      });
    }

    // Show some examples of generated markup
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n📄 Sample Results:');
      successfulResults.slice(0, 3).forEach(result => {
        console.log(`  ${result.name}: ${result.templateUsed} template (${result.markupLength} chars)`);
      });
      
      // Show the first successful markup
      const firstResult = successfulResults[0];
      if (firstResult && firstResult.markup) {
        console.log('\n📝 Generated Markup Example:');
        console.log('='.repeat(50));
        console.log(firstResult.markup);
        console.log('='.repeat(50));
      }
    }

    console.log('\n🎉 Homebrewery markup population completed!');
    return {
      success: true,
      totalMonsters: monsters.length,
      successCount,
      errorCount,
      templateStats
    };

  } catch (error) {
    console.error('❌ Script failed:', (error as Error).message);
    throw error;
  }
}

/**
 * Process monsters by region
 */
async function populateHomebreweryMarkupByRegion(region: string) {
  console.log(`🏠 Populating Homebrewery Markup for ${region}`);
  console.log('==============================================\n');

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    console.log(`📊 Fetching monsters from ${region}...`);
    const { data: monsters, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, region, tags, monster_json, monster_markup_homebrew, status')
      .eq('region', region)
      .not('monster_json', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch monsters: ${fetchError.message}`);
    }

    if (!monsters || monsters.length === 0) {
      console.log(`❌ No monsters found in ${region}`);
      return;
    }

    console.log(`✅ Found ${monsters.length} monsters in ${region}\n`);

    const results: ProcessingResult[] = [];
    let processedCount = 0;
    let successCount = 0;

    for (const monster of monsters) {
      processedCount++;
      console.log(`🔄 [${processedCount}/${monsters.length}] Processing: ${monster.name}`);
      
      const result = await processMonster(supabase, monster);
      results.push(result);
      
      if (result.success) {
        successCount++;
      }
    }

    console.log(`\n✅ Completed ${region}: ${successCount}/${monsters.length} successful`);
    return {
      success: true,
      region,
      totalMonsters: monsters.length,
      successCount
    };

  } catch (error) {
    console.error(`❌ Failed to process ${region}:`, (error as Error).message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--region') {
    const region = args[1];
    if (!region) {
      console.error('❌ Please specify a region: --region "Region Name"');
      process.exit(1);
    }
    populateHomebreweryMarkupByRegion(region).catch(console.error);
  } else {
    populateHomebreweryMarkup().catch(console.error);
  }
}

export { populateHomebreweryMarkup, populateHomebreweryMarkupByRegion }; 