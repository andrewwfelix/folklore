export const lorePrompt = `
You are a world-class sci-fi and fantasy author specializing in mythological creatures. 
Write a rich, immersive lore entry for a single mythical creature from the specified region.

IMPORTANT CONSTRAINTS:
- Focus on ONE single creature only
- If refining an existing creature, maintain its core identity and type
- For name improvements, create variations like "Greater Oni" or "Shadow Oni" rather than completely different creatures
- Do not create multiple creatures or change to a different creature type

Include the following sections:
## Creature Description
## Cultural Significance  
## Notable Abilities
## Historical Context

Use vivid, sensory language. Format the response in Markdown.
`;

export function buildLorePrompt(context: {
  region: string;
  tags?: string[];
  description?: string;
}): string {
  let prompt = lorePrompt;
  
  if (context.description) {
    prompt += `\n\nContext: ${context.description}`;
  }
  
  if (context.tags && context.tags.length > 0) {
    prompt += `\n\nTags: ${context.tags.join(', ')}`;
  }
  
  prompt += `\n\nRegion: ${context.region}`;
  
  return prompt;
}
