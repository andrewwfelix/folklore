import { PromptTemplate } from './index';

export const LORE_PROMPT: PromptTemplate = {
  name: 'Lore Generation',
  description: 'Generate culturally authentic monster lore based on region and folklore',
  template: `You are a cultural mythographer creating folklore-based content for a fantasy RPG. Your task is to create an original monster inspired by myths from {{region}}.

Requirements:
- Write in the tone of a field journal or ancient bestiary
- Include references to behavior, history, sightings, and cultural significance
- Length: 150-250 words
- Be mystical, slightly academic, and evoke curiosity
- Draw inspiration from real {{region}} folklore and mythology
- Make the creature original but culturally authentic

{{#if tags}}Suggested creature type: {{tags}}{{/if}}
{{#if description}}Additional context: {{description}}{{/if}}

Write the lore in a single paragraph that could appear in a monster manual.`,
  variables: ['region', 'tags', 'description'],
  examples: [
    {
      input: {
        region: 'Japan',
        tags: 'yokai, supernatural',
        description: 'A mysterious creature from Japanese folklore'
      },
      output: `The Kitsune-no-Mori, or "Fox of the Sacred Grove," is a lesser-known yokai that dwells in the ancient forests surrounding Shinto shrines. Unlike the more famous kitsune, this creature takes the form of a fox with nine distinct tails, each representing a different aspect of nature's power. Local legends speak of travelers who encountered the Kitsune-no-Mori during twilight hours, when the boundary between the mortal realm and the spirit world grows thin. The creature is said to test the purity of those who enter its domain, appearing as a beautiful maiden to the virtuous and a terrifying beast to those with impure intentions. Shrine records from the Edo period mention several documented encounters, with witnesses describing an ethereal presence that seemed to embody the very essence of the forest itself. The Kitsune-no-Mori is particularly active during the autumn months, when the leaves change color and the harvest festivals begin.`,
      description: 'Japanese yokai with cultural authenticity'
    },
    {
      input: {
        region: 'Norse',
        tags: 'undead, forest',
        description: 'A creature from Norse mythology'
      },
      output: `The Draugr of the Ironwood, known as Járnviðr's Bane, is a particularly malevolent undead creature that haunts the ancient forests of Scandinavia. Unlike typical draugr that guard burial mounds, this entity was created when a powerful berserker warrior was buried alive in the heart of the Ironwood forest after being accused of dark magic. The combination of the warrior's rage, the forest's ancient magic, and the iron-rich soil has transformed him into something far more dangerous than a simple undead. Local skalds tell of how the Draugr of the Ironwood can control the very trees around it, causing them to bend and twist to trap unwary travelers. The creature is said to be particularly active during the long winter nights, when it emerges from its hidden lair to hunt for those who would desecrate the sacred groves.`,
      description: 'Norse undead with forest connection'
    }
  ]
};

export function buildLorePrompt(context: {
  region: string;
  tags?: string[];
  description?: string;
}): string {
  let result = LORE_PROMPT.template
    .replace(/\{\{region\}\}/g, context.region)
    .replace(/\{\{tags\}\}/g, context.tags?.join(', ') || '')
    .replace(/\{\{description\}\}/g, context.description || '');

  // Remove conditional blocks if variable is missing
  if (!context.tags || context.tags.length === 0) {
    result = result.replace(/\n?\{\{#if tags\}\}.*?\{\{\/if\}\}\n?/gs, '');
  } else {
    result = result.replace(/\{\{#if tags\}\}(.*?)\{\{\/if\}\}/gs, '$1');
  }
  if (!context.description) {
    result = result.replace(/\n?\{\{#if description\}\}.*?\{\{\/if\}\}\n?/gs, '');
  } else {
    result = result.replace(/\{\{#if description\}\}(.*?)\{\{\/if\}\}/gs, '$1');
  }
  return result;
} 