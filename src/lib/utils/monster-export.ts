import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { config } from '../../config';
import { generateHomebreweryMarkup, generateHomebreweryCollection, HomebreweryExportOptions } from './homebrewery-export';
import { generateMonsterMarkup } from './monster-markup';
import { getHomebreweryMarkup } from './monster-markup-persistence';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface ExportOptions {
  format: 'homebrewery' | 'markdown' | 'json';
  includeLore?: boolean;
  includeCitations?: boolean;
  includeArtPrompt?: boolean;
  customStyling?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  outputPath?: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
  monsterCount?: number;
}

/**
 * Export a single monster from the database
 */
export async function exportMonster(
  monsterId: string,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Fetch monster from database
    const { data: monster, error } = await supabase
      .from('folklore_monsters')
      .select('*')
      .eq('id', monsterId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch monster: ${error.message}`);
    }

    if (!monster) {
      throw new Error(`Monster with ID ${monsterId} not found`);
    }

    let content: string;
    let filePath: string;

    switch (options.format) {
      case 'homebrewery':
        // Try to get pre-generated markup first
        const markupResult = await getHomebreweryMarkup(monsterId);
        if (markupResult.success && markupResult.markup) {
          content = markupResult.markup;
        } else {
          // Fallback to generating markup on-the-fly
          const homebreweryOptions: HomebreweryExportOptions = {
            includeLore: options.includeLore ?? true,
            includeCitations: options.includeCitations ?? false,
            includeArtPrompt: options.includeArtPrompt ?? false,
            ...(options.customStyling && { customStyling: options.customStyling })
          };
          content = generateHomebreweryMarkup(monster.monster_json, homebreweryOptions);
        }
        filePath = options.outputPath || join(process.cwd(), `export-${monster.name.replace(/\s+/g, '-').toLowerCase()}-homebrewery.md`);
        break;

      case 'markdown':
        content = generateMonsterMarkup(monster.monster_json);
        filePath = options.outputPath || join(process.cwd(), `export-${monster.name.replace(/\s+/g, '-').toLowerCase()}-markdown.md`);
        break;

      case 'json':
        content = JSON.stringify(monster.monster_json, null, 2);
        filePath = options.outputPath || join(process.cwd(), `export-${monster.name.replace(/\s+/g, '-').toLowerCase()}.json`);
        break;

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Write to file
    writeFileSync(filePath, content, 'utf8');

    return {
      success: true,
      filePath,
      content,
      monsterCount: 1
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Export multiple monsters from the database
 */
export async function exportMonsters(
  options: ExportOptions,
  filter?: {
    region?: string;
    tags?: string[];
    status?: string;
    limit?: number;
  }
): Promise<ExportResult> {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Build query
    let query = supabase
      .from('folklore_monsters')
      .select('*');

    if (filter?.region) {
      query = query.eq('region', filter.region);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    // Execute query
    const { data: monsters, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch monsters: ${error.message}`);
    }

    if (!monsters || monsters.length === 0) {
      throw new Error('No monsters found matching the criteria');
    }

    let content: string;
    let filePath: string;

    switch (options.format) {
      case 'homebrewery':
        const homebreweryOptions: HomebreweryExportOptions = {
          includeLore: options.includeLore ?? true,
          includeCitations: options.includeCitations ?? false,
          includeArtPrompt: options.includeArtPrompt ?? false,
          ...(options.customStyling && { customStyling: options.customStyling })
        };
        
        // Extract monster JSON data
        const monsterData = monsters.map(m => m.monster_json).filter(Boolean);
        content = generateHomebreweryCollection(
          monsterData,
          `Folklore Monsters: ${filter?.region ? filter.region : 'Collection'}`,
          homebreweryOptions
        );
        filePath = options.outputPath || join(process.cwd(), `export-collection-${Date.now()}-homebrewery.md`);
        break;

      case 'markdown':
        content = monsters.map(m => {
          const markup = generateMonsterMarkup(m.monster_json);
          return `# ${m.name}\n\n${markup}\n\n---\n\n`;
        }).join('');
        filePath = options.outputPath || join(process.cwd(), `export-collection-${Date.now()}-markdown.md`);
        break;

      case 'json':
        content = JSON.stringify(monsters.map(m => m.monster_json).filter(Boolean), null, 2);
        filePath = options.outputPath || join(process.cwd(), `export-collection-${Date.now()}.json`);
        break;

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Write to file
    writeFileSync(filePath, content, 'utf8');

    return {
      success: true,
      filePath,
      content,
      monsterCount: monsters.length
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Export all monsters from the database
 */
export async function exportAllMonsters(
  options: ExportOptions
): Promise<ExportResult> {
  return exportMonsters(options, {});
}

/**
 * Export monsters by region
 */
export async function exportMonstersByRegion(
  region: string,
  options: ExportOptions
): Promise<ExportResult> {
  return exportMonsters(options, { region });
}

/**
 * Export monsters by tags
 */
export async function exportMonstersByTags(
  tags: string[],
  options: ExportOptions
): Promise<ExportResult> {
  // Note: This would need a more complex query to filter by tags
  // For now, we'll export all and filter in memory
  const result = await exportMonsters(options, {});
  
  if (result.success && result.content) {
    // Parse the content and filter by tags
    // This is a simplified approach - in practice you might want to do this at the database level
    console.log(`Note: Tag filtering is not yet implemented. Exporting all monsters.`);
  }
  
  return result;
} 