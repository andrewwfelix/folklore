-- Migration: Change lore column from TEXT to JSONB
-- This provides consistency with statblock and allows for structured lore content

-- First, create a backup of existing lore data
ALTER TABLE folklore_monsters 
ADD COLUMN lore_backup TEXT;

-- Copy existing lore data to backup
UPDATE folklore_monsters 
SET lore_backup = lore 
WHERE lore IS NOT NULL;

-- Drop the existing lore column
ALTER TABLE folklore_monsters 
DROP COLUMN lore;

-- Add the new JSONB lore column
ALTER TABLE folklore_monsters 
ADD COLUMN lore JSONB;

-- Convert existing lore data to JSONB format
-- Simple text lore becomes: {"content": "original lore text", "format: }
UPDATE folklore_monsters 
SET lore = jsonb_build_object(
 content', lore_backup,
  format', 'plain,
   created_at', NOW()
)
WHERE lore_backup IS NOT NULL;

-- Drop the backup column
ALTER TABLE folklore_monsters 
DROP COLUMN lore_backup;

-- Add a comment to document the new structure
COMMENT ON COLUMN folklore_monsters.lore ISStructured lore content in JSONB format. Expected structure: {"content": "lore text",format: "plain|markdown|html", metadata": {...}}';

-- Create an index for JSONB lore content (optional, for performance)
CREATE INDEX idx_folklore_monsters_lore_content ON folklore_monsters USING GIN (lore);

-- Example of the new lore structure:
/*
{content": "The ancient dragon dwells in the depths of the mountain...",
format": "plain",
 metadata":[object Object]
   word_count": 150
    language": en",
    version: 