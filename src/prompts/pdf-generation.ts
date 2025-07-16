import { PromptTemplate } from './index';
import { JSON_OUTPUT_DIRECTIVE } from './json-directive';

export const PDF_GENERATION_PROMPT: PromptTemplate = {
  name: 'PDF Generation',
  description: 'Format monster data into printable PDF layout with proper styling',
  template: `Design a PDF layout for the monster's profile. Based on the monster's tone, region, and art, create an appropriate typography and layout structure.

Monster Information:
- Name: {{name}}
- Region: {{region}}
- Lore: {{lore}}
- StatBlock: {{statblock}}
- Citations: {{citations}}
- Art Prompt: {{artPrompt}}

Requirements:
- Include section headers: "Lore", "Stats", "Citations", "Image"
- Keep fonts legible, fantasy-themed, and printable
- Align content for consistent margins
- Use appropriate styling based on the monster's cultural region
- Include monster name as the main title
- Format stat block in clear, readable D&D 5e style
- List citations in a clean, academic format
- Include art description and style information

${JSON_OUTPUT_DIRECTIVE}

Return the PDF layout specification in valid JSON format:
{
  "title": "Monster Name",
  "sections": [
    {
      "name": "Lore",
      "content": "formatted_lore_text",
      "styling": {
        "font": "font_name",
        "size": "font_size",
        "alignment": "left|center|right"
      }
    },
    {
      "name": "Stat Block",
      "content": "formatted_stat_block",
      "styling": {
        "font": "monospace_font",
        "size": "font_size",
        "alignment": "left"
      }
    },
    {
      "name": "Citations",
      "content": "formatted_citations",
      "styling": {
        "font": "serif_font",
        "size": "font_size",
        "alignment": "left"
      }
    },
    {
      "name": "Art",
      "content": "art_description_and_style",
      "styling": {
        "font": "font_name",
        "size": "font_size",
        "alignment": "left"
      }
    }
  ],
  "overallStyling": {
    "theme": "cultural_theme",
    "margins": "margin_specification",
    "pageSize": "A4|Letter|Custom"
  }
}`,
  variables: ['name', 'region', 'lore', 'statblock', 'citations', 'artPrompt'],
  examples: [
    {
      input: {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        lore: 'A nine-tailed fox yokai that dwells in sacred groves',
        statblock: '{"armorClass": 15, "hitPoints": 120, "challengeRating": 8}',
        citations: '[{"title": "Kitsune - Wikipedia", "url": "https://en.wikipedia.org/wiki/Kitsune"}]',
        artPrompt: '{"prompt": "Nine-tailed fox in Japanese forest", "style": "ukiyo-e"}'
      },
      output: `{
  "title": "Kitsune-no-Mori",
  "sections": [
    {
      "name": "Lore",
      "content": "The Kitsune-no-Mori, or \"Fox of the Sacred Grove,\" is a lesser-known yokai that dwells in the ancient forests surrounding Shinto shrines...",
      "styling": {
        "font": "Mincho",
        "size": "12pt",
        "alignment": "justified"
      }
    },
    {
      "name": "Stat Block",
      "content": "KITSUNE-NO-MORI\\nMedium celestial, chaotic neutral\\n\\nArmor Class 15\\nHit Points 120 (16d8 + 48)\\nSpeed 40 ft., fly 60 ft.\\n\\nSTR 14 (+2) DEX 18 (+4) CON 16 (+3)\\nINT 16 (+3) WIS 20 (+5) CHA 18 (+4)...",
      "styling": {
        "font": "Courier",
        "size": "10pt",
        "alignment": "left"
      }
    },
    {
      "name": "Citations",
      "content": "1. Kitsune - Wikipedia\\n   https://en.wikipedia.org/wiki/Kitsune\\n\\n2. Yokai: Japanese Folklore - Mythopedia\\n   https://mythopedia.com/topics/yokai",
      "styling": {
        "font": "Gothic",
        "size": "10pt",
        "alignment": "left"
      }
    },
    {
      "name": "Art",
      "content": "Style: Ukiyo-e woodblock print\\nDescription: A majestic nine-tailed fox with ethereal white fur, standing in a misty Japanese forest grove surrounded by ancient torii gates and cherry blossoms.",
      "styling": {
        "font": "Mincho",
        "size": "11pt",
        "alignment": "left"
      }
    }
  ],
  "overallStyling": {
    "theme": "japanese_traditional",
    "margins": "1 inch all sides",
    "pageSize": "A4"
  }
}`,
      description: 'Japanese yokai with traditional styling'
    }
  ]
};

export function buildPDFGenerationPrompt(context: {
  name: string;
  region: string;
  lore: string;
  statblock: any;
  citations: any[];
  artPrompt: any;
}): string {
  return PDF_GENERATION_PROMPT.template
    .replace(/\{\{name\}\}/g, context.name)
    .replace(/\{\{region\}\}/g, context.region)
    .replace(/\{\{lore\}\}/g, context.lore)
    .replace(/\{\{statblock\}\}/g, JSON.stringify(context.statblock))
    .replace(/\{\{citations\}\}/g, JSON.stringify(context.citations))
    .replace(/\{\{artPrompt\}\}/g, JSON.stringify(context.artPrompt));
} 