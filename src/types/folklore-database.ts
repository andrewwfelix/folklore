// Folklore Database types for Supabase - matches the folklore-schema.sql

export interface FolkloreDatabase {
  public: {
    Tables: {
      folklore_monsters: {
        Row: FolkloreMonster;
        Insert: Omit<FolkloreMonster, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<FolkloreMonster, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      folklore_citations: {
        Row: FolkloreCitation;
        Insert: Omit<FolkloreCitation, 'id' | 'createdAt'>;
        Update: Partial<Omit<FolkloreCitation, 'id' | 'createdAt'>>;
      };
      folklore_art_prompts: {
        Row: FolkloreArtPrompt;
        Insert: Omit<FolkloreArtPrompt, 'id' | 'createdAt'>;
        Update: Partial<Omit<FolkloreArtPrompt, 'id' | 'createdAt'>>;
      };
      folklore_reviews: {
        Row: FolkloreReview;
        Insert: Omit<FolkloreReview, 'id' | 'createdAt'>;
        Update: Partial<Omit<FolkloreReview, 'id' | 'createdAt'>>;
      };
      folklore_generation_history: {
        Row: FolkloreGenerationHistory;
        Insert: Omit<FolkloreGenerationHistory, 'id' | 'startedAt'>;
        Update: Partial<Omit<FolkloreGenerationHistory, 'id' | 'startedAt'>>;
      };
      folklore_regions: {
        Row: FolkloreRegion;
        Insert: Omit<FolkloreRegion, 'id' | 'createdAt'>;
        Update: Partial<Omit<FolkloreRegion, 'id' | 'createdAt'>>;
      };
      folklore_tags: {
        Row: FolkloreTag;
        Insert: Omit<FolkloreTag, 'id' | 'createdAt'>;
        Update: Partial<Omit<FolkloreTag, 'id' | 'createdAt'>>;
      };
      folklore_monster_tags: {
        Row: FolkloreMonsterTag;
        Insert: FolkloreMonsterTag;
        Update: Partial<FolkloreMonsterTag>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_folklore_monsters_by_similarity: {
        Args: {
          query_embedding: number[];
          similarity_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          region: string;
          similarity: number;
        }[];
      };
      calculate_folklore_monster_embedding: {
        Args: {
          monster_id: string;
        };
        Returns: number[];
      };
    };
    Enums: {
      folklore_monster_status: 'draft' | 'generating' | 'complete' | 'error';
    };
  };
}

// Folklore Database table interfaces
export interface FolkloreMonster {
  id: string;
  name: string;
  region: string;
  tags: string[];
  lore: any; // JSONB - structured lore content with format and metadata
  statblock: any; // JSONB - will be typed as StatBlock
  status: 'draft' | 'generating' | 'complete' | 'error';
  image_url?: string;
  pdf_url?: string;
  monster_markup?: string; // Formatted content with HTML/markdown markup for stat block rendering
  embedding?: number[]; // vector(1536)
  created_at: string;
  updated_at: string;
}

export interface FolkloreCitation {
  id: string;
  monster_id: string;
  title: string;
  url: string;
  source: string;
  relevance?: string;
  created_at: string;
}

export interface FolkloreArtPrompt {
  id: string;
  monster_id: string;
  prompt: string;
  style: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface FolkloreReview {
  id: string;
  monster_id: string;
  rating?: number;
  feedback?: string;
  reviewer_type: string;
  status?: string;
  created_at: string;
}

export interface FolkloreGenerationHistory {
  id: string;
  monster_id: string;
  agent_name: string;
  agent_id: string;
  status: string;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  duration_ms?: number;
  started_at: string;
  completed_at?: string;
}

export interface FolkloreRegion {
  id: string;
  name: string;
  description?: string;
  cultural_context?: string;
  created_at: string;
}

export interface FolkloreTag {
  id: string;
  name: string;
  category?: string;
  description?: string;
  created_at: string;
}

export interface FolkloreMonsterTag {
  monster_id: string;
  tag_id: string;
}

// Helper functions for database operations
export const folkloreDatabaseTables = {
  monsters: 'folklore_monsters',
  citations: 'folklore_citations',
  art_prompts: 'folklore_art_prompts',
  reviews: 'folklore_reviews',
  generation_history: 'folklore_generation_history',
  regions: 'folklore_regions',
  tags: 'folklore_tags',
  monster_tags: 'folklore_monster_tags'
} as const;

export type FolkloreDatabaseTable = keyof typeof folkloreDatabaseTables;

// Helper functions for Supabase client
export const folkloreTableHelpers = {
  monsters: () => 'folklore_monsters',
  citations: () => 'folklore_citations',
  art_prompts: () => 'folklore_art_prompts',
  reviews: () => 'folklore_reviews',
  generation_history: () => 'folklore_generation_history',
  regions: () => 'folklore_regions',
  tags: () => 'folklore_tags',
  monster_tags: () => 'folklore_monster_tags'
} as const; 