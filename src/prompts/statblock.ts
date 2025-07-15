import { PromptTemplate } from './index';

export const STATBLOCK_PROMPT: PromptTemplate = {
  name: 'StatBlock Generation',
  description: 'Convert monster lore into D&D 5e compatible stat block',
  template: `You are a game designer writing D&D 5e-compatible stat blocks. Based on the given monster lore, create a full stat block using SRD 5.1 mechanics.

Monster Lore:
{{lore}}

Requirements:
- Include Armor Class, Hit Points, Speed, Ability Scores
- Include Saving Throws, Skills, Senses, Languages
- Set appropriate Challenge Rating (CR) with justification
- Create Actions (multiattack, special attacks, traits)
- Add Legendary or Lair Actions if appropriate for the creature's power level
- Use balanced mechanics that connect lore to abilities
- Ensure all values are reasonable for the CR
- Follow D&D 5e formatting conventions

IMPORTANT: Return ONLY valid JSON without any markdown formatting, additional text, or explanations. Ensure all strings are properly escaped and the JSON is complete and well-formed.

Return the stat block in valid JSON format with the following structure:
{
  "armorClass": number,
  "hitPoints": number,
  "speed": {
    "walk": number,
    "fly": number (optional),
    "swim": number (optional),
    "climb": number (optional),
    "burrow": number (optional)
  },
  "abilityScores": {
    "strength": number,
    "dexterity": number,
    "constitution": number,
    "intelligence": number,
    "wisdom": number,
    "charisma": number
  },
  "savingThrows": {
    "strength": number (optional),
    "dexterity": number (optional),
    "constitution": number (optional),
    "intelligence": number (optional),
    "wisdom": number (optional),
    "charisma": number (optional)
  },
  "skills": {
    "skill_name": number
  },
  "senses": {
    "darkvision": number (optional),
    "blindsight": number (optional),
    "tremorsense": number (optional),
    "truesight": number (optional),
    "passivePerception": number
  },
  "languages": ["language1", "language2"],
  "challengeRating": number,
  "experiencePoints": number,
  "traits": [
    {
      "name": "string",
      "description": "string"
    }
  ],
  "actions": [
    {
      "name": "string",
      "description": "string",
      "attackBonus": number (optional),
      "damage": {
        "type": "string",
        "roll": "string",
        "bonus": number (optional)
      },
      "reach": number (optional),
      "targets": "string" (optional)
    }
  ],
  "legendaryActions": [
    {
      "name": "string",
      "description": "string",
      "cost": number
    }
  ] (optional),
  "lairActions": [
    {
      "name": "string",
      "description": "string"
    }
  ] (optional)
}`,
  variables: ['lore'],
  examples: [
    {
      input: {
        lore: 'The Kitsune-no-Mori is a nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers.'
      },
      output: `{
  "armorClass": 15,
  "hitPoints": 120,
  "speed": {
    "walk": 40,
    "fly": 60
  },
  "abilityScores": {
    "strength": 14,
    "dexterity": 18,
    "constitution": 16,
    "intelligence": 16,
    "wisdom": 20,
    "charisma": 18
  },
  "savingThrows": {
    "dexterity": 8,
    "wisdom": 9,
    "charisma": 8
  },
  "skills": {
    "perception": 9,
    "stealth": 8,
    "deception": 8
  },
  "senses": {
    "darkvision": 60,
    "truesight": 30,
    "passivePerception": 19
  },
  "languages": ["Common", "Sylvan", "Celestial"],
  "challengeRating": 8,
  "experiencePoints": 3900,
  "traits": [
    {
      "name": "Innate Spellcasting",
      "description": "The kitsune's innate spellcasting ability is Wisdom (spell save DC 17). It can innately cast the following spells, requiring no material components: At will: detect thoughts, minor illusion, 3/day each: charm person, suggestion, 1/day each: dominate person, mass suggestion"
    },
    {
      "name": "Magic Resistance",
      "description": "The kitsune has advantage on saving throws against spells and other magical effects."
    },
    {
      "name": "Nine-Tailed Form",
      "description": "The kitsune can use a bonus action to grow or retract its nine tails. While all nine tails are visible, it has advantage on Charisma checks and saving throws."
    }
  ],
  "actions": [
    {
      "name": "Multiattack",
      "description": "The kitsune makes three attacks: one with its bite and two with its claws."
    },
    {
      "name": "Bite",
      "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage plus 7 (2d6) psychic damage.",
      "attackBonus": 7,
      "damage": {
        "type": "piercing",
        "roll": "1d8+4"
      },
      "reach": 5
    },
    {
      "name": "Claw",
      "description": "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) slashing damage.",
      "attackBonus": 7,
      "damage": {
        "type": "slashing",
        "roll": "1d6+4"
      },
      "reach": 5
    },
    {
      "name": "Fox Fire",
      "description": "The kitsune exhales a blast of magical fire in a 15-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one.",
      "targets": "15-foot cone"
    }
  ],
  "legendaryActions": [
    {
      "name": "Detect",
      "description": "The kitsune makes a Wisdom (Perception) check.",
      "cost": 1
    },
    {
      "name": "Tail Swipe",
      "description": "The kitsune makes one claw attack.",
      "cost": 1
    },
    {
      "name": "Cast Spell (Costs 2 Actions)",
      "description": "The kitsune casts a spell from its innate spellcasting ability.",
      "cost": 2
    }
  ]
}`,
      description: 'Japanese yokai with magical abilities'
    }
  ]
};

export function buildStatBlockPrompt(context: {
  lore: string;
}): string {
  return STATBLOCK_PROMPT.template.replace(/\{\{lore\}\}/g, context.lore);
} 