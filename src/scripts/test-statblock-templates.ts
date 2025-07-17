#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { 
  getAllTemplates, 
  getTemplateByCategory, 
  getTemplateByName,
  applyTemplate,
  createMonsterFromTemplate,
  HUMANOID_TEMPLATE,
  DRAGON_TEMPLATE,
  UNDEAD_TEMPLATE
} from '../templates/statblock-templates';
import { generateMonsterMarkup } from '../lib/utils/monster-markup';
import { generateHomebreweryMarkup, generateHomebreweryCollection } from '../lib/utils/homebrewery-export';

async function testStatBlockTemplates() {
  console.log('🧪 Testing Stat Block Templates');
  console.log('================================\n');

  try {
    // Test 1: List all available templates
    console.log('📋 Available Templates:');
    const templates = getAllTemplates();
    templates.forEach(template => {
      console.log(`   • ${template.name} (${template.category}) - ${template.description}`);
    });
    console.log('');

    // Test 2: Get template by category
    console.log('🔍 Getting Dragon Template:');
    const dragonTemplate = getTemplateByCategory('dragon');
    if (dragonTemplate) {
      console.log(`   ✅ Found: ${dragonTemplate.name}`);
      console.log(`   📊 Challenge Rating: ${dragonTemplate.template.challengeRating}`);
      console.log(`   🛡️  Armor Class: ${dragonTemplate.template.armorClass}`);
    }
    console.log('');

    // Test 3: Get template by name
    console.log('🔍 Getting Undead Template by Name:');
    const undeadTemplate = getTemplateByName('undead');
    if (undeadTemplate) {
      console.log(`   ✅ Found: ${undeadTemplate.name}`);
      console.log(`   💀 Damage Immunities: ${undeadTemplate.template.damageImmunities}`);
    }
    console.log('');

    // Test 4: Create a monster from template
    console.log('🎭 Creating Monster from Humanoid Template:');
    const bandit = createMonsterFromTemplate(
      'Mountain Bandit',
      'Frostpeak Mountains',
      HUMANOID_TEMPLATE,
      {
        armorClass: 13,
        armorType: 'studded leather',
        hitPoints: 22,
        hitDice: '5d8',
        speed: { walk: 30 },
        abilityScores: {
          str: 14,
          dex: 16,
          con: 12,
          int: 10,
          wis: 10,
          cha: 10
        },
        skills: {
          perception: 2,
          stealth: 5,
          survival: 2
        },
        senses: {
          passivePerception: 12
        },
        languages: ['Common'],
        challengeRating: 1,
        experiencePoints: 200,
        actions: [
          {
            name: 'Scimitar',
            description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'
          },
          {
            name: 'Light Crossbow',
            description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d8 + 1) piercing damage.'
          }
        ]
      }
    );

    console.log('   ✅ Created Mountain Bandit');
    console.log(`   📍 Region: ${bandit.region}`);
    console.log(`   🏷️  Tags: ${bandit.tags.join(', ')}`);
    console.log(`   ⚔️  Actions: ${bandit.statblock.actions?.length || 0}`);
    console.log('');

    // Test 5: Apply template to existing monster data
    console.log('🔧 Applying Dragon Template to Existing Monster:');
    const existingMonster = {
      name: 'Ancient Frost Wyrm',
      region: 'Frozen Wastes',
      tags: ['dragon', 'cold', 'ancient'],
      lore: {
        content: 'An ancient dragon that has adapted to the frozen wastes.',
        format: 'plain',
        metadata: {
          word_count: 10,
          language: 'en',
          version: '1.0',
          generated_by: 'test'
        }
      },
      statblock: {
        // Only partial statblock data
        armorClass: 20,
        hitPoints: 150,
        challengeRating: 15
      }
    };

    const enhancedMonster = applyTemplate(existingMonster, DRAGON_TEMPLATE);
    console.log('   ✅ Applied Dragon Template');
    console.log(`   🛡️  Armor Class: ${enhancedMonster.statblock.armorClass} (was ${existingMonster.statblock.armorClass})`);
    console.log(`   ❄️  Damage Immunities: ${enhancedMonster.statblock.damageImmunities}`);
    console.log(`   🐉 Languages: ${enhancedMonster.statblock.languages.join(', ')}`);
    console.log('');

    // Test 6: Generate markup from template-based monster
    console.log('📝 Generating Markup from Template Monster:');
    const markup = generateMonsterMarkup(bandit);
    console.log('   ✅ Markup generated successfully');
    console.log(`   📄 Markup length: ${markup.length} characters`);
    console.log('');

    // Test 7: Export to Homebrewery
    console.log('🏠 Exporting to Homebrewery:');
    const homebreweryExport = generateHomebreweryMarkup(bandit, {
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false
    });
    console.log('   ✅ Homebrewery export generated');
    console.log(`   📄 Export length: ${homebreweryExport.length} characters`);
    console.log('');

    // Test 8: Create multiple monsters from different templates
    console.log('🎲 Creating Multiple Monsters from Templates:');
    
    const monsters = [
      createMonsterFromTemplate('Forest Guardian', 'Mystic Woods', HUMANOID_TEMPLATE, {
        armorClass: 15,
        armorType: 'leather armor',
        hitPoints: 27,
        hitDice: '5d8 + 5',
        abilityScores: {
          str: 14,
          dex: 16,
          con: 12,
          int: 10,
          wis: 16,
          cha: 12
        },
        skills: {
          perception: 5,
          stealth: 6,
          survival: 4
        },
        languages: ['Common', 'Elvish', 'Sylvan'],
        challengeRating: 2,
        experiencePoints: 450
      }),
      
      createMonsterFromTemplate('Shadow Wraith', 'Haunted Crypts', UNDEAD_TEMPLATE, {
        armorClass: 14,
        armorType: 'natural armor',
        hitPoints: 45,
        hitDice: '10d8',
        speed: { walk: 30, fly: 60 },
        abilityScores: {
          str: 6,
          dex: 18,
          con: 15,
          int: 10,
          wis: 12,
          cha: 8
        },
        damageResistances: 'acid, cold, fire, lightning, thunder; bludgeoning, piercing, and slashing from nonmagical attacks',
        damageImmunities: 'necrotic, poison',
        conditionImmunities: 'exhaustion, grappled, paralyzed, petrified, poisoned, prone, restrained',
        senses: {
          darkvision: 120,
          passivePerception: 11
        },
        languages: ['understands all languages it knew in life but can\'t speak'],
        challengeRating: 5,
        experiencePoints: 1800
      })
    ];

    console.log(`   ✅ Created ${monsters.length} monsters:`);
    monsters.forEach((monster, index) => {
      console.log(`      ${index + 1}. ${monster.name} (${monster.statblock.challengeRating} CR)`);
    });
    console.log('');

    // Test 9: Export collection to Homebrewery
    console.log('📚 Exporting Monster Collection:');
    const collectionExport = generateHomebreweryCollection(
      monsters,
      'Template-Generated Monsters',
      {
        includeLore: true,
        includeCitations: false,
        includeArtPrompt: false
      }
    );
    console.log('   ✅ Collection export generated');
    console.log(`   📄 Export length: ${collectionExport.length} characters`);

    console.log('\n🎉 All template tests completed successfully!');
    return {
      success: true,
      templatesCount: templates.length,
      monstersCreated: monsters.length + 1 // +1 for the bandit
    };

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testStatBlockTemplates().catch(console.error);
}

export { testStatBlockTemplates }; 