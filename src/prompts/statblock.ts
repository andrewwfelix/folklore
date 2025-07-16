export const statblockPrompt = `
You are a Dungeons & Dragons monster designer. 
Generate a complete 5e-compatible stat block based on the following creature description: {{description}}.

IMPORTANT: Focus ONLY on mechanical stats and abilities. Do NOT include lore, descriptions, or narrative content.
Return only the stat block data in JSON format.

Include:
- Core stats (AC, HP, ability scores, etc.)
- Combat abilities and actions
- Special traits and features
- Challenge rating and experience points
- Skills, saving throws, and resistances

Do NOT include:
- Lore or narrative descriptions
- Cultural background
- Historical context
- Character stories
`;

export function buildStatBlockPrompt(context: {
  description?: string;
  lore?: string;
}): string {
  let prompt = statblockPrompt;
  
  if (context.description) {
    prompt = prompt.replace(/\{\{description\}\}/g, context.description);
  }
  
  if (context.lore) {
    prompt += `\n\nLore: ${context.lore}`;
  }
  
  return prompt;
}
