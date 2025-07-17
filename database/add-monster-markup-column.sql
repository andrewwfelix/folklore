-- Migration: Add monster_markup column to folklore_monsters table
-- This column will store formatted monster content with markup for consistent rendering

-- Add the monster_markup column
ALTER TABLE folklore_monsters 
ADD COLUMN monster_markup TEXT;

-- Add a comment to document the columnspurpose
COMMENT ON COLUMN folklore_monsters.monster_markup IS 
Formatted monster content with HTML-style or markdown-style markup for consistent rendering across PDF, web, and other output formats. Contains preprocessed formatting that aligns with D&D 5e stat block conventions.';

-- Create an index for text search on the markup content (optional)
CREATE INDEX idx_folklore_monsters_markup ON folklore_monsters USING GIN(to_tsvector(english', monster_markup));

-- Update the existing trigger to include the new column in updated_at
-- (The existing trigger will automatically handle this column)

-- Example of what the monster_markup column might contain:
/*
{
  statblock": [object Object]    armor_class: <b>ARMOR CLASS</b>15(natural armor),
    hit_points": <b>HIT POINTS</b>45 (6+ 12,
    speed": "<b>SPEED</b>30ft., fly 60 ft.",
 abilities": [object Object]
      str": <b>STR</b>16 (+3),
      dex": <b>DEX</b>14 (+2),
      con": <b>CON</b>14 (+2),
      int": <b>INT</b>10 (+0),
      wis": <b>WIS</b>12 (+1),
      cha":<b>CHA</b> 8(-1)"
    },
    actions":   <b>Multiattack.</b> The creature makes two attacks: one with its bite and one with its claws.",
     <b>Bite.</b> <i>Melee Weapon Attack:</i> +5 to hit, reach 5ft., one target. <i>Hit:</i> 8 (1d8 + 4piercing damage."
    ]
  }
}
*/ 