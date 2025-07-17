#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateHomebreweryMarkup, generateHomebreweryCollection, generateHomebreweryStatBlock, generateHomebreweryV3StatBlock } from '../lib/utils/homebrewery-export';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Sample monster data (same as in test-monster-persistence.ts)
const sampleMonster = {
  name: 'Test Dragon',
  region: 'Test Mountains',
  tags: ['dragon', 'fire', 'legendary'],
  lore: {
    content: 'A magnificent dragon that dwells in the test mountains. Its scales shimmer with ancient magic and its breath can melt stone. This creature has been the guardian of these peaks for centuries, protecting ancient secrets and testing the worthiness of those who dare to climb its domain.',
    format: 'plain',
    metadata: {
      word_count: 45,
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
  },
  citations: [
    {
      title: 'Dragon Lore - Ancient Myths',
      url: 'https://example.com/dragon-lore',
      source: 'Ancient Myths Database',
      relevance: 'Primary source for dragon mythology'
    },
    {
      title: 'Fire Dragons in Mountain Folklore',
      url: 'https://example.com/fire-dragons',
      source: 'Folklore Studies Journal',
      relevance: 'Regional dragon variants'
    }
  ],
  art: {
    prompt: 'A majestic dragon with shimmering scales, perched on a mountain peak with fire breath visible',
    style: 'fantasy art',
    description: 'Epic fantasy illustration of a dragon guardian'
  }
};

// Second sample monster for collection testing
const sampleMonster2 = {
  name: 'Shadow Stalker',
  region: 'Dark Forest',
  tags: ['undead', 'shadow', 'stealth'],
  lore: {
    content: 'A creature born from the shadows themselves, the Shadow Stalker haunts the darkest corners of ancient forests. It moves silently between the trees, hunting those who dare to venture into its domain after sunset.',
    format: 'plain',
    metadata: {
      word_count: 35,
      language: 'en',
      version: '1.0',
      generated_by: 'test_script'
    }
  },
  statblock: {
    armorClass: 15,
    armorType: 'natural armor',
    hitPoints: 65,
    hitDice: '10d8 + 20',
    speed: { walk: 30, climb: 20 },
    abilityScores: {
      str: 14,
      dex: 18,
      con: 14,
      int: 12,
      wis: 16,
      cha: 10
    },
    savingThrows: { dex: 6, wis: 5 },
    skills: { stealth: 8, perception: 6, survival: 4 },
    damageResistances: 'necrotic',
    damageImmunities: 'poison',
    conditionImmunities: 'poisoned',
    senses: { darkvision: 120, passivePerception: 16 },
    languages: ['Common', 'Elvish'],
    challengeRating: 5,
    experiencePoints: 1800,
    traits: [
      { 
        name: 'Shadow Stealth', 
        description: 'While in dim light or darkness, the shadow stalker can take the Hide action as a bonus action.' 
      },
      { 
        name: 'Sunlight Sensitivity', 
        description: 'While in sunlight, the shadow stalker has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.' 
      }
    ],
    actions: [
      { 
        name: 'Shadow Claw', 
        description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) slashing damage plus 7 (2d6) necrotic damage.' 
      },
      { 
        name: 'Shadow Step', 
        description: 'The shadow stalker can teleport up to 30 feet to an unoccupied space it can see that is also in dim light or darkness.' 
      }
    ]
  },
  citations: [
    {
      title: 'Shadow Creatures in Folklore',
      url: 'https://example.com/shadow-creatures',
      source: 'Dark Tales Archive',
      relevance: 'Shadow entity mythology'
    }
  ],
  art: {
    prompt: 'A shadowy figure lurking between dark trees, barely visible in the moonlight',
    style: 'dark fantasy',
    description: 'Mysterious shadow creature in forest setting'
  }
};

async function testHomebreweryExport() {
  console.log('🏠 Testing Homebrewery Export');
  console.log('==============================\n');

  try {
    // Test 1: Generate basic Homebrewery markup
    console.log('🧪 Test 1: Generate basic Homebrewery markup');
    const basicMarkup = generateHomebreweryMarkup(sampleMonster);
    console.log('✅ Basic markup generated successfully');
    
    // Save to file
    const basicFilePath = join(process.cwd(), 'test-output-homebrewery-basic.md');
    writeFileSync(basicFilePath, basicMarkup, 'utf8');
    console.log(`📄 Saved to: ${basicFilePath}\n`);

    // Test 2: Generate markup with all sections
    console.log('🧪 Test 2: Generate markup with all sections');
    const fullMarkup = generateHomebreweryMarkup(sampleMonster, {
      includeLore: true,
      includeCitations: true,
      includeArtPrompt: true
    });
    console.log('✅ Full markup generated successfully');
    
    const fullFilePath = join(process.cwd(), 'test-output-homebrewery-full.md');
    writeFileSync(fullFilePath, fullMarkup, 'utf8');
    console.log(`📄 Saved to: ${fullFilePath}\n`);

    // Test 3: Generate stat block only
    console.log('🧪 Test 3: Generate stat block only');
    const statBlockMarkup = generateHomebreweryStatBlock(sampleMonster);
    console.log('✅ Stat block markup generated successfully');
    
    const statBlockFilePath = join(process.cwd(), 'test-output-homebrewery-statblock.md');
    writeFileSync(statBlockFilePath, statBlockMarkup, 'utf8');
    console.log(`📄 Saved to: ${statBlockFilePath}\n`);

    // Test 4: Generate collection with multiple monsters
    console.log('🧪 Test 4: Generate collection with multiple monsters');
    const collectionMarkup = generateHomebreweryCollection(
      [sampleMonster, sampleMonster2],
      'Folklore Monsters: Test Collection',
      {
        includeLore: true,
        includeCitations: true,
        includeArtPrompt: false
      }
    );
    console.log('✅ Collection markup generated successfully');
    
    const collectionFilePath = join(process.cwd(), 'test-output-homebrewery-collection.md');
    writeFileSync(collectionFilePath, collectionMarkup, 'utf8');
    console.log(`📄 Saved to: ${collectionFilePath}\n`);

    // Test 5: Generate with custom styling
    console.log('🧪 Test 5: Generate with custom styling');
    const styledMarkup = generateHomebreweryMarkup(sampleMonster, {
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false,
      customStyling: {
        backgroundColor: '#f5f5dc', // Beige background
        textColor: '#2c1810', // Dark brown text
        accentColor: '#8b4513' // Saddle brown accents
      }
    });
    console.log('✅ Styled markup generated successfully');
    
    const styledFilePath = join(process.cwd(), 'test-output-homebrewery-styled.md');
    writeFileSync(styledFilePath, styledMarkup, 'utf8');
    console.log(`📄 Saved to: ${styledFilePath}\n`);

    // Test 6: Generate V3-style stat block
    console.log('🧪 Test 6: Generate V3-style stat block');
    const v3Markup = generateHomebreweryV3StatBlock(sampleMonster);
    console.log('✅ V3 stat block generated successfully');
    
    const v3FilePath = join(process.cwd(), 'test-output-homebrewery-v3.md');
    writeFileSync(v3FilePath, v3Markup, 'utf8');
    console.log(`📄 Saved to: ${v3FilePath}\n`);

    console.log('🎉 All Homebrewery export tests completed successfully!');
    console.log('\n📋 Generated Files:');
    console.log(`   • ${basicFilePath} - Basic monster export`);
    console.log(`   • ${fullFilePath} - Full monster with all sections`);
    console.log(`   • ${statBlockFilePath} - Stat block only`);
    console.log(`   • ${collectionFilePath} - Collection of multiple monsters`);
    console.log(`   • ${styledFilePath} - Monster with custom styling`);
    console.log(`   • ${v3FilePath} - V3-style stat block`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Copy the content from any of the generated .md files');
    console.log('   2. Go to https://homebrewery.naturalcrit.com/');
    console.log('   3. Paste the content into the editor');
    console.log('   4. Click "Save" to create your homebrew document');
    console.log('   5. Use "Print/Generate PDF" to create a PDF version');

    return {
      success: true,
      files: [
        basicFilePath,
        fullFilePath,
        statBlockFilePath,
        collectionFilePath,
        styledFilePath,
        v3FilePath
      ]
    };

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testHomebreweryExport().catch(console.error);
}

export { testHomebreweryExport }; 