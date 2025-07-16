import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildStatBlockPrompt } from '@/prompts';
import OpenAI from 'openai';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';
import { QAIssue } from '@/types/qa-feedback';

export interface StatBlockAgentInput {
  lore: string;
  name?: string;
  region?: string;
  /**
   * QA feedback for refinement. Can be a string, array of issues, structured QAIssue array, or mixed array.
   */
  qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[];
}

export class StatBlockAgent extends BaseAgent {
  private openai: OpenAI;
  private model: string;
  private callCount: number = 0;

  constructor(id: string, config: any = {}) {
    super(id, 'StatBlock Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
    this.model = config.agents?.statblock || 'gpt-4';
  }

  async execute(input: StatBlockAgentInput): Promise<{ statblock: any }> {
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

  /**
   * Generates stat block, incorporating QA feedback as explicit instructions if provided.
   */
  private async generateStatBlock(input: StatBlockAgentInput): Promise<any> {
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.callCount++;
      this.log(`Using mock mode - returning test stat block (call #${this.callCount})`);
      return this.getMockStatBlock(input);
    }

    const prompt = buildStatBlockPrompt(input);
    
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a D&D 5e game designer. Create balanced stat blocks with ONLY mechanical stats and abilities. Do NOT include lore, descriptions, or narrative content. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const statblockText = response.choices[0]?.message?.content;
    if (!statblockText) {
      throw new Error('Failed to generate stat block');
    }

    // Extract JSON using the new utility function
    const statblock = extractJsonWithFallback(statblockText);
    if (!statblock) {
      throw new Error('Failed to extract valid JSON from response');
    }
    
    return statblock;
  }

  /**
   * Returns mock stat block for testing
   */
  private getMockStatBlock(_input: any): any {
    return {
      name: "Nue",
      size: "Medium",
      type: "monstrosity",
      alignment: "neutral evil",
      armorClass: 15,
      hitPoints: 45,
      hitDice: "6d8 + 18",
      speed: {
        walk: 30,
        fly: 60
      },
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 8
      },
      savingThrows: {
        strength: "+6",
        constitution: "+6"
      },
      skills: {
        "Stealth": "+5",
        "Perception": "+4"
      },
      damageResistances: ["cold", "necrotic"],
      damageImmunities: [],
      conditionImmunities: [],
      senses: {
        darkvision: 60,
        passivePerception: 14
      },
      languages: ["Common", "Abyssal"],
      challengeRating: 3,
      experiencePoints: 700,
      abilities: [
        {
          name: "Shadow Form",
          description: "The nue can transform into a black cloud as a bonus action. While in this form, it has resistance to all damage and can move through spaces as narrow as 1 inch wide."
        }
      ],
      actions: [
        {
          name: "Multiattack",
          description: "The nue makes two attacks: one with its bite and one with its claws."
        },
        {
          name: "Bite",
          description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage plus 7 (2d6) necrotic damage."
        },
        {
          name: "Claws",
          description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) slashing damage."
        }
      ],
      legendaryActions: []
    };
  }
} 