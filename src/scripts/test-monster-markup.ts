import { generateMonsterMarkup } from '../lib/utils/monster-markup';

const sampleMonsterJson = {
  name: 'Ancient Dragon',
  region: 'Mystical Mountains',
  lore: {
    content: 'The ancient dragon dwells in the depths of the mountain, its scales shimmering with centuries of accumulated wisdom and power. Local legends speak of its ability to breathe both fire and ice, a rare trait among dragonkind.',
    format: 'plain',
    metadata: {
      word_count: 45,
      language: 'en',
      version: '1.0',
      generated_by: 'lore_agent'
    }
  },
  statblock: {
    armorClass: 15,
    armorType: 'natural armor',
    hitPoints: 45,
    hitDice: '6d10 + 12',
    speed: { walk: 30, fly: 60 },
    abilityScores: {
      str: 16,
      dex: 14,
      con: 14,
      int: 10,
      wis: 12,
      cha: 8
    },
    savingThrows: { str: 5, con: 4 },
    skills: { perception: 3, stealth: 4 },
    damageResistances: 'cold, fire, lightning',
    damageImmunities: 'poison',
    conditionImmunities: 'poisoned',
    senses: { darkvision: 60, passivePerception: 13 },
    languages: ['Common', 'Draconic'],
    challengeRating: 3,
    experiencePoints: 700,
    traits: [
      { name: 'Amphibious', description: 'The creature can breathe air and water.' },
      { name: 'Pack Tactics', description: 'The creature has advantage on attack rolls against a creature if at least one of the creature\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.' }
    ],
    actions: [
      { name: 'Multiattack', description: 'The creature makes two attacks: one with its bite and one with its claws.' },
      { name: 'Bite', description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage.' },
      { name: 'Claw', description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 4) slashing damage.' }
    ],
    legendaryActions: [
      { name: 'Detect', description: 'The creature makes a Wisdom (Perception) check.' },
      { name: 'Tail Attack', description: 'Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 7 (1d8 + 4) bludgeoning damage.' }
    ]
  }
};

// Test with legacy string format
const legacyMonsterJson = {
  name: 'Legacy Monster',
  region: 'Test Region',
  lore: 'This is a simple string lore from the old format.',
  statblock: {
    armorClass: 10,
    hitPoints: 20,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  }
};

function main() {
  console.log('=== Testing New JSONB Lore Format ===\n');
  const markup = generateMonsterMarkup(sampleMonsterJson);
  console.log(markup);
  
  console.log('\n=== Testing Legacy String Lore Format ===\n');
  const legacyMarkup = generateMonsterMarkup(legacyMonsterJson);
  console.log(legacyMarkup);
}

if (require.main === module) {
  main();
} 