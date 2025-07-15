import { supabase } from '../supabase/client';
import { QAIssue } from '../../types/qa-feedback';

export interface RefinementSession {
  id?: string;
  monster_id?: string;
  session_name: string;
  initial_qa_score?: number;
  final_qa_score?: number;
  total_iterations?: number;
  max_iterations?: number;
  success_criteria_met?: boolean;
  final_status?: string;
  total_duration_ms?: number;
}

export interface RefinementIteration {
  id?: string;
  session_id: string;
  iteration_number: number;
  qa_score_before?: number;
  qa_score_after?: number;
  qa_issues?: QAIssue[];
  agent_actions?: AgentAction[];
  improvements_made?: string[];
  duration_ms?: number;
  success?: boolean;
}

export interface AgentAction {
  agent_name: string;
  feedback_received: string;
  action_taken: string;
  duration_ms: number;
  success: boolean;
}

export interface AgentMetric {
  id?: string;
  agent_name: string;
  session_id: string;
  iteration_id: string;
  feedback_received: string;
  action_taken: string;
  duration_ms: number;
  success: boolean;
}

export class RefinementLogger {
  private sessionId?: string;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Start a new refinement session
   */
  async startSession(session: RefinementSession): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('folklore_refinement_sessions')
        .insert({
          session_name: session.session_name,
          initial_qa_score: session.initial_qa_score,
          max_iterations: session.max_iterations || 3
        })
        .select('id')
        .single();

      if (error) throw error;
      
      this.sessionId = data.id;
      console.log(`📊 Started refinement session: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('Failed to start refinement session:', error);
      throw error;
    }
  }

  /**
   * Log a refinement iteration
   */
  async logIteration(iteration: RefinementIteration): Promise<string> {
    if (!this.sessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    try {
      const { data, error } = await supabase
        .from('folklore_refinement_iterations')
        .insert({
          session_id: this.sessionId,
          iteration_number: iteration.iteration_number,
          qa_score_before: iteration.qa_score_before,
          qa_score_after: iteration.qa_score_after,
          qa_issues: iteration.qa_issues,
          agent_actions: iteration.agent_actions,
          improvements_made: iteration.improvements_made,
          duration_ms: iteration.duration_ms,
          success: iteration.success
        })
        .select('id')
        .single();

      if (error) throw error;
      
      console.log(`📝 Logged iteration ${iteration.iteration_number}: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('Failed to log iteration:', error);
      throw error;
    }
  }

  /**
   * Log individual agent actions
   */
  async logAgentAction(metric: AgentMetric): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('folklore_agent_metrics')
        .insert({
          agent_name: metric.agent_name,
          session_id: metric.session_id,
          iteration_id: metric.iteration_id,
          feedback_received: metric.feedback_received,
          action_taken: metric.action_taken,
          duration_ms: metric.duration_ms,
          success: metric.success
        })
        .select('id')
        .single();

      if (error) throw error;
      
      console.log(`🤖 Logged agent action: ${metric.agent_name} - ${metric.action_taken}`);
      return data.id;
    } catch (error) {
      console.error('Failed to log agent action:', error);
      throw error;
    }
  }

  /**
   * Complete the refinement session
   */
  async completeSession(session: Partial<RefinementSession>): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session to complete.');
    }

    try {
      const totalDuration = Date.now() - this.startTime;
      
      const { error } = await supabase
        .from('folklore_refinement_sessions')
        .update({
          final_qa_score: session.final_qa_score,
          total_iterations: session.total_iterations,
          success_criteria_met: session.success_criteria_met,
          final_status: session.final_status,
          total_duration_ms: totalDuration,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.sessionId);

      if (error) throw error;
      
      console.log(`✅ Completed refinement session: ${this.sessionId}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  }

  /**
   * Update monster with refinement metadata
   */
  async updateMonsterRefinement(monsterId: string, sessionId: string, metadata: {
    initial_qa_score?: number;
    final_qa_score?: number;
    refinement_iterations?: number;
    refinement_success?: boolean;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('folklore_monsters')
        .update({
          refinement_session_id: sessionId,
          initial_qa_score: metadata.initial_qa_score,
          final_qa_score: metadata.final_qa_score,
          refinement_iterations: metadata.refinement_iterations,
          refinement_success: metadata.refinement_success
        })
        .eq('id', monsterId);

      if (error) throw error;
      
      console.log(`📊 Updated monster ${monsterId} with refinement metadata`);
    } catch (error) {
      console.error('Failed to update monster refinement:', error);
      throw error;
    }
  }

  /**
   * Get refinement summary for a monster
   */
  async getRefinementSummary(monsterId: string) {
    try {
      const { data, error } = await supabase
        .from('folklore_refinement_summary')
        .select('*')
        .eq('monster_id', monsterId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get refinement summary:', error);
      return null;
    }
  }

  /**
   * Get all refinement sessions
   */
  async getAllRefinementSessions() {
    try {
      const { data, error } = await supabase
        .from('folklore_refinement_summary')
        .select('*')
        .order('session_started', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get refinement sessions:', error);
      return [];
    }
  }
} 