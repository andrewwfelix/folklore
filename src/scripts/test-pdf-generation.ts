#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generatePDF, generateSimplePDF } from '../lib/utils/pdf-generator';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function testPDFGeneration() {
  console.log('📄 Testing PDF Generation');
  console.log('==========================\n');

  try {
    // Test 1: Generate PDF from layout specification
    console.log('🧪 Test 1: Generate PDF from layout specification');
    
    const testLayout = {
      title: 'Kitsune-no-Mori',
      sections: [
        {
          name: 'Lore',
          content: 'A nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers. The creature takes the form of a fox with nine distinct tails, each representing a different aspect of nature\'s power.',
          styling: {
            font: 'Times-Roman',
            size: '12pt',
            alignment: 'justify' as 'justify'
          }
        },
        {
          name: 'Stat Block',
          content: JSON.stringify({
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
            challengeRating: 8
          }, null, 2),
          styling: {
            font: 'Courier',
            size: '10pt',
            alignment: 'left' as 'left'
          }
        },
        {
          name: 'Citations',
          content: '1. Kitsune - Wikipedia\n   https://en.wikipedia.org/wiki/Kitsune\n\n2. Yokai: Japanese Folklore - Mythopedia\n   https://mythopedia.com/topics/yokai',
          styling: {
            font: 'Helvetica',
            size: '10pt',
            alignment: 'left' as 'left'
          }
        }
      ],
      overallStyling: {
        theme: 'japanese_traditional',
        margins: '1 inch all sides',
        pageSize: 'A4'
      }
    };

    const pdfBuffer1 = await generatePDF(testLayout);
    const outputPath1 = join(__dirname, '../../test-output-layout.pdf');
    writeFileSync(outputPath1, pdfBuffer1);
    console.log(`✅ Layout PDF generated: ${outputPath1}`);

    // Test 2: Generate simple PDF from monster data
    console.log('\n🧪 Test 2: Generate simple PDF from monster data');
    
    const testMonsterData = {
      name: 'Temberendak',
      lore: 'Bearer of the name "Temberendak", this elusive entity is a product of the rich folklore of the Malay Peninsula, a living testament to the whispers of the jungle. The creature appears as a majestic bird, with plumage the color of emerald, adorned with sapphire-like eyes that are believed to pierce the very soul.',
      statblock: {
        armorClass: 16,
        hitPoints: 85,
        speed: { walk: 10, fly: 60 },
        abilityScores: {
          strength: 10,
          dexterity: 20,
          constitution: 14,
          intelligence: 14,
          wisdom: 18,
          charisma: 16
        },
        challengeRating: 6
      },
      citations: [
        {
          title: 'Malaysian Folklore',
          url: 'https://en.wikipedia.org/wiki/Malaysian_folklore',
          source: 'Wikipedia',
          relevance: 'Provides a general overview of Malaysian folklore'
        },
        {
          title: 'Malay Mythology',
          url: 'https://mythopedia.com/malay-mythology/',
          source: 'Mythopedia',
          relevance: 'Details the mythology of the Malay people'
        }
      ],
      artPrompt: {
        prompt: 'Create an image of the Temberendak, a majestic bird from Malaysian folklore, perched on an ancient jungle tree at dusk.',
        style: 'Traditional Malay Batik',
        description: 'The choice of Malay Batik style reflects the regional origins of the Temberendak.'
      }
    };

    const pdfBuffer2 = await generateSimplePDF(
      testMonsterData.name,
      testMonsterData.lore,
      testMonsterData.statblock,
      testMonsterData.citations,
      testMonsterData.artPrompt
    );
    
    const outputPath2 = join(__dirname, '../../test-output-simple.pdf');
    writeFileSync(outputPath2, pdfBuffer2);
    console.log(`✅ Simple PDF generated: ${outputPath2}`);

    console.log('\n🎉 PDF generation tests completed successfully!');
    console.log('📁 Check the generated PDF files in the project root:');
    console.log(`   - test-output-layout.pdf (${Math.round(pdfBuffer1.length / 1024)}KB)`);
    console.log(`   - test-output-simple.pdf (${Math.round(pdfBuffer2.length / 1024)}KB)`);

  } catch (error) {
    console.error('❌ PDF generation test failed:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testPDFGeneration().catch(console.error);
} 