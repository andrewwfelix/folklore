#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PDFAgent } from '../agents/PDFAgent';

async function testPDFAgent() {
  console.log('📄 Testing PDFAgent');
  console.log('==================\n');

  try {
    // Use comprehensive sample input for testing PDF layout generation
    const testInput = {
      name: 'Kitsune-no-Mori',
      region: 'Japan',
      lore: 'A nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers. The creature takes the form of a fox with nine distinct tails, each representing a different aspect of nature\'s power. Local legends speak of travelers who encountered the Kitsune-no-Mori during twilight hours, when the boundary between the mortal realm and the spirit world grows thin.',
      statblock: {
        armorClass: 16,
        hitPoints: 110,
        speed: { walk: 40 },
        abilityScores: {
          strength: 10,
          dexterity: 18,
          constitution: 14,
          intelligence: 16,
          wisdom: 20,
          charisma: 22
        },
        savingThrows: { dexterity: 8, wisdom: 9, charisma: 10 },
        skills: { perception: 9, stealth: 8, insight: 9, persuasion: 10 },
        senses: { darkvision: 60, passivePerception: 19 },
        languages: ['Common', 'Sylvan'],
        challengeRating: 8,
        experiencePoints: 3900,
        traits: [
          {
            name: 'Shapechanger',
            description: 'The Kitsune-no-Mori can use its action to polymorph into a specific Medium humanoid, or back into its true form.'
          }
        ],
        actions: [
          {
            name: 'Claw',
            description: 'Melee Weapon Attack',
            attackBonus: 7,
            damage: { type: 'slashing', roll: '2d6', bonus: 4 },
            reach: 5,
            targets: 'one target'
          }
        ]
      },
      citations: [
        {
          title: 'Kitsune - Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Kitsune',
          source: 'Wikipedia',
          relevance: 'Comprehensive article about kitsune in Japanese folklore'
        },
        {
          title: 'Yokai: Japanese Folklore - Mythopedia',
          url: 'https://mythopedia.com/topics/yokai',
          source: 'Mythopedia',
          relevance: 'Overview of yokai creatures in Japanese mythology'
        }
      ],
      artPrompt: {
        prompt: 'Create an image of the Kitsune-no-Mori, a nine-tailed fox yokai from Japan. The fox is depicted in twilight within a sacred grove, its nine tails radiating with the diverse powers of nature.',
        style: 'Ukiyo-e',
        description: 'Ukiyo-e style captures traditional Japanese artistic traditions, while the forest setting emphasizes the Shinto spiritual context.'
      }
    };

    console.log('📝 Test Input:');
    console.log(`  Name: ${testInput.name}`);
    console.log(`  Region: ${testInput.region}`);
    console.log(`  Lore Length: ${testInput.lore.length} characters`);
    console.log(`  Stat Block: CR ${testInput.statblock.challengeRating}, HP ${testInput.statblock.hitPoints}`);
    console.log(`  Citations: ${testInput.citations.length} sources`);
    console.log(`  Art Style: ${testInput.artPrompt.style}\n`);

    // Create and run the agent
    const pdfAgent = new PDFAgent('test-pdf-agent');
    console.log('🚀 Running PDFAgent...\n');

    const result = await pdfAgent.execute(testInput);

    console.log('✅ PDFAgent Results:');
    console.log('  PDF Layout:');
    console.log('─'.repeat(50));
    console.dir(result.pdfLayout, { depth: null, colors: true });
    console.log('─'.repeat(50));

    // Validate the result
    if (!result.pdfLayout || typeof result.pdfLayout !== 'object') {
      throw new Error('No PDF layout generated');
    }
    if (!result.pdfLayout.title || !result.pdfLayout.sections) {
      throw new Error('PDF layout missing required fields (title, sections)');
    }

    console.log('\n📄 PDF Layout Summary:');
    console.log(`  Title: ${result.pdfLayout.title}`);
    console.log(`  Sections: ${result.pdfLayout.sections?.length || 0}`);
    console.log(`  Theme: ${result.pdfLayout.overallStyling?.theme || 'Not specified'}`);
    console.log('🎉 PDFAgent test passed!');
    return result;

  } catch (error) {
    console.error('❌ PDFAgent test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testPDFAgent().catch(console.error);
}

export { testPDFAgent }; 