import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { config } from '../../config';
import { generateHomebreweryV3StatBlock } from './homebrewery-export';

export interface MarkupPersistenceResult {
  success: boolean;
  monsterId?: string;
  markupLength?: number;
  error?: string;
}

/**
 * Populate the monster_markup_homebrew column for a specific monster
 */
export async function populateHomebreweryMarkup(monsterId: string): Promise<MarkupPersistenceResult> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Fetch the monster data
    const { data: monster, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('*')
      .eq('id', monsterId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch monster: ${fetchError.message}`);
    }

    if (!monster) {
      throw new Error(`Monster with ID ${monsterId} not found`);
    }

    if (!monster.monster_json) {
      throw new Error(`Monster ${monsterId} has no monster_json data`);
    }

    // Generate Homebrewery V3 markup
    const markup = generateHomebreweryV3StatBlock(monster.monster_json);

    // Update the monster record with the generated markup
    const { error: updateError } = await supabase
      .from('folklore_monsters')
      .update({ 
        monster_markup_homebrew: markup,
        updated_at: new Date().toISOString()
      })
      .eq('id', monsterId);

    if (updateError) {
      throw new Error(`Failed to update monster markup: ${updateError.message}`);
    }

    return {
      success: true,
      monsterId,
      markupLength: markup.length
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Populate Homebrewery markup for all monsters that don't have it yet
 */
export async function populateAllHomebreweryMarkup(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Find all monsters that have monster_json but no monster_markup_homebrew
    const { data: monsters, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, monster_json')
      .not('monster_json', 'is', null)
      .or('monster_markup_homebrew.is.null,monster_markup_homebrew.eq.');

    if (fetchError) {
      throw new Error(`Failed to fetch monsters: ${fetchError.message}`);
    }

    if (!monsters || monsters.length === 0) {
      return {
        success: true,
        processed: 0,
        errors: []
      };
    }

    const errors: string[] = [];
    let processed = 0;

    // Process each monster
    for (const monster of monsters) {
      try {
        const result = await populateHomebreweryMarkup(monster.id);
        if (result.success) {
          processed++;
          console.log(`✅ Generated markup for ${monster.name} (${result.markupLength} chars)`);
        } else {
          errors.push(`Failed to process ${monster.name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error processing ${monster.name}: ${(error as Error).message}`);
      }
    }

    return {
      success: true,
      processed,
      errors
    };

  } catch (error) {
    return {
      success: false,
      processed: 0,
      errors: [(error as Error).message]
    };
  }
}

/**
 * Populate Homebrewery markup for monsters by region
 */
export async function populateHomebreweryMarkupByRegion(region: string): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Find monsters in the specified region that have monster_json but no markup
    const { data: monsters, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('id, name, monster_json')
      .eq('region', region)
      .not('monster_json', 'is', null)
      .or('monster_markup_homebrew.is.null,monster_markup_homebrew.eq.');

    if (fetchError) {
      throw new Error(`Failed to fetch monsters: ${fetchError.message}`);
    }

    if (!monsters || monsters.length === 0) {
      return {
        success: true,
        processed: 0,
        errors: []
      };
    }

    const errors: string[] = [];
    let processed = 0;

    // Process each monster
    for (const monster of monsters) {
      try {
        const result = await populateHomebreweryMarkup(monster.id);
        if (result.success) {
          processed++;
          console.log(`✅ Generated markup for ${monster.name} in ${region} (${result.markupLength} chars)`);
        } else {
          errors.push(`Failed to process ${monster.name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error processing ${monster.name}: ${(error as Error).message}`);
      }
    }

    return {
      success: true,
      processed,
      errors
    };

  } catch (error) {
    return {
      success: false,
      processed: 0,
      errors: [(error as Error).message]
    };
  }
}

/**
 * Get Homebrewery markup for a monster (from database or generate if missing)
 */
export async function getHomebreweryMarkup(monsterId: string): Promise<{
  success: boolean;
  markup?: string;
  error?: string;
}> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // First, try to get existing markup
    const { data: monster, error: fetchError } = await supabase
      .from('folklore_monsters')
      .select('monster_markup_homebrew, monster_json')
      .eq('id', monsterId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch monster: ${fetchError.message}`);
    }

    if (!monster) {
      throw new Error(`Monster with ID ${monsterId} not found`);
    }

    // If markup exists, return it
    if (monster.monster_markup_homebrew) {
      return {
        success: true,
        markup: monster.monster_markup_homebrew
      };
    }

    // If no markup but monster_json exists, generate it
    if (monster.monster_json) {
      const result = await populateHomebreweryMarkup(monsterId);
      if (result.success) {
        // Fetch the newly generated markup
        const { data: updatedMonster, error: refetchError } = await supabase
          .from('folklore_monsters')
          .select('monster_markup_homebrew')
          .eq('id', monsterId)
          .single();

        if (refetchError) {
          throw new Error(`Failed to fetch generated markup: ${refetchError.message}`);
        }

        return {
          success: true,
          markup: updatedMonster.monster_markup_homebrew
        };
              } else {
          return {
            success: false,
            error: result.error || 'Unknown error occurred'
          };
        }
    }

    return {
      success: false,
      error: 'Monster has no monster_json data to generate markup from'
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
} 