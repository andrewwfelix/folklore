import { PromptTemplate } from './index';
import { JSON_OUTPUT_DIRECTIVE } from './json-directive';

export const QA_REVIEW_PROMPT: PromptTemplate = {
  name: 'QA Review',
  description: 'Evaluate monster quality, consistency, and compliance with requirements',
  template: `You are a senior editor evaluating an AI-generated monster entry. Review the following monster for quality, consistency, and compliance.

Monster Information:
- Name: {{name}}
- Region: {{region}}
- Lore: {{lore}}
- StatBlock: {{statblock}}
- Citations: {{citations}}
- Art Prompt: {{artPrompt}}

Review Criteria (be consistent and thorough):
1. **Name Distinctiveness**: Is the monster name unique and distinctive? Avoid generic names like "Troll", "Dragon", "Spirit" without modifiers. Names should reflect cultural origins and unique characteristics.
2. **Cultural Authenticity**: Does the lore match the cultural reference and region? Are cultural elements accurate and well-integrated?
3. **Stat Block Balance**: Is the stat block balanced and rule-compliant for D&D 5e? Check CR, HP, AC, abilities for balance.
4. **Completeness**: Are all required fields present and properly filled? Check lore, stats, citations, art prompt.
5. **Mechanical Clarity**: Are the mechanics clear and playable? Can a DM run this monster without confusion?
6. **Consistency**: Do the lore, stats, and art prompt align with each other? No contradictions.
7. **Quality**: Is the content well-written and engaging? Good prose, clear descriptions.
8. **Name-Lore Alignment**: Does the monster's name match what's described in the lore? No naming inconsistencies.

IMPORTANT GUIDELINES:
- Be CONSISTENT in your evaluation - don't change standards between reviews
- Only flag issues that are ACTUALLY problems, not preferences
- For "Completeness" - only flag if something is completely missing, not if it could be better
- For "Quality" - only flag if writing is poor or unclear, not if it could be more detailed
- Be SPECIFIC about what's wrong and how to fix it
- Don't create new issues that weren't problems before unless they're clearly new problems

For each issue found, provide:
- **Severity**: Critical (breaks functionality), Major (significant problem), Minor (cosmetic/optional)
- **Category**: One of the 8 criteria above
- **Issue**: Specific description of the problem
- **Suggestion**: Clear, actionable way to fix it

${JSON_OUTPUT_DIRECTIVE}

Return the QA review in valid JSON format:
{
  "overallScore": number (1-5, where 5 is excellent),
  "status": "pass" | "needs_revision",
  "issues": [
    {
      "severity": "Critical|Major|Minor",
      "category": "Name Distinctiveness|Cultural Authenticity|Stat Block Balance|Completeness|Mechanical Clarity|Consistency|Quality|Name-Lore Alignment",
      "issue": "Specific description of the problem",
      "suggestion": "Clear, actionable fix"
    }
  ],
  "summary": "Brief overall assessment focusing on strengths and key issues",
  "recommendations": ["List of specific, actionable improvements needed"]
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
  "overallScore": 4,
  "status": "pass",
  "issues": [
    {
      "severity": "Minor",
      "category": "Completeness",
      "issue": "Missing legendary actions for a CR 8 creature",
      "suggestion": "Add 2-3 legendary actions appropriate for a kitsune"
    }
  ],
  "summary": "Strong cultural authenticity and good mechanical balance. Minor improvements needed for completeness.",
  "recommendations": [
    "Add legendary actions to match CR 8 power level",
    "Include more specific cultural details in lore",
    "Expand art prompt with more visual details"
  ]
}`,
      description: 'Japanese yokai with minor issues'
    }
  ]
};

export function buildQAReviewPrompt(context: {
  name: string;
  region: string;
  lore: string;
  statblock: any;
  citations: any[];
  artPrompt: any;
}): string {
  return QA_REVIEW_PROMPT.template
    .replace(/\{\{name\}\}/g, context.name)
    .replace(/\{\{region\}\}/g, context.region)
    .replace(/\{\{lore\}\}/g, context.lore)
    .replace(/\{\{statblock\}\}/g, JSON.stringify(context.statblock))
    .replace(/\{\{citations\}\}/g, JSON.stringify(context.citations))
    .replace(/\{\{artPrompt\}\}/g, JSON.stringify(context.artPrompt));
} 