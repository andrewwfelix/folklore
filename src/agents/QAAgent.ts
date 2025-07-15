import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildQAReviewPrompt } from '@/prompts';
import OpenAI from 'openai';

export class QAAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'QA Agent', AgentType.QUALITY_CONTROL, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: { 
    name: string; 
    region: string; 
    lore: string; 
    statblock: any; 
    citations: any[]; 
    artPrompt: any 
  }): Promise<{ qaReview: any }> {
    try {
      await this.start();
      this.log('Performing QA review for monster');

      const qaReview = await this.performQAReview(input);
      
      await this.complete();
      this.log('QA review completed');

      return { qaReview };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async performQAReview(input: { 
    name: string; 
    region: string; 
    lore: string; 
    statblock: any; 
    citations: any[]; 
    artPrompt: any 
  }): Promise<any> {
    const prompt = buildQAReviewPrompt({
      name: input.name,
      region: input.region,
      lore: input.lore,
      statblock: input.statblock,
      citations: input.citations,
      artPrompt: input.artPrompt
    });
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a senior editor evaluating AI-generated content. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const qaReviewText = response.choices[0]?.message?.content;
    if (!qaReviewText) {
      throw new Error('Failed to generate QA review');
    }

    try {
      // Clean up the response to extract JSON
      const jsonMatch = qaReviewText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const qaReview = JSON.parse(jsonMatch[0]);
      return qaReview;
    } catch (parseError) {
      this.log('Failed to parse QA review JSON, retrying...');
      throw new Error(`Invalid JSON in QA review response: ${parseError}`);
    }
  }
} 