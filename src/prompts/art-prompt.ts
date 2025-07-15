import { PromptTemplate } from './index';

export const ART_PROMPT: PromptTemplate = {
  name: 'Art Prompt Generation',
  description: 'Generate visual descriptions for AI image generation based on monster lore',
  template: `Your job is to describe the visual style of the monster for an AI image generator. Use the monster's lore to inform the scene, anatomy, and artistic tone.

Monster Information:
- Name: {{name}}
- Region: {{region}}
- Lore: {{lore}}

Requirements:
- Visual traits (pose, environment, cultural details)
- Art style (e.g., "woodcut", "digital painting", "inked sketch")
- Lighting and tone (eerie, divine, warm, chaotic)
- Cultural authenticity and regional artistic traditions
- Keep the prompt concise but expressive (50-75 words)
- Avoid clichés and generic fantasy art descriptions
- Match art style to the myth's region when possible

Return the art prompt in valid JSON format:
{
  "prompt": "Detailed visual description for AI image generation",
  "style": "art_style_name",
  "description": "Brief explanation of the artistic choices and cultural influences"
}`,
  variables: ['name', 'region', 'lore'],
  examples: [
    {
      input: {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        lore: 'A nine-tailed fox yokai that dwells in sacred groves and tests the purity of travelers'
      },
      output: `{
  "prompt": "A majestic nine-tailed fox with ethereal white fur, standing in a misty Japanese forest grove surrounded by ancient torii gates and cherry blossoms. The creature has intelligent golden eyes and an otherworldly aura. Traditional ukiyo-e woodblock print style with soft, atmospheric lighting.",
  "style": "ukiyo-e",
  "description": "Ukiyo-e style captures traditional Japanese artistic traditions, while the forest setting and torii gates emphasize the Shinto spiritual context of the kitsune mythology."
}`,
      description: 'Japanese yokai with traditional art style'
    },
    {
      input: {
        name: 'Draugr of the Ironwood',
        region: 'Norse',
        lore: 'A malevolent undead creature that haunts ancient forests and can control the trees around it'
      },
      output: `{
  "prompt": "A terrifying undead warrior with rotting flesh and glowing blue eyes, emerging from twisted, gnarled trees in a dark Scandinavian forest. The trees appear to bend and reach toward the creature. Dramatic lighting with moonlight filtering through storm clouds. Dark fantasy art style with detailed textures.",
  "style": "dark_fantasy",
  "description": "Dark fantasy style emphasizes the horror elements, while the twisted forest setting reflects the creature's ability to control nature and the Norse mythological connection to the Ironwood."
}`,
      description: 'Norse undead with dark fantasy style'
    }
  ]
};

export function buildArtPrompt(context: {
  name: string;
  region: string;
  lore: string;
}): string {
  return ART_PROMPT.template
    .replace(/\{\{name\}\}/g, context.name)
    .replace(/\{\{region\}\}/g, context.region)
    .replace(/\{\{lore\}\}/g, context.lore);
} 