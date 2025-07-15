-- Refinement Logs Schema
-- Tracks the QA feedback refinement process for each monster

-- Refinement sessions table
CREATE TABLE IF NOT EXISTS folklore_refinement_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monster_id UUID REFERENCES folklore_monsters(id),
    session_name TEXT NOT NULL,
    initial_qa_score DECIMAL(3,2),
    final_qa_score DECIMAL(3,2),
    total_iterations INTEGER DEFAULT 0,
    max_iterations INTEGER DEFAULT 3,
    success_criteria_met BOOLEAN DEFAULT FALSE,
    final_status TEXT CHECK (final_status IN ('SUCCESS', 'MAX_ITERATIONS_REACHED', 'CONSECUTIVE_FAILURES', 'UNKNOWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_ms INTEGER
);

-- Individual refinement iterations
CREATE TABLE IF NOT EXISTS folklore_refinement_iterations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES folklore_refinement_sessions(id) ON DELETE CASCADE,
    iteration_number INTEGER NOT NULL,
    qa_score_before DECIMAL(3,2),
    qa_score_after DECIMAL(3,2),
    qa_issues JSONB, -- Array of QA issues found
    agent_actions JSONB, -- Array of agent actions taken
    improvements_made JSONB, -- What was changed
    duration_ms INTEGER,
    success BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS folklore_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    session_id UUID REFERENCES folklore_refinement_sessions(id) ON DELETE CASCADE,
    iteration_id UUID REFERENCES folklore_refinement_iterations(id) ON DELETE CASCADE,
    feedback_received TEXT,
    action_taken TEXT,
    duration_ms INTEGER,
    success BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_refinement_sessions_monster_id ON folklore_refinement_sessions(monster_id);
CREATE INDEX IF NOT EXISTS idx_refinement_sessions_created_at ON folklore_refinement_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_refinement_iterations_session_id ON folklore_refinement_iterations(session_id);
CREATE INDEX IF NOT EXISTS idx_refinement_iterations_iteration_number ON folklore_refinement_iterations(iteration_number);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_name ON folklore_agent_metrics(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_session_id ON folklore_agent_metrics(session_id);

-- Add refinement metadata to monsters table
ALTER TABLE folklore_monsters 
ADD COLUMN IF NOT EXISTS refinement_session_id UUID REFERENCES folklore_refinement_sessions(id),
ADD COLUMN IF NOT EXISTS initial_qa_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS final_qa_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS refinement_iterations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS refinement_success BOOLEAN DEFAULT FALSE;

-- Create a view for easy querying of refinement results
CREATE OR REPLACE VIEW folklore_refinement_summary AS
SELECT 
    m.id as monster_id,
    m.name as monster_name,
    m.region,
    rs.session_name,
    rs.initial_qa_score,
    rs.final_qa_score,
    rs.total_iterations,
    rs.final_status,
    rs.total_duration_ms,
    rs.created_at as session_started,
    rs.completed_at as session_completed
FROM folklore_monsters m
LEFT JOIN folklore_refinement_sessions rs ON m.refinement_session_id = rs.id
ORDER BY rs.created_at DESC; 