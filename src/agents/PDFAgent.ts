import { BaseAgent } from './base/BaseAgent';
import { AgentType, Monster, MonsterGenerationInput } from '@/types';
import { buildPDFGenerationPrompt } from '@/prompts';
import OpenAI from 'openai';

export class PDFAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'PDF Agent', AgentType.DATA_PROCESSOR, config);
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
  }): Promise<{ pdfLayout: any }> {
    try {
      await this.start();
      this.log('Generating PDF layout for monster');

      const pdfLayout = await this.generatePDFLayout(input);
      
      await this.complete();
      this.log('PDF layout generation completed');

      return { pdfLayout };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async generatePDFLayout(input: { 
    name: string; 
    region: string; 
    lore: string; 
    statblock: any; 
    citations: any[]; 
    artPrompt: any 
  }): Promise<any> {
    const prompt = buildPDFGenerationPrompt({
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
          content: 'You are a document designer creating PDF layouts. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.4
    });

    const pdfLayoutText = response.choices[0]?.message?.content;
    if (!pdfLayoutText) {
      throw new Error('Failed to generate PDF layout');
    }

    try {
      // Clean up the response to extract JSON
      const jsonMatch = pdfLayoutText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const pdfLayout = JSON.parse(jsonMatch[0]);
      return pdfLayout;
    } catch (parseError) {
      this.log('Failed to parse PDF layout JSON, retrying...');
      throw new Error(`Invalid JSON in PDF layout response: ${parseError}`);
    }
  }
} 