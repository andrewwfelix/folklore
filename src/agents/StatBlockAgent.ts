import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildStatBlockPrompt } from '@/prompts';
import OpenAI from 'openai';

export class StatBlockAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'StatBlock Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: { lore: string; name?: string; region?: string }): Promise<{ statblock: any }> {
    try {
      await this.start();
      this.log('Generating stat block for monster');

      const statblock = await this.generateStatBlock(input);
      
      await this.complete();
      this.log('Stat block generation completed');

      return { statblock };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async generateStatBlock(input: { lore: string; name?: string; region?: string }): Promise<any> {
    const prompt = buildStatBlockPrompt({
      lore: input.lore
    });
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a game designer writing D&D 5e-compatible stat blocks. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const statblockText = response.choices[0]?.message?.content;
    if (!statblockText) {
      throw new Error('Failed to generate stat block');
    }

    try {
      // Clean up the response to extract JSON
      const jsonMatch = statblockText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const statblock = JSON.parse(jsonMatch[0]);
      return statblock;
    } catch (parseError) {
      this.log('Failed to parse stat block JSON, retrying...');
      throw new Error(`Invalid JSON in stat block response: ${parseError}`);
    }
  }
} 