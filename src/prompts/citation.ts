import { PromptTemplate } from './index';

export const CITATION_PROMPT: PromptTemplate = {
  name: 'Citation Generation',
  description: 'Extract and format citations from mythological and folkloric sources',
  template: `Given a monster's information, identify public, reliable sources that describe the original mythology or inspiration behind the monster.

Monster Information:
- Name: {{name}}
- Region: {{region}}
- Description: {{description}}

Your job is to identify 2-3 relevant sources that describe the original mythology, folklore, or cultural background that inspired this monster. Focus on:

1. **Wikipedia articles** about the specific creature type or mythological figure
2. **Mythopedia entries** for the region's mythology
3. **Academic sources** about the region's folklore
4. **Cultural websites** that describe traditional beliefs

Requirements:
- Return 2-3 references maximum
- Include title and URL for each source
- Ensure each source is relevant to the specific monster/region
- Avoid generic mythology websites
- Focus on sources that describe the original cultural context

Return the citations in valid JSON format:
[
  {
    "title": "Source Title",
    "url": "https://example.com/source",
    "source": "Wikipedia|Mythopedia|Academic|Cultural",
    "relevance": "Brief description of why this source is relevant"
  }
]`,
  variables: ['name', 'region', 'description'],
  examples: [
    {
      input: {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        description: 'A nine-tailed fox yokai that dwells in sacred groves'
      },
      output: `[
  {
    "title": "Kitsune - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/Kitsune",
    "source": "Wikipedia",
    "relevance": "Comprehensive article about kitsune in Japanese folklore, including the nine-tailed fox mythology"
  },
  {
    "title": "Yokai: Japanese Folklore - Mythopedia",
    "url": "https://mythopedia.com/topics/yokai",
    "source": "Mythopedia",
    "relevance": "Overview of yokai creatures in Japanese mythology, including fox spirits and their connection to Shinto beliefs"
  },
  {
    "title": "Sacred Groves in Japanese Shinto Tradition",
    "url": "https://www.japanesestudies.org.uk/articles/sacred-groves",
    "source": "Academic",
    "relevance": "Academic article about the significance of sacred groves in Shinto religion and their connection to spirit beings"
  }
]`,
      description: 'Japanese yokai with multiple relevant sources'
    }
  ]
};

export function buildCitationPrompt(context: {
  name: string;
  region: string;
  description: string;
}): string {
  return CITATION_PROMPT.template
    .replace(/\{\{name\}\}/g, context.name)
    .replace(/\{\{region\}\}/g, context.region)
    .replace(/\{\{description\}\}/g, context.description);
} 