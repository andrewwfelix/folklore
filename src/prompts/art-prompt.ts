export const artPrompt = `
You are a visionary artist and creative prompt engineer. 
Create a concise, imaginative art prompt based on the theme: **{{theme}}**. 
The prompt should evoke a strong visual concept and include artistic style, mood, and key visual elements. 
Keep it under 40 words.
`;

export function buildArtPrompt(context: {
  theme?: string;
  name?: string;
  region?: string;
  lore?: string;
}): string {
  let prompt = artPrompt;
  
  if (context.theme) {
    prompt = prompt.replace(/\{\{theme\}\}/g, context.theme);
  }
  
  if (context.name) {
    prompt += `\n\nCreature Name: ${context.name}`;
  }
  
  if (context.region) {
    prompt += `\n\nRegion: ${context.region}`;
  }
  
  if (context.lore) {
    prompt += `\n\nLore: ${context.lore}`;
  }
  
  return prompt;
}
