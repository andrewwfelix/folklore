#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config, validateConfig } from '../config';
import { LoreAgent } from '../agents/LoreAgent';
import { StatBlockAgent } from '../agents/StatBlockAgent';
import { CitationAgent } from '../agents/CitationAgent';
import { ArtPromptAgent } from '../agents/ArtPromptAgent';
import { QAAgent } from '../agents/QAAgent';
import { PDFAgent } from '../agents/PDFAgent';
import { uploadPDF, uploadImage } from '../lib/utils/blob-storage';
import { generatePDF, generateSimplePDF } from '../lib/utils/pdf-generator';

// Utility: Generate a random region for demo
const REGIONS = [
  'Japan', 'Greece', 'Norse', 'Celtic', 'Slavic', 'Chinese', 'Indian', 'Egyptian', 'Aztec', 'Malaysia'
];
function randomRegion() {
  return REGIONS[Math.floor(Math.random() * REGIONS.length)];
}

async function orchestrateMonster(index: number) {
  const region = randomRegion();
  const description = `A mysterious creature from ${region} folklore`;
  const name: string | undefined = undefined; // Let LoreAgent generate name if not provided
  const tags = undefined;

  // 1. Lore
  const loreAgent = new LoreAgent(`lore-${index}`);
  const loreInput: any = { region: region || 'Unknown Region', tags, description };
  if (name) loreInput.name = name;
  const loreResult = await loreAgent.execute(loreInput);
  const lore = loreResult.lore || '';
  const monsterName = loreResult.name || 'Unknown Creature';
  const monsterRegion = region || 'Unknown Region';
  console.log(`\n[${index}] Lore:`, lore);

  // 2. Stat Block
  const statBlockAgent = new StatBlockAgent(`statblock-${index}`);
  const statBlockResult = await statBlockAgent.execute({ lore, name: monsterName, region: monsterRegion });
  console.log(`[${index}] Stat Block:`, statBlockResult.statblock);

  // 3. Citations
  const citationAgent = new CitationAgent(`citation-${index}`);
  const citationResult = await citationAgent.execute({ name: monsterName, region: monsterRegion, description: lore });
  console.log(`[${index}] Citations:`, citationResult.citations);

  // 4. Art Prompt
  const artPromptAgent = new ArtPromptAgent(`art-${index}`);
  const artPromptResult = await artPromptAgent.execute({ name: monsterName, region: monsterRegion, lore });
  console.log(`[${index}] Art Prompt:`, artPromptResult.artPrompt);

  // 5. QA Review
  const qaAgent = new QAAgent(`qa-${index}`);
  const qaResult = await qaAgent.execute({
    name: monsterName,
    region: monsterRegion,
    lore,
    statblock: statBlockResult.statblock,
    citations: citationResult.citations,
    artPrompt: artPromptResult.artPrompt
  });
  console.log(`[${index}] QA Review:`, qaResult.qaReview);

  // 6. PDF Layout
  const pdfAgent = new PDFAgent(`pdf-${index}`);
  const pdfResult = await pdfAgent.execute({
    name: monsterName,
    region: monsterRegion,
    lore,
    statblock: statBlockResult.statblock,
    citations: citationResult.citations,
    artPrompt: artPromptResult.artPrompt
  });
  console.log(`[${index}] PDF Layout:`, pdfResult.pdfLayout);

  // 7. File Storage (PDF and Image)
  let pdfUrl: string | undefined;
  let imageUrl: string | undefined;
  
  try {
    console.log(`[${index}] Generating PDF and uploading files...`);
    
    // Generate actual PDF from the layout
    let pdfContent: Buffer;
    try {
      // Try to use the PDF layout from PDFAgent
      pdfContent = await generatePDF(pdfResult.pdfLayout);
    } catch (pdfError) {
      console.log(`[${index}] PDF layout generation failed, using fallback:`, (pdfError as Error).message);
      // Fallback to simple PDF generation
      pdfContent = await generateSimplePDF(
        monsterName,
        lore,
        statBlockResult.statblock,
        citationResult.citations,
        artPromptResult.artPrompt
      );
    }
    
    // For now, create placeholder image content
    // In the future, this would be generated from artPrompt using DALL-E or similar
    const imageContent = Buffer.from(`Placeholder image for ${monsterName}`);
    
    const pdfUploadResult = await uploadPDF(monsterName, pdfContent);
    const imageUploadResult = await uploadImage(monsterName, imageContent);
    
    pdfUrl = pdfUploadResult.url;
    imageUrl = imageUploadResult.url;
    
    console.log(`[${index}] Files uploaded: PDF=${pdfUrl}, Image=${imageUrl}`);
  } catch (error) {
    console.error(`[${index}] File upload failed:`, (error as Error).message);
  }

  // Return all results for this monster
  return {
    name: monsterName,
    region: monsterRegion,
    lore,
    statblock: statBlockResult.statblock,
    citations: citationResult.citations,
    artPrompt: artPromptResult.artPrompt,
    qaReview: qaResult.qaReview,
    pdfLayout: pdfResult.pdfLayout,
    pdfUrl,
    imageUrl
  };
}

export { orchestrateMonster };

async function main() {
  try {
    validateConfig();
    console.log('🎭 Folklore Monster Orchestrator');
    console.log('===============================');
    console.log(`Generating ${config.generation.count} monster(s)...\n`);

    const monsters = [];
    for (let i = 0; i < config.generation.count; i++) {
      try {
        const monster = await orchestrateMonster(i + 1);
        monsters.push(monster);
      } catch (err) {
        console.error(`❌ Error generating monster #${i + 1}:`, (err as Error).message);
      }
    }
    console.log(`\n✅ Generation complete!`);
    // Optionally: Save monsters to DB or file here
  } catch (error) {
    console.error('❌ Orchestrator Error:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 