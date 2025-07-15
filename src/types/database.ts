// Database types for Supabase - matches the monster-schema.sql

export interface Database {
  public: {
    Tables: {
      monsters: {
        Row: Monster;
        Insert: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      citations: {
        Row: Citation;
        Insert: Omit<Citation, 'id' | 'createdAt'>;
        Update: Partial<Omit<Citation, 'id' | 'createdAt'>>;
      };
      art_prompts: {
        Row: ArtPrompt;
        Insert: Omit<ArtPrompt, 'id' | 'createdAt'>;
        Update: Partial<Omit<ArtPrompt, 'id' | 'createdAt'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'createdAt'>;
        Update: Partial<Omit<Review, 'id' | 'createdAt'>>;
      };
      generation_history: {
        Row: GenerationHistory;
        Insert: Omit<GenerationHistory, 'id' | 'startedAt'>;
        Update: Partial<Omit<GenerationHistory, 'id' | 'startedAt'>>;
      };
      regions: {
        Row: Region;
        Insert: Omit<Region, 'id' | 'createdAt'>;
        Update: Partial<Omit<Region, 'id' | 'createdAt'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'createdAt'>;
        Update: Partial<Omit<Tag, 'id' | 'createdAt'>>;
      };
      monster_tags: {
        Row: MonsterTag;
        Insert: MonsterTag;
        Update: Partial<MonsterTag>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_monsters_by_similarity: {
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
      calculate_monster_embedding: {
        Args: {
          monster_id: string;
        };
        Returns: number[];
      };
    };
    Enums: {
      monster_status: 'draft' | 'generating' | 'complete' | 'error';
    };
  };
}

// Database table interfaces
export interface Monster {
  id: string;
  name: string;
  region: string;
  tags: string[];
  lore: string;
  statblock: any; // JSONB - will be typed as StatBlock
  status: 'draft' | 'generating' | 'complete' | 'error';
  image_url?: string;
  pdf_url?: string;
  embedding?: number[]; // vector(1536)
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  monster_id: string;
  title: string;
  url: string;
  source: string;
  relevance?: string;
  created_at: string;
}

export interface ArtPrompt {
  id: string;
  monster_id: string;
  prompt: string;
  style: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Review {
  id: string;
  monster_id: string;
  rating?: number;
  feedback?: string;
  reviewer_type: string;
  status?: string;
  created_at: string;
}

export interface GenerationHistory {
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

export interface Region {
  id: string;
  name: string;
  description?: string;
  cultural_context?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  description?: string;
  created_at: string;
}

export interface MonsterTag {
  monster_id: string;
  tag_id: string;
}

// Helper functions for database operations
export const databaseTables = {
  monsters: 'monsters',
  citations: 'citations',
  art_prompts: 'art_prompts',
  reviews: 'reviews',
  generation_history: 'generation_history',
  regions: 'regions',
  tags: 'tags',
  monster_tags: 'monster_tags'
} as const;

export type DatabaseTable = keyof typeof databaseTables; 