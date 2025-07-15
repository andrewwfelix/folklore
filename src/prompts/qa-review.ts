import { PromptTemplate } from './index';

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

Review Criteria:
1. **Cultural Authenticity**: Does the lore match the cultural reference and region?
2. **Stat Block Balance**: Is the stat block balanced and rule-compliant for D&D 5e?
3. **Completeness**: Are all required fields present (lore, stats, citations, art)?
4. **Mechanical Clarity**: Are the mechanics clear and playable?
5. **Consistency**: Do the lore, stats, and art prompt align with each other?
6. **Quality**: Is the content well-written and engaging?

For each issue found, provide:
- **Severity**: Critical, Major, Minor
- **Issue**: Description of the problem
- **Suggestion**: How to fix it

IMPORTANT: Return ONLY valid JSON without any markdown formatting, additional text, or explanations. Ensure all strings are properly escaped and the JSON is complete and well-formed.

Return the QA review in valid JSON format:
{
  "overallScore": number (1-5),
  "status": "pass" | "fail" | "needs_revision",
  "issues": [
    {
      "severity": "Critical|Major|Minor",
      "category": "Cultural|Balance|Completeness|Clarity|Consistency|Quality",
      "issue": "Description of the problem",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief overall assessment",
  "recommendations": ["List of specific improvements needed"]
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