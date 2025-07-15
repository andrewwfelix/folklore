import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildArtPrompt } from '@/prompts';
import OpenAI from 'openai';

export interface ArtPromptAgentInput {
  name: string;
  region: string;
  lore: string;
  /**
   * QA feedback for refinement. Can be a string or array of issues.
   * Example: 'Make the art style more culturally authentic.'
   */
  qaFeedback?: string | string[];
}

export class ArtPromptAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'ArtPrompt Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: ArtPromptAgentInput): Promise<{ artPrompt: any }> {
    try {
      await this.start();
      this.log('Generating art prompt for monster');
      if (input.qaFeedback) {
        this.log(`[QA Feedback] ${Array.isArray(input.qaFeedback) ? input.qaFeedback.join('; ') : input.qaFeedback}`);
      }

      const artPrompt = await this.generateArtPrompt(input);
      
      await this.complete();
      this.log('Art prompt generation completed');

      return { artPrompt };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Generates art prompt, incorporating QA feedback as explicit instructions if provided.
   */
  private async generateArtPrompt(input: { name: string; region: string; lore: string; qaFeedback?: string | string[] }): Promise<any> {
    // Build the base prompt
    let prompt = buildArtPrompt({
      name: input.name,
      region: input.region,
      lore: input.lore
    });

    // If QA feedback is present, append actionable instructions
    if (input.qaFeedback) {
      const feedback = Array.isArray(input.qaFeedback)
        ? input.qaFeedback.join(' ')
        : input.qaFeedback;
      prompt += `\n\n---\nQA Feedback for Revision: ${feedback}\nPlease address this feedback in your art prompt. If style or cultural authenticity is mentioned, adjust accordingly.`;
    }
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an art director creating visual descriptions for AI image generation. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const artPromptText = response.choices[0]?.message?.content;
    if (!artPromptText) {
      throw new Error('Failed to generate art prompt');
    }

    try {
      // Clean up the response to extract JSON
      const jsonMatch = artPromptText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const artPrompt = JSON.parse(jsonMatch[0]);
      return artPrompt;
    } catch (parseError) {
      this.log('Failed to parse art prompt JSON, retrying...');
      throw new Error(`Invalid JSON in art prompt response: ${parseError}`);
    }
  }
} 