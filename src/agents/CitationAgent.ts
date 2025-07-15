import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildCitationPrompt } from '@/prompts';
import OpenAI from 'openai';

export interface CitationAgentInput {
  name: string;
  region: string;
  description: string;
  qaFeedback?: string;
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
        this.log(`[QA Feedback] ${input.qaFeedback}`);
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

  private async generateCitations(input: { name: string; region: string; description: string }): Promise<any[]> {
    const prompt = buildCitationPrompt({
      name: input.name,
      region: input.region,
      description: input.description
    });
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
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
      // Clean up the response to extract JSON
      const jsonMatch = citationsText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      const citations = JSON.parse(jsonMatch[0]);
      return citations;
    } catch (parseError) {
      this.log('Failed to parse citations JSON, retrying...');
      throw new Error(`Invalid JSON in citations response: ${parseError}`);
    }
  }
} 