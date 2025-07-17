import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

// Sample data that matches the real generation structure
const realGenerationMonster = {
  name: 'Qilin',
  region: 'China',
  tags: ['celestial', 'benevolent', 'mythical'],
  lore: {
    Creature: {
      Name: 'Chinese Dragon',
      Description: {
        PhysicalAppearance: 'The Chinese Dragon, also known as \'Long\', is a serpentine creature with a body of shimmering scales, a set of majestic antlers, sharp claws, and piercing eyes that glow with ancient wisdom. They are often depicted with a mane of white or golden clouds and are known to be of enormous size, capable of enveloping the sky and sea. Their color varies, with the most revered being the golden dragon, symbolizing power and majesty.',
        Behavior: 'Unlike their western counterparts, Chinese Dragons are benevolent and wise, often associated with water bodies, controlling the rain, floods, and hurricanes. They are considered as symbols of great luck, power, and imperial authority.'
      },
      CulturalSignificance: {
        Symbolism: 'In Chinese culture, the dragon is a symbol of power, strength, and good luck. Emperors used it as a symbol of their imperial power and dignity. It is also associated with the natural elements, particularly water and wood, and is considered a guardian of the Eastern direction.',
        Festivals: 'The dragon dance, a traditional dance and performance in Chinese culture, is a highlight of Chinese New Year celebrations and other significant events, demonstrating the dragon\'s cultural importance.'
      },
      NotableAbilities: {
        Powers: 'Chinese Dragons are believed to possess a wide array of magical abilities. They can control the weather, specifically rain, and are known to be shape-shifters. They can shrink to the size of a silkworm or expand to fill the entire space between Heaven and Earth.',
        Wisdom: 'In addition to their magical powers, Chinese Dragons are revered for their wisdom. They are believed to be highly intelligent and knowledgeable, often serving as advisors to gods and emperors in myths and legends.'
      },
      HistoricalContext: {
        AncientBeliefs: 'Dragons have a central role in Chinese mythology from as early as 5,000 BC. Artifacts from the Hongshan culture show dragon figurines used in shamanic rituals. Emperors of ancient China were identified as the sons of dragons, solidifying the dragon\'s status as a symbol of imperial power.',
        ModernUse: 'Today, the dragon continues to be a popular symbol in China, used in festivals, art, and literature. It is also represented in the Chinese zodiac, where people born in the year of the dragon are believed to inherit some of the dragon\'s strength, wisdom, and luck.'
      }
    }
  },
  statblock: {
    Creature: {
      Name: 'Chinese Dragon',
      Size: 'Gargantuan',
      Type: 'Dragon',
      Alignment: 'Neutral Good',
      AC: 22,
      HP: 350,
      Speed: { Walk: 40, Fly: 80, Swim: 60 },
      AbilityScores: { STR: 28, DEX: 10, CON: 26, INT: 24, WIS: 22, CHA: 26 },
      SavingThrows: { DEX: 7, CON: 14, WIS: 12, CHA: 14 },
      Skills: { Perception: 13, Insight: 13, Arcana: 13 },
      DamageResistances: 'Bludgeoning, Piercing, and Slashing from Nonmagical Attacks',
      ConditionImmunities: 'Frightened, Paralyzed',
      Senses: { Blindsight: 60, Darkvision: 120, PassivePerception: 23 },
      Languages: 'Common, Draconic, Celestial',
      ChallengeRating: 22,
      Traits: [
        {
          name: 'Legendary Resistance',
          description: 'If the dragon fails a saving throw, it can choose to succeed instead.'
        },
        {
          name: 'Amphibious',
          description: 'The dragon can breathe air and water.'
        },
        {
          name: 'Shapechanger',
          description: 'The dragon can use its action to polymorph into a humanoid or back into its true form. Its statistics, other than its size, are the same in each form.'
        }
      ],
      Actions: [
        {
          name: 'Multiattack',
          description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
        },
        {
          name: 'Bite',
          description: 'Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.'
        },
        {
          name: 'Claw',
          description: 'Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage.'
        },
        {
          name: 'Tail',
          description: 'Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage.'
        }
      ],
      LegendaryActions: [
        {
          name: 'Detect',
          description: 'The dragon makes a Wisdom (Perception) check.'
        },
        {
          name: 'Tail Attack',
          description: 'The dragon makes a tail attack.'
        },
        {
          name: 'Wing Attack',
          description: 'The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone.'
        }
      ]
    }
  }
};

console.log('Testing Homebrewery markup generation with real generation data structure...\n');

try {
  const markup = generateHomebreweryMarkup(realGenerationMonster, {
    includeLore: true,
    includeCitations: false,
    includeArtPrompt: false,
    frameType: 'monster,frame'
  });

  console.log('✅ Successfully generated Homebrewery markup:');
  console.log('='.repeat(80));
  console.log(markup);
  console.log('='.repeat(80));
  console.log(`\n📊 Markup length: ${markup.length} characters`);
  
} catch (error) {
  console.error('❌ Error generating Homebrewery markup:', error);
} 