#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

// Test with the actual monster data from the generation
const testMonster = {
  name: "Greater Kitsune",
  region: "Japan",
  lore: "A mystical fox spirit with nine tails, known for its shapeshifting abilities and connection to elemental magic.",
  statblock: {
    name: 'Greater Kitsune',
    size: 'Medium',
    type: 'Fey',
    alignment: 'Neutral Good',
    armor_class: 17,
    hit_points: 120,
    hit_dice: '16d8',
    speed: { walk: 40, fly: 60 },
    ability_scores: {
      strength: 10,
      dexterity: 20,
      constitution: 14,
      intelligence: 18,
      wisdom: 16,
      charisma: 22
    },
    saving_throws: { dexterity: 9, intelligence: 8, wisdom: 7, charisma: 10 },
    skills: { arcana: 8, deception: 10, insight: 7, perception: 7, stealth: 9 },
    damage_resistances: 'bludgeoning, piercing, and slashing from nonmagical attacks',
    condition_immunities: 'charmed, frightened',
    senses: { passive_perception: 17 },
    languages: 'Common, Sylvan',
    challenge_rating: 10,
    xp: 5900,
    special_abilities: [
      {
        name: 'Shapechanger',
        description: "The kitsune can use its action to polymorph into a specific Medium humanoid, or back into its true form. Its statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        name: 'Nine-Tailed Clone',
        description: "As a bonus action, the kitsune can create up to nine duplicates of itself. Each duplicate has the kitsune's statistics and can take actions and reactions on its own. A duplicate disappears when it drops to 0 hit points."
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The kitsune makes two attacks with its claws or uses its Elemental Control twice.'
      },
      {
        name: 'Claw',
        description: 'Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.'
      },
      {
        name: 'Elemental Control',
        description: 'The kitsune chooses one of the following damage types: acid, cold, fire, lightning, or thunder. Each creature in a 20-foot-radius sphere centered on a point the kitsune can see within 120 feet of it must make a DC 16 Dexterity saving throw. The sphere spreads around corners. A creature takes 22 (4d10) damage of the chosen type on a failed save, or half as much damage on a successful one.'
      }
    ]
  },
  citations: [
    {
      title: "The Fox and the Jewel: Shared and Private Meanings in Contemporary Japanese Inari Worship",
      url: "https://books.google.com/books?id=6F8ZD0dpFqIC",
      source: "Academic",
      relevance: "This book provides a detailed study of the worship of Inari, the Shinto god associated with Kitsune in Japanese mythology."
    }
  ],
  art: {
    prompt: "A majestic nine-tailed fox spirit with ethereal beauty, surrounded by wisps of elemental energy"
  }
};

async function main() {
  console.log('🧪 Testing Homebrewery Export Fix');
  console.log('==================================\n');

  try {
    console.log('📝 Generating Homebrewery markup...');
    const markup = generateHomebreweryMarkup(testMonster, {
      includeLore: true,
      includeCitations: true,
      includeArtPrompt: true,
      frameType: 'monster,frame'
    });

    console.log('✅ Homebrewery markup generated successfully!');
    console.log('\n📄 Generated Markup:');
    console.log('====================');
    console.log(markup);
    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error generating Homebrewery markup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 