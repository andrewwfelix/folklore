import { PromptTemplate } from './index';
import { JSON_OUTPUT_DIRECTIVE } from './json-directive';

export const CITATION_PROMPT: PromptTemplate = {
  name: 'Citation Generation',
  description: 'Extract and format citations from mythological and folkloric sources',
  template: `Given a monster's information, identify public, reliable sources that describe the original mythology or inspiration behind the monster.

Monster Information:
- Name: {{name}}
- Region: {{region}}
- Description: {{description}}

Your job is to identify 2-3 relevant sources that describe the original mythology, folklore, or cultural background that inspired this monster. Prioritize sources in this order:

1. **Academic sources** - University publications, scholarly articles, and research papers about the region's folklore
2. **Mythopedia entries** - Specialized mythology encyclopedias and cultural reference sites
3. **Cultural websites** - Official cultural institutions, museums, and traditional belief organizations
4. **Wikipedia articles** - Only as a last resort when more authoritative sources are not available

Requirements:
- Return 2-3 references maximum
- Include title and URL for each source
- Ensure each source is relevant to the specific monster/region
- **Avoid Wikipedia when possible** - prefer academic and specialized sources
- Focus on sources that describe the original cultural context and historical background
- Prioritize sources that provide deeper cultural and historical context rather than general overviews

${JSON_OUTPUT_DIRECTIVE}

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
    "title": "The Role of Kitsune in Japanese Shinto Beliefs: A Cultural Analysis",
    "url": "https://www.japanesestudies.org.uk/articles/kitsune-shinto",
    "source": "Academic",
    "relevance": "Scholarly analysis of kitsune mythology in Japanese Shinto religion, including the nine-tailed fox and sacred grove connections"
  },
  {
    "title": "Yokai: Japanese Folklore - Mythopedia",
    "url": "https://mythopedia.com/topics/yokai",
    "source": "Mythopedia",
    "relevance": "Specialized encyclopedia entry on yokai creatures in Japanese mythology, including fox spirits and their cultural significance"
  },
  {
    "title": "Sacred Groves and Spirit Beings in Japanese Tradition",
    "url": "https://www.japanesemuseum.org/folklore/sacred-groves",
    "source": "Cultural",
    "relevance": "Cultural institution's documentation of sacred groves in Japanese tradition and their connection to spirit beings"
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