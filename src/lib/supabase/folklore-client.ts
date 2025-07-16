import { createClient } from '@supabase/supabase-js';
import { FolkloreDatabase } from '@/types/folklore-database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY']!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const folkloreSupabase = createClient<FolkloreDatabase>(supabaseUrl, supabaseAnonKey);

// Helper functions for folklore database operations
export const folkloreTables = {
  monsters: () => folkloreSupabase.from('folklore_monsters'),
  citations: () => folkloreSupabase.from('folklore_citations'),
  art_prompts: () => folkloreSupabase.from('folklore_art_prompts'),
  reviews: () => folkloreSupabase.from('folklore_reviews'),
  generation_history: () => folkloreSupabase.from('folklore_generation_history'),
  regions: () => folkloreSupabase.from('folklore_regions'),
  tags: () => folkloreSupabase.from('folklore_tags'),
  monster_tags: () => folkloreSupabase.from('folklore_monster_tags')
} as const;

// Convenience functions for common operations
export const folkloreHelpers = {
  // Monster operations
  getMonsters: () => folkloreTables.monsters().select('*'),
  getMonsterById: (id: string) => folkloreTables.monsters().select('*').eq('id', id).single(),
  createMonster: (data: any) => folkloreTables.monsters().insert(data).select().single(),
  updateMonster: (id: string, data: any) => folkloreTables.monsters().update(data).eq('id', id).select().single(),
  deleteMonster: (id: string) => folkloreTables.monsters().delete().eq('id', id),

  // Region operations
  getRegions: () => folkloreTables.regions().select('*'),
  getRegionByName: (name: string) => folkloreTables.regions().select('*').eq('name', name).single(),

  // Tag operations
  getTags: () => folkloreTables.tags().select('*'),
  getTagsByCategory: (category: string) => folkloreTables.tags().select('*').eq('category', category),

  // Citation operations
  getCitationsByMonsterId: (monsterId: string) => folkloreTables.citations().select('*').eq('monster_id', monsterId),
  createCitation: (data: any) => folkloreTables.citations().insert(data).select().single(),

  // Art prompt operations
  getArtPromptByMonsterId: (monsterId: string) => folkloreTables.art_prompts().select('*').eq('monster_id', monsterId).single(),
  createArtPrompt: (data: any) => folkloreTables.art_prompts().insert(data).select().single(),

  // Review operations
  getReviewsByMonsterId: (monsterId: string) => folkloreTables.reviews().select('*').eq('monster_id', monsterId),
  createReview: (data: any) => folkloreTables.reviews().insert(data).select().single(),

  // Generation history operations
  getGenerationHistoryByMonsterId: (monsterId: string) => folkloreTables.generation_history().select('*').eq('monster_id', monsterId).order('started_at', { ascending: false }),
  createGenerationHistory: (data: any) => folkloreTables.generation_history().insert(data).select().single(),

  // Search operations
  searchMonstersBySimilarity: (queryEmbedding: number[], similarityThreshold = 0.5, matchCount = 10) => 
    folkloreSupabase.rpc('search_folklore_monsters_by_similarity', {
      query_embedding: queryEmbedding,
      similarity_threshold: similarityThreshold,
      match_count: matchCount
    }),

  // Monster tag operations
  getMonsterTags: (monsterId: string) => folkloreTables.monster_tags().select('*, folklore_tags(*)').eq('monster_id', monsterId),
  addMonsterTag: (monsterId: string, tagId: string) => folkloreTables.monster_tags().insert({ monster_id: monsterId, tag_id: tagId }),
  removeMonsterTag: (monsterId: string, tagId: string) => folkloreTables.monster_tags().delete().eq('monster_id', monsterId).eq('tag_id', tagId)
} as const; 