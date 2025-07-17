import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Monster Stat Block Templates
 * 
 * These templates provide consistent structure and formatting for different types of monsters.
 * Each template includes default values and structure that can be customized.
 */

export interface StatBlockTemplate {
  name: string;
  description: string;
  category: string;
  template: {
    armorClass: number;
    armorType?: string;
    hitPoints: number;
    hitDice?: string;
    speed: {
      walk: number;
      fly?: number;
      swim?: number;
      climb?: number;
      burrow?: number;
    };
    abilityScores: {
      str: number;
      dex: number;
      con: number;
      int: number;
      wis: number;
      cha: number;
    };
    savingThrows?: {
      str?: number;
      dex?: number;
      con?: number;
      int?: number;
      wis?: number;
      cha?: number;
    };
    skills?: {
      [key: string]: number;
    };
    damageResistances?: string;
    damageImmunities?: string;
    conditionImmunities?: string;
    senses: {
      darkvision?: number;
      blindsight?: number;
      tremorsense?: number;
      truesight?: number;
      passivePerception: number;
    };
    languages: string[];
    challengeRating: number;
    experiencePoints: number;
    traits?: Array<{
      name: string;
      description: string;
    }>;
    actions?: Array<{
      name: string;
      description: string;
    }>;
    legendaryActions?: Array<{
      name: string;
      description: string;
    }>;
    lairActions?: Array<{
      name: string;
      description: string;
    }>;
  };
}

/**
 * Basic Humanoid Template
 * Suitable for humanoid creatures like bandits, guards, cultists
 */
export const HUMANOID_TEMPLATE: StatBlockTemplate = {
  name: 'Humanoid',
  description: 'Basic template for humanoid creatures',
  category: 'humanoid',
  template: {
    armorClass: 12,
    armorType: 'leather armor',
    hitPoints: 16,
    hitDice: '3d8 + 3',
    speed: {
      walk: 30
    },
    abilityScores: {
      str: 12,
      dex: 14,
      con: 12,
      int: 10,
      wis: 10,
      cha: 10
    },
    skills: {
      perception: 2,
      stealth: 4
    },
    senses: {
      passivePerception: 12
    },
    languages: ['Common'],
    challengeRating: 1,
    experiencePoints: 200,
    actions: [
      {
        name: 'Shortsword',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
      },
      {
        name: 'Light Crossbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d8 + 1) piercing damage.'
      }
    ]
  }
};

/**
 * Dragon Template
 * Suitable for dragons and dragon-like creatures
 */
export const DRAGON_TEMPLATE: StatBlockTemplate = {
  name: 'Dragon',
  description: 'Template for dragon and dragon-like creatures',
  category: 'dragon',
  template: {
    armorClass: 18,
    armorType: 'natural armor',
    hitPoints: 120,
    hitDice: '16d10 + 32',
    speed: {
      walk: 40,
      fly: 80
    },
    abilityScores: {
      str: 20,
      dex: 14,
      con: 18,
      int: 16,
      wis: 15,
      cha: 18
    },
    savingThrows: {
      str: 8,
      con: 7,
      wis: 6
    },
    skills: {
      perception: 8,
      stealth: 6
    },
    damageResistances: 'fire, lightning',
    damageImmunities: 'cold',
    conditionImmunities: 'frightened',
    senses: {
      darkvision: 120,
      blindsight: 60,
      passivePerception: 18
    },
    languages: ['Common', 'Draconic'],
    challengeRating: 12,
    experiencePoints: 8400,
    traits: [
      {
        name: 'Legendary Resistance',
        description: 'If the dragon fails a saving throw, it can choose to succeed instead.'
      },
      {
        name: 'Fire Breath',
        description: 'The dragon can exhale fire in a 60-foot cone. Each creature in that area must make a DC 18 Dexterity saving throw.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
      },
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) piercing damage plus 7 (2d6) fire damage.'
      },
      {
        name: 'Claw',
        description: 'Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage.'
      }
    ],
    legendaryActions: [
      {
        name: 'Detect',
        description: 'The dragon makes a Wisdom (Perception) check.'
      },
      {
        name: 'Tail Attack',
        description: 'Melee Weapon Attack: +8 to hit, reach 15 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage.'
      }
    ]
  }
};

/**
 * Undead Template
 * Suitable for undead creatures like skeletons, zombies, ghosts
 */
export const UNDEAD_TEMPLATE: StatBlockTemplate = {
  name: 'Undead',
  description: 'Template for undead creatures',
  category: 'undead',
  template: {
    armorClass: 13,
    armorType: 'natural armor',
    hitPoints: 22,
    hitDice: '5d8',
    speed: {
      walk: 30
    },
    abilityScores: {
      str: 10,
      dex: 14,
      con: 15,
      int: 6,
      wis: 8,
      cha: 5
    },
    damageResistances: 'necrotic',
    damageImmunities: 'poison',
    conditionImmunities: 'poisoned',
    senses: {
      darkvision: 60,
      passivePerception: 9
    },
    languages: ['understands all languages it knew in life but can\'t speak'],
    challengeRating: 1,
    experiencePoints: 200,
    traits: [
      {
        name: 'Undead Fortitude',
        description: 'If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.'
      }
    ],
    actions: [
      {
        name: 'Slam',
        description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.'
      }
    ]
  }
};

/**
 * Beast Template
 * Suitable for animals and natural creatures
 */
export const BEAST_TEMPLATE: StatBlockTemplate = {
  name: 'Beast',
  description: 'Template for beasts and natural creatures',
  category: 'beast',
  template: {
    armorClass: 14,
    armorType: 'natural armor',
    hitPoints: 19,
    hitDice: '3d10 + 3',
    speed: {
      walk: 40,
      climb: 30
    },
    abilityScores: {
      str: 16,
      dex: 14,
      con: 14,
      int: 2,
      wis: 12,
      cha: 6
    },
    skills: {
      perception: 3,
      stealth: 4
    },
    senses: {
      darkvision: 60,
      passivePerception: 13
    },
    languages: ['—'],
    challengeRating: 1,
    experiencePoints: 200,
    traits: [
      {
        name: 'Keen Smell',
        description: 'The beast has advantage on Wisdom (Perception) checks that rely on smell.'
      }
    ],
    actions: [
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage.'
      },
      {
        name: 'Claw',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage.'
      }
    ]
  }
};

/**
 * Construct Template
 * Suitable for golems, animated objects, and magical constructs
 */
export const CONSTRUCT_TEMPLATE: StatBlockTemplate = {
  name: 'Construct',
  description: 'Template for constructs and magical creations',
  category: 'construct',
  template: {
    armorClass: 17,
    armorType: 'natural armor',
    hitPoints: 93,
    hitDice: '11d10 + 33',
    speed: {
      walk: 30
    },
    abilityScores: {
      str: 19,
      dex: 9,
      con: 18,
      int: 6,
      wis: 10,
      cha: 7
    },
    damageResistances: 'acid, fire, lightning, thunder; bludgeoning, piercing, and slashing from nonmagical attacks',
    damageImmunities: 'poison, psychic',
    conditionImmunities: 'charmed, exhaustion, frightened, paralyzed, petrified, poisoned',
    senses: {
      darkvision: 120,
      passivePerception: 10
    },
    languages: ['understands the languages of its creator but can\'t speak'],
    challengeRating: 9,
    experiencePoints: 5000,
    traits: [
      {
        name: 'Immutable Form',
        description: 'The golem is immune to any spell or effect that would alter its form.'
      },
      {
        name: 'Magic Resistance',
        description: 'The golem has advantage on saving throws against spells and other magical effects.'
      },
      {
        name: 'Magic Weapons',
        description: 'The golem\'s weapon attacks are magical.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The golem makes two slam attacks.'
      },
      {
        name: 'Slam',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage.'
      }
    ]
  }
};

/**
 * Fiend Template
 * Suitable for demons, devils, and other evil outsiders
 */
export const FIEND_TEMPLATE: StatBlockTemplate = {
  name: 'Fiend',
  description: 'Template for fiends and evil outsiders',
  category: 'fiend',
  template: {
    armorClass: 15,
    armorType: 'natural armor',
    hitPoints: 66,
    hitDice: '12d8 + 12',
    speed: {
      walk: 30,
      fly: 60
    },
    abilityScores: {
      str: 16,
      dex: 15,
      con: 12,
      int: 13,
      wis: 11,
      cha: 15
    },
    savingThrows: {
      dex: 5,
      wis: 3
    },
    skills: {
      deception: 5,
      insight: 3,
      perception: 3,
      persuasion: 5
    },
    damageResistances: 'cold, fire, lightning, poison; bludgeoning, piercing, and slashing from nonmagical attacks',
    damageImmunities: 'poison',
    conditionImmunities: 'poisoned',
    senses: {
      darkvision: 120,
      passivePerception: 13
    },
    languages: ['Infernal', 'telepathy 60 ft.'],
    challengeRating: 6,
    experiencePoints: 2300,
    traits: [
      {
        name: 'Devil\'s Sight',
        description: 'Magical darkness doesn\'t impede the fiend\'s darkvision.'
      },
      {
        name: 'Magic Resistance',
        description: 'The fiend has advantage on saving throws against spells and other magical effects.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The fiend makes two attacks: one with its claws and one with its bite.'
      },
      {
        name: 'Claws',
        description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) slashing damage.'
      },
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d6 + 4) piercing damage plus 7 (2d6) fire damage.'
      }
    ]
  }
};

/**
 * Celestial Template
 * Suitable for angels, divine beings, and good outsiders
 */
export const CELESTIAL_TEMPLATE: StatBlockTemplate = {
  name: 'Celestial',
  description: 'Template for celestials and divine beings',
  category: 'celestial',
  template: {
    armorClass: 16,
    armorType: 'natural armor',
    hitPoints: 90,
    hitDice: '12d8 + 36',
    speed: {
      walk: 30,
      fly: 60
    },
    abilityScores: {
      str: 18,
      dex: 16,
      con: 16,
      int: 14,
      wis: 18,
      cha: 20
    },
    savingThrows: {
      wis: 7,
      cha: 8
    },
    skills: {
      insight: 7,
      perception: 7,
      persuasion: 8
    },
    damageResistances: 'radiant; bludgeoning, piercing, and slashing from nonmagical attacks',
    damageImmunities: 'necrotic, poison',
    conditionImmunities: 'charmed, exhaustion, frightened, poisoned',
    senses: {
      darkvision: 120,
      truesight: 120,
      passivePerception: 17
    },
    languages: ['all', 'telepathy 120 ft.'],
    challengeRating: 8,
    experiencePoints: 3900,
    traits: [
      {
        name: 'Angelic Weapons',
        description: 'The celestial\'s weapon attacks are magical. When the celestial hits with any weapon, the weapon deals an extra 4d8 radiant damage (included in the attack).'
      },
      {
        name: 'Divine Awareness',
        description: 'The celestial knows if it hears a lie.'
      },
      {
        name: 'Innate Spellcasting',
        description: 'The celestial\'s spellcasting ability is Charisma (spell save DC 16). It can innately cast the following spells, requiring no material components: At will: detect evil and good, invisibility (self only) 3/day each: blade barrier, dispel evil and good, flame strike, raise dead 1/day each: commune, control weather, insect plague'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The celestial makes two melee attacks.'
      },
      {
        name: 'Radiant Sword',
        description: 'Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) slashing damage plus 18 (4d8) radiant damage.'
      }
    ]
  }
};

/**
 * Get all available templates
 */
export function getAllTemplates(): StatBlockTemplate[] {
  return [
    HUMANOID_TEMPLATE,
    DRAGON_TEMPLATE,
    UNDEAD_TEMPLATE,
    BEAST_TEMPLATE,
    CONSTRUCT_TEMPLATE,
    FIEND_TEMPLATE,
    CELESTIAL_TEMPLATE
  ];
}

/**
 * Get template by category
 */
export function getTemplateByCategory(category: string): StatBlockTemplate | undefined {
  return getAllTemplates().find(template => template.category === category);
}

/**
 * Get template by name
 */
export function getTemplateByName(name: string): StatBlockTemplate | undefined {
  return getAllTemplates().find(template => template.name.toLowerCase() === name.toLowerCase());
}

/**
 * Apply template to monster data
 */
export function applyTemplate(monsterData: any, template: StatBlockTemplate): any {
  return {
    ...monsterData,
    statblock: {
      ...template.template,
      ...monsterData.statblock // Override template with any existing statblock data
    }
  };
}

/**
 * Create a new monster from template
 */
export function createMonsterFromTemplate(
  name: string,
  region: string,
  template: StatBlockTemplate,
  customizations: Partial<StatBlockTemplate['template']> = {}
): any {
  return {
    name,
    region,
    tags: [template.category],
    lore: {
      content: `A ${template.name.toLowerCase()} from ${region}.`,
      format: 'plain',
      metadata: {
        word_count: 10,
        language: 'en',
        version: '1.0',
        generated_by: 'template'
      }
    },
    statblock: {
      ...template.template,
      ...customizations
    }
  };
} 