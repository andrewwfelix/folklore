import { supabase } from '../supabase/client';

export interface MonsterData {
  id?: string;
  name: string;
  region: string;
  tags?: string[];
  lore: string;
  statBlock?: any;
  citations?: any[];
  art?: any;
  pdfUrl?: string | undefined;
  imageUrl?: string | undefined;
  status?: string;
  refinement_session_id?: string;
  initial_qa_score?: number;
  final_qa_score?: number;
  refinement_iterations?: number;
  refinement_success?: boolean;
}

export class MonsterPersistence {
  /**
   * Save a monster to the database
   */
  async saveMonster(monster: MonsterData): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('folklore_monsters')
        .insert({
          name: monster.name,
          region: monster.region,
          lore: monster.lore,
          statblock: monster.statBlock,
          image_url: monster.imageUrl || null,
          pdf_url: monster.pdfUrl || null,
          refinement_session_id: monster.refinement_session_id,
          initial_qa_score: monster.initial_qa_score,
          final_qa_score: monster.final_qa_score,
          refinement_iterations: monster.refinement_iterations,
          refinement_success: monster.refinement_success
        })
        .select('id')
        .single();

      if (error) throw error;
      
      const monsterId = data.id;
      console.log(`💾 Saved monster to database: ${monsterId}`);
      
      // Save citations to separate table if provided
      if (monster.citations && monster.citations.length > 0) {
        await this.saveCitations(monsterId, monster.citations);
      }
      
      // Save art prompt to separate table if provided
      if (monster.art) {
        await this.saveArtPrompt(monsterId, monster.art);
      }
      
      return monsterId;
    } catch (error) {
      console.error('Failed to save monster:', error);
      throw error;
    }
  }

  /**
   * Save citations to the folklore_citations table
   */
  private async saveCitations(monsterId: string, citations: any[]): Promise<void> {
    try {
      const citationData = citations.map(citation => ({
        monster_id: monsterId,
        title: citation.title || 'Unknown',
        url: citation.url || '',
        source: citation.source || 'Unknown',
        relevance: citation.relevance || ''
      }));

      const { error } = await supabase
        .from('folklore_citations')
        .insert(citationData);

      if (error) throw error;
      
      console.log(`📚 Saved ${citations.length} citations for monster: ${monsterId}`);
    } catch (error) {
      console.error('Failed to save citations:', error);
      throw error;
    }
  }

  /**
   * Save art prompt to the folklore_art_prompts table
   */
  private async saveArtPrompt(monsterId: string, art: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('folklore_art_prompts')
        .insert({
          monster_id: monsterId,
          prompt: art.prompt || '',
          style: art.style || 'digital art',
          description: art.description || '',
          image_url: art.imageUrl || null
        });

      if (error) throw error;
      
      console.log(`🎨 Saved art prompt for monster: ${monsterId}`);
    } catch (error) {
      console.error('Failed to save art prompt:', error);
      throw error;
    }
  }

  /**
   * Update an existing monster with refinement data
   */
  async updateMonster(monsterId: string, updates: Partial<MonsterData>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.region) updateData.region = updates.region;
      if (updates.lore) updateData.lore = updates.lore;
      if (updates.statBlock) updateData.statblock = updates.statBlock;
      if (updates.imageUrl) updateData.image_url = updates.imageUrl;
      if (updates.pdfUrl) updateData.pdf_url = updates.pdfUrl;
      if (updates.refinement_session_id) updateData.refinement_session_id = updates.refinement_session_id;
      if (updates.initial_qa_score !== undefined) updateData.initial_qa_score = updates.initial_qa_score;
      if (updates.final_qa_score !== undefined) updateData.final_qa_score = updates.final_qa_score;
      if (updates.refinement_iterations !== undefined) updateData.refinement_iterations = updates.refinement_iterations;
      if (updates.refinement_success !== undefined) updateData.refinement_success = updates.refinement_success;

      const { error } = await supabase
        .from('folklore_monsters')
        .update(updateData)
        .eq('id', monsterId);

      if (error) throw error;
      
      console.log(`📝 Updated monster: ${monsterId}`);
    } catch (error) {
      console.error('Failed to update monster:', error);
      throw error;
    }
  }

  /**
   * Get a monster by ID
   */
  async getMonster(monsterId: string): Promise<MonsterData | null> {
    try {
      const { data, error } = await supabase
        .from('folklore_monsters')
        .select('*')
        .eq('id', monsterId)
        .single();

      if (error) throw error;
      
      // Fetch citations from separate table
      const { data: citationsData } = await supabase
        .from('folklore_citations')
        .select('*')
        .eq('monster_id', monsterId);

      // Fetch art prompt from separate table
      const { data: artData } = await supabase
        .from('folklore_art_prompts')
        .select('*')
        .eq('monster_id', monsterId)
        .single();

      return {
        id: data.id,
        name: data.name,
        region: data.region,
        tags: data.tags,
        lore: data.lore,
        statBlock: data.statblock,
        citations: citationsData || [],
        art: artData || {},
        pdfUrl: data.pdf_url || undefined,
        imageUrl: data.image_url || undefined,
        status: data.status,
        refinement_session_id: data.refinement_session_id,
        initial_qa_score: data.initial_qa_score,
        final_qa_score: data.final_qa_score,
        refinement_iterations: data.refinement_iterations,
        refinement_success: data.refinement_success
      };
    } catch (error) {
      console.error('Failed to get monster:', error);
      return null;
    }
  }

  /**
   * Get all monsters with refinement data
   */
  async getAllMonsters(): Promise<MonsterData[]> {
    try {
      const { data, error } = await supabase
        .from('folklore_monsters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch citations and art prompts for all monsters
      const monstersWithDetails = await Promise.all(
        data.map(async (monster: any) => {
          // Fetch citations for this monster
          const { data: citationsData } = await supabase
            .from('folklore_citations')
            .select('*')
            .eq('monster_id', monster.id);

          // Fetch art prompt for this monster
          const { data: artData } = await supabase
            .from('folklore_art_prompts')
            .select('*')
            .eq('monster_id', monster.id)
            .single();

          return {
            id: monster.id,
            name: monster.name,
            region: monster.region,
            tags: monster.tags,
            lore: monster.lore,
            statBlock: monster.statblock,
            citations: citationsData || [],
            art: artData || {},
            pdfUrl: monster.pdf_url || undefined,
            imageUrl: monster.image_url || undefined,
            status: monster.status,
            refinement_session_id: monster.refinement_session_id,
            initial_qa_score: monster.initial_qa_score,
            final_qa_score: monster.final_qa_score,
            refinement_iterations: monster.refinement_iterations,
            refinement_success: monster.refinement_success
          };
        })
      );

      return monstersWithDetails;
    } catch (error) {
      console.error('Failed to get monsters:', error);
      return [];
    }
  }

  /**
   * Get monsters that have been refined
   */
  async getRefinedMonsters(): Promise<MonsterData[]> {
    try {
      const { data, error } = await supabase
        .from('folklore_monsters')
        .select('*')
        .not('refinement_session_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch citations and art prompts for all refined monsters
      const monstersWithDetails = await Promise.all(
        data.map(async (monster: any) => {
          // Fetch citations for this monster
          const { data: citationsData } = await supabase
            .from('folklore_citations')
            .select('*')
            .eq('monster_id', monster.id);

          // Fetch art prompt for this monster
          const { data: artData } = await supabase
            .from('folklore_art_prompts')
            .select('*')
            .eq('monster_id', monster.id)
            .single();

          return {
            id: monster.id,
            name: monster.name,
            region: monster.region,
            tags: monster.tags,
            lore: monster.lore,
            statBlock: monster.statblock,
            citations: citationsData || [],
            art: artData || {},
            pdfUrl: monster.pdf_url || undefined,
            imageUrl: monster.image_url || undefined,
            status: monster.status,
            refinement_session_id: monster.refinement_session_id,
            initial_qa_score: monster.initial_qa_score,
            final_qa_score: monster.final_qa_score,
            refinement_iterations: monster.refinement_iterations,
            refinement_success: monster.refinement_success
          };
        })
      );

      return monstersWithDetails;
    } catch (error) {
      console.error('Failed to get refined monsters:', error);
      return [];
    }
  }

  /**
   * Delete a monster
   */
  async deleteMonster(monsterId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('folklore_monsters')
        .delete()
        .eq('id', monsterId);

      if (error) throw error;
      
      console.log(`🗑️  Deleted monster: ${monsterId}`);
    } catch (error) {
      console.error('Failed to delete monster:', error);
      throw error;
    }
  }
} 