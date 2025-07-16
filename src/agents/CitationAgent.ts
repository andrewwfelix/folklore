import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildCitationPrompt } from '@/prompts';
import OpenAI from 'openai';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

export interface CitationAgentInput {
  name: string;
  region: string;
  description: string;
  /**
   * QA feedback for refinement. Can be a string or array of issues.
   * Example: 'Add more scholarly sources.'
   */
  qaFeedback?: string | string[];
}

export class CitationAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'Citation Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: CitationAgentInput): Promise<{ citations: any[] }> {
    try {
      await this.start();
      this.log('Generating citations for monster');
      if (input.qaFeedback) {
        this.log(`[QA Feedback] ${Array.isArray(input.qaFeedback) ? input.qaFeedback.join('; ') : input.qaFeedback}`);
      }

      const citations = await this.generateCitations(input);
      
      await this.complete();
      this.log('Citation generation completed');

      return { citations };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Generates citations, incorporating QA feedback as explicit instructions if provided.
   */
  private async generateCitations(input: { name: string; region: string; description: string; qaFeedback?: string | string[] }): Promise<any[]> {
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.log('Using mock mode - returning test citations');
      return this.getMockCitations(input);
    }

    // Build the base prompt
    let prompt = buildCitationPrompt({
      name: input.name,
      region: input.region,
      description: input.description
    });

    // If QA feedback is present, append actionable instructions
    if (input.qaFeedback) {
      const feedback = Array.isArray(input.qaFeedback)
        ? input.qaFeedback.join(' ')
        : input.qaFeedback;
      prompt += `\n\n---\nQA Feedback for Revision: ${feedback}\nPlease address this feedback in your citations. If more scholarly or primary sources are needed, include them.`;
    }
    
    const response = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant finding reliable sources for mythological creatures. Return only valid JSON array without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.2
    });

    const citationsText = response.choices[0]?.message?.content;
    if (!citationsText) {
      throw new Error('Failed to generate citations');
    }

    try {
      // Extract JSON using the new utility function
      const citations = extractJsonWithFallback(citationsText);
      if (!citations) {
        throw new Error('Failed to extract valid JSON from citation response');
      }
      return citations;
    } catch (parseError) {
      this.log('Failed to parse citations JSON, retrying...');
      throw new Error(`Invalid JSON in citations response: ${parseError}`);
    }
  }

  /**
   * Returns mock citations for testing
   */
  private getMockCitations(_input: any): any[] {
    return [
      {
        title: "Japanese Yokai: The Complete Guide",
        author: "Mizuki, Shigeru",
        year: 2018,
        publisher: "Kodansha International",
        url: "https://www.kodansha.co.jp/english/books/isbn/9781568365734/",
        type: "book",
        relevance: "Comprehensive guide to Japanese supernatural creatures including the nue"
      },
      {
        title: "The Book of Yokai: Mysterious Creatures of Japanese Folklore",
        author: "Foster, Michael Dylan",
        year: 2015,
        publisher: "University of California Press",
        url: "https://www.ucpress.edu/book/9780520271029/the-book-of-yokai",
        type: "book",
        relevance: "Academic study of Japanese folklore and supernatural beings"
      },
      {
        title: "Nue: The Japanese Chimera",
        author: "Yanagita, Kunio",
        year: 1930,
        publisher: "Japanese Folklore Society",
        url: "https://www.japanesefolklore.org/archives/nue-study",
        type: "journal_article",
        relevance: "Original research on the nue creature and its cultural significance"
      }
    ];
  }
} 