import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildPDFGenerationPrompt } from '@/prompts';
import OpenAI from 'openai';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

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
      // Extract JSON using the new utility function
      const pdfLayout = extractJsonWithFallback(pdfLayoutText);
      if (!pdfLayout) {
        throw new Error('Failed to extract valid JSON from PDF layout response');
      }
      return pdfLayout;
    } catch (parseError) {
      this.log('Failed to parse PDF layout JSON, creating fallback layout...');
      
      // Create a fallback PDF layout if JSON parsing fails
      const fallbackLayout = {
        title: input.name,
        sections: [
          {
            name: 'Lore',
            content: input.lore,
            styling: {
              font: 'Times New Roman',
              size: '12pt',
              alignment: 'left'
            }
          },
          {
            name: 'Stat Block',
            content: JSON.stringify(input.statblock, null, 2),
            styling: {
              font: 'Courier New',
              size: '10pt',
              alignment: 'left'
            }
          },
          {
            name: 'Citations',
            content: JSON.stringify(input.citations, null, 2),
            styling: {
              font: 'Arial',
              size: '10pt',
              alignment: 'left'
            }
          },
          {
            name: 'Art',
            content: JSON.stringify(input.artPrompt, null, 2),
            styling: {
              font: 'Times New Roman',
              size: '11pt',
              alignment: 'left'
            }
          }
        ],
        overallStyling: {
          theme: 'default',
          margins: '1 inch all sides',
          pageSize: 'A4'
        }
      };
      
      this.log('Using fallback PDF layout due to JSON parsing error');
      return fallbackLayout;
    }
  }
} 