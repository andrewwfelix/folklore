#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateHomebreweryMarkup } from '../lib/utils/homebrewery-export';

// Sample monster data
const sampleMonster = {
  name: 'Test Dragon',
  region: 'Test Mountains',
  tags: ['dragon', 'fire', 'legendary'],
  lore: {
    content: 'A magnificent dragon that dwells in the test mountains. Its scales shimmer with ancient magic and its breath can melt stone.',
    format: 'plain',
    metadata: {
      word_count: 25,
      language: 'en',
      version: '1.0',
      generated_by: 'test_script'
    }
  },
  statblock: {
    armorClass: 18,
    armorType: 'natural armor',
    hitPoints: 120,
    hitDice: '16d10 + 32',
    speed: { walk: 40, fly: 80 },
    abilityScores: {
      str: 20,
      dex: 14,
      con: 18,
      int: 16,
      wis: 15,
      cha: 18
    },
    savingThrows: { str: 8, con: 7, wis: 6 },
    skills: { perception: 8, stealth: 6 },
    damageResistances: 'fire, lightning',
    damageImmunities: 'cold',
    conditionImmunities: 'frightened',
    senses: { darkvision: 120, blindsight: 60, passivePerception: 18 },
    languages: ['Common', 'Draconic', 'Infernal'],
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

function testFrameTypes() {
  console.log('🏠 Testing Homebrewery Frame Types');
  console.log('===================================\n');

  const frameTypes = ['monster', 'monster,frame', 'monster,frame,wide'];

  frameTypes.forEach((frameType, index) => {
    console.log(`🧪 Test ${index + 1}: ${frameType.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    try {
      const markup = generateHomebreweryMarkup(sampleMonster, {
        includeLore: false,
        includeCitations: false,
        includeArtPrompt: false,
        frameType: frameType as 'monster' | 'monster,frame' | 'monster,frame,wide'
      });
      
      console.log('✅ Markup generated successfully');
      console.log('📋 Generated Markup:');
      console.log('```');
      console.log(markup);
      console.log('```');
      console.log('');
      
    } catch (error) {
      console.error('❌ Error generating markup:', (error as Error).message);
    }
  });

  console.log('🎉 All frame type tests completed!');
}

// Run the test
if (require.main === module) {
  testFrameTypes();
}

export { testFrameTypes }; 