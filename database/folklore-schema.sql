-- Folklore Monster Generation Database Schema
-- This file contains the SQL schema for the AI-powered monster generation platform
-- All tables use the 'folklore_' prefix to prevent naming conflicts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Monster Status Enum
CREATE TYPE folklore_monster_status AS ENUM ('draft', 'generating', 'complete', 'error');

-- Folklore Monsters table (main table)
CREATE TABLE folklore_monsters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    lore TEXT NOT NULL,
    statblock JSONB NOT NULL,
    status folklore_monster_status DEFAULT 'draft',
    image_url TEXT,
    pdf_url TEXT,
    monster_json JSONB, -- Complete monster data as JSON before PDF generation
    embedding vector(1536), -- For semantic search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    console_log TEXT -- New field for persisting logs
);

-- Folklore Citations table (references to source materials)
CREATE TABLE folklore_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES folklore_monsters(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    source VARCHAR(100) NOT NULL, -- e.g., 'Wikipedia', 'Mythopedia'
    relevance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folklore Art Prompts table (AI art generation metadata)
CREATE TABLE folklore_art_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES folklore_monsters(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style VARCHAR(100) NOT NULL, -- e.g., 'digital art', 'ink illustration'
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folklore Reviews table (quality assurance and feedback)
CREATE TABLE folklore_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES folklore_monsters(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    reviewer_type VARCHAR(50) NOT NULL, -- 'ai_qa', 'human', 'user'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folklore Generation History table (track agent execution)
CREATE TABLE folklore_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES folklore_monsters(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    agent_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Folklore Regions table (for organizing monsters by geographic/cultural areas)
CREATE TABLE folklore_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    cultural_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folklore Tags table (for categorizing monsters)
CREATE TABLE folklore_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- e.g., 'creature_type', 'environment', 'power_level'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folklore Monster Tags junction table (many-to-many relationship)
CREATE TABLE folklore_monster_tags (
    monster_id UUID NOT NULL REFERENCES folklore_monsters(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES folklore_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (monster_id, tag_id)
);

-- Indexes for better performance
CREATE INDEX idx_folklore_monsters_region ON folklore_monsters(region);
CREATE INDEX idx_folklore_monsters_status ON folklore_monsters(status);
CREATE INDEX idx_folklore_monsters_created_at ON folklore_monsters(created_at);
CREATE INDEX idx_folklore_monsters_tags ON folklore_monsters USING GIN(tags);
CREATE INDEX idx_folklore_monsters_embedding ON folklore_monsters USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_folklore_citations_monster_id ON folklore_citations(monster_id);
CREATE INDEX idx_folklore_citations_source ON folklore_citations(source);

CREATE INDEX idx_folklore_art_prompts_monster_id ON folklore_art_prompts(monster_id);
CREATE INDEX idx_folklore_art_prompts_style ON folklore_art_prompts(style);

CREATE INDEX idx_folklore_reviews_monster_id ON folklore_reviews(monster_id);
CREATE INDEX idx_folklore_reviews_rating ON folklore_reviews(rating);
CREATE INDEX idx_folklore_reviews_reviewer_type ON folklore_reviews(reviewer_type);

CREATE INDEX idx_folklore_generation_history_monster_id ON folklore_generation_history(monster_id);
CREATE INDEX idx_folklore_generation_history_agent_name ON folklore_generation_history(agent_name);
CREATE INDEX idx_folklore_generation_history_status ON folklore_generation_history(status);
CREATE INDEX idx_folklore_generation_history_started_at ON folklore_generation_history(started_at);

CREATE INDEX idx_folklore_monster_tags_monster_id ON folklore_monster_tags(monster_id);
CREATE INDEX idx_folklore_monster_tags_tag_id ON folklore_monster_tags(tag_id);

-- Row Level Security (RLS) policies
ALTER TABLE folklore_monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_art_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE folklore_monster_tags ENABLE ROW LEVEL SECURITY;

-- Policies for folklore_monsters table
CREATE POLICY "Folklore monsters are viewable by everyone" ON folklore_monsters
    FOR SELECT USING (true);

CREATE POLICY "Folklore monsters can be created by authenticated users" ON folklore_monsters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Folklore monsters can be updated by authenticated users" ON folklore_monsters
    FOR UPDATE USING (true);

-- Policies for folklore_citations table
CREATE POLICY "Folklore citations are viewable by everyone" ON folklore_citations
    FOR SELECT USING (true);

CREATE POLICY "Folklore citations can be created by authenticated users" ON folklore_citations
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_art_prompts table
CREATE POLICY "Folklore art prompts are viewable by everyone" ON folklore_art_prompts
    FOR SELECT USING (true);

CREATE POLICY "Folklore art prompts can be created by authenticated users" ON folklore_art_prompts
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_reviews table
CREATE POLICY "Folklore reviews are viewable by everyone" ON folklore_reviews
    FOR SELECT USING (true);

CREATE POLICY "Folklore reviews can be created by authenticated users" ON folklore_reviews
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_generation_history table
CREATE POLICY "Folklore generation history is viewable by everyone" ON folklore_generation_history
    FOR SELECT USING (true);

CREATE POLICY "Folklore generation history can be created by authenticated users" ON folklore_generation_history
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_regions table
CREATE POLICY "Folklore regions are viewable by everyone" ON folklore_regions
    FOR SELECT USING (true);

CREATE POLICY "Folklore regions can be created by authenticated users" ON folklore_regions
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_tags table
CREATE POLICY "Folklore tags are viewable by everyone" ON folklore_tags
    FOR SELECT USING (true);

CREATE POLICY "Folklore tags can be created by authenticated users" ON folklore_tags
    FOR INSERT WITH CHECK (true);

-- Policies for folklore_monster_tags table
CREATE POLICY "Folklore monster tags are viewable by everyone" ON folklore_monster_tags
    FOR SELECT USING (true);

CREATE POLICY "Folklore monster tags can be created by authenticated users" ON folklore_monster_tags
    FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_folklore_monsters_updated_at BEFORE UPDATE ON folklore_monsters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate monster embedding (placeholder for AI integration)
CREATE OR REPLACE FUNCTION calculate_folklore_monster_embedding(monster_id UUID)
RETURNS vector AS $$
BEGIN
    -- This would be implemented with actual AI embedding calculation
    -- For now, return a zero vector
    RETURN '0'::vector;
END;
$$ LANGUAGE plpgsql;

-- Function to search monsters by similarity
CREATE OR REPLACE FUNCTION search_folklore_monsters_by_similarity(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    region VARCHAR(100),
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.region,
        1 - (m.embedding <=> query_embedding) as similarity
    FROM folklore_monsters m
    WHERE m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > similarity_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion functions
CREATE OR REPLACE FUNCTION insert_folklore_sample_regions()
RETURNS void AS $$
BEGIN
    INSERT INTO folklore_regions (name, description, cultural_context) VALUES
    ('Japan', 'Land of the Rising Sun', 'Rich in yokai folklore and Shinto traditions'),
    ('Greece', 'Ancient Mediterranean civilization', 'Home to classical mythology and heroic legends'),
    ('Norse', 'Scandinavian and Germanic traditions', 'Viking sagas and northern mythology'),
    ('Celtic', 'British Isles and Gaul', 'Druidic traditions and fairy folklore'),
    ('Slavic', 'Eastern European traditions', 'Baba Yaga and forest spirits'),
    ('Chinese', 'Ancient Chinese civilization', 'Taoist and Buddhist mythological traditions'),
    ('Indian', 'South Asian subcontinent', 'Hindu and Buddhist mythological traditions'),
    ('Egyptian', 'Ancient Nile civilization', 'Pharaonic mythology and afterlife beliefs'),
    ('Aztec', 'Mesoamerican civilization', 'Pre-Columbian mythology and warrior traditions'),
    ('Malaysia', 'Southeast Asian archipelago', 'Malay folklore and animist traditions')
    ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_folklore_sample_tags()
RETURNS void AS $$
BEGIN
    INSERT INTO folklore_tags (name, category, description) VALUES
    -- Creature Types
    ('undead', 'creature_type', 'Undead creatures and spirits'),
    ('demon', 'creature_type', 'Demonic entities and infernal beings'),
    ('fey', 'creature_type', 'Fairy and fey creatures'),
    ('dragon', 'creature_type', 'Draconic creatures and wyrms'),
    ('giant', 'creature_type', 'Giant humanoids and titans'),
    ('beast', 'creature_type', 'Animal-like creatures'),
    ('construct', 'creature_type', 'Magical constructs and golems'),
    ('elemental', 'creature_type', 'Elemental beings and spirits'),
    ('celestial', 'creature_type', 'Divine and celestial beings'),
    ('aberration', 'creature_type', 'Alien and aberrant creatures'),
    
    -- Environments
    ('forest', 'environment', 'Forest-dwelling creatures'),
    ('mountain', 'environment', 'Mountain and cave creatures'),
    ('water', 'environment', 'Aquatic and water-dwelling creatures'),
    ('desert', 'environment', 'Desert and arid environment creatures'),
    ('urban', 'environment', 'City and settlement creatures'),
    ('underdark', 'environment', 'Underground and subterranean creatures'),
    ('astral', 'environment', 'Astral and planar creatures'),
    
    -- Power Levels
    ('legendary', 'power_level', 'Legendary and mythic creatures'),
    ('elite', 'power_level', 'Elite and powerful creatures'),
    ('common', 'power_level', 'Common and everyday creatures'),
    ('boss', 'power_level', 'Boss and encounter-ending creatures')
    ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Initialize sample data
SELECT insert_folklore_sample_regions();
SELECT insert_folklore_sample_tags(); 