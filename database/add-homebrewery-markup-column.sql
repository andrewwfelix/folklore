-- Add Homebrewery markup column to folklore_monsters table
-- This column will store pre-generated Homebrewery V3 markup for easy export

ALTER TABLE folklore_monsters 
ADD COLUMN monster_markup_homebrew TEXT;

-- Add an index for better performance when querying by markup
CREATE INDEX idx_folklore_monsters_markup_homebrew ON folklore_monsters(monster_markup_homebrew) 
WHERE monster_markup_homebrew IS NOT NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN folklore_monsters.monster_markup_homebrew IS 
'Pre-generated Homebrewery V3 markup for easy export. Populated automatically after monster generation.'; 