import { createClient } from '@supabase/supabase-js';
import { Agent, Workflow, Execution, User } from '@/types';

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: Agent;
        Insert: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      workflows: {
        Row: Workflow;
        Insert: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      executions: {
        Row: Execution;
        Insert: Omit<Execution, 'id' | 'startedAt'>;
        Update: Partial<Omit<Execution, 'id' | 'startedAt'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt'>>;
      };
    };
  };
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const agentsTable = () => supabase.from('agents');
export const workflowsTable = () => supabase.from('workflows');
export const executionsTable = () => supabase.from('executions');
export const usersTable = () => supabase.from('users'); 