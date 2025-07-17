import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildPDFGenerationPrompt } from '@/prompts';
import OpenAI from 'openai';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

export class PDFAgent extends BaseAgent {
  private openai: OpenAI;
  private callCount: number = 0;

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
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.callCount++;
      this.log(`Using mock mode - returning test PDF layout (call #${this.callCount})`);
      return this.getMockPDFLayout(input);
    }

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

  /**
   * Returns mock PDF layout for testing
   */
  private getMockPDFLayout(_input: any): any {
    try {
      const mockData = require('../mocks/mock-pdf-layout.json');
      return mockData;
    } catch (error) {
      this.log('Failed to load mock PDF layout, using fallback');
      // Fallback to inline data if JSON file fails to load
      return {
        title: "Nue",
        sections: [
          {
            name: "Lore",
            content: "The Nue is a chimera-like creature from Japanese folklore, said to have the head of a monkey, the body of a tanuki, the legs of a tiger, and a snake for a tail. It is known for its ability to transform into a black cloud and bring misfortune to those who encounter it.",
            styling: {}
          },
          {
            name: "Stats",
            content: "{\"name\":\"Nue\",\"size\":\"Medium\",\"type\":\"monstrosity\",\"alignment\":\"neutral evil\",\"armorClass\":15,\"hitPoints\":45,\"hitDice\":\"6d8 + 18\",\"speed\":{\"walk\":30,\"fly\":60},\"abilityScores\":{\"strength\":16,\"dexterity\":14,\"constitution\":16,\"intelligence\":10,\"wisdom\":12,\"charisma\":8},\"savingThrows\":{\"strength\":\"+6\",\"constitution\":\"+6\"},\"skills\":{\"Stealth\":\"+5\",\"Perception\":\"+4\"},\"damageResistances\":[\"cold\",\"necrotic\"],\"damageImmunities\":[],\"conditionImmunities\":[],\"senses\":{\"darkvision\":60,\"passivePerception\":14},\"languages\":[\"Common\",\"Abyssal\"],\"challengeRating\":3,\"experiencePoints\":700,\"abilities\":[{\"name\":\"Shadow Form\",\"description\":\"The nue can transform into a black cloud as a bonus action. While in this form, it has resistance to all damage and can move through spaces as narrow as 1 inch wide.\"}],\"actions\":[{\"name\":\"Multiattack\",\"description\":\"The nue makes two attacks: one with its bite and one with its claws.\"},{\"name\":\"Bite\",\"description\":\"Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage plus 7 (2d6) necrotic damage.\"},{\"name\":\"Claws\",\"description\":\"Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) slashing damage.\"}],\"legendaryActions\":[]}",
            styling: {}
          },
          {
            name: "Citations",
            content: "[{'title':'Japanese Yokai: The Complete Guide','author':'Mizuki, Shigeru','year':2018,'publisher':'Kodansha International','url':'https://www.kodansha.co.jp/english/books/isbn/9781568365734/','type':'book','relevance':'Comprehensive guide to Japanese supernatural creatures including the nue'},{'title':'The Book of Yokai: Mysterious Creatures of Japanese Folklore','author':'Foster, Michael Dylan','year':2015,'publisher':'University of California Press','url':'https://www.ucpress.edu/book/9780520271029/the-book-of-yokai','type':'book','relevance':'Academic study of Japanese folklore and supernatural beings'},{'title':'Nue: The Japanese Chimera','author':'Yanagita, Kunio','year':1930,'publisher':'Japanese Folklore Society','url':'https://www.japanesefolklore.org/archives/nue-study','type':'journal_article','relevance':'Original research on the nue creature and its cultural significance'}]",
            styling: {}
          },
          {
            name: "Art",
            content: "{\"theme\":\"Japanese Yokai\",\"artistic_style\":\"Ukiyo-e\",\"mood\":\"Mysterious and eerie\",\"key_visual_elements\":[\"Traditional Japanese architecture\",\"Cherry blossoms\",\"Mystical creatures\",\"Dark atmospheric lighting\"],\"description\":\"A supernatural creature from Japanese folklore, depicted in traditional ukiyo-e style with rich cultural details and mystical atmosphere.\"}",
            styling: {}
          }
        ],
        overallStyling: {
          theme: "Japanese Fantasy",
          margins: "1 inch",
          pageSize: "A4"
        }
      };
    }
  }
} 