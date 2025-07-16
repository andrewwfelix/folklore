import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildStatBlockPrompt } from '@/prompts';
import OpenAI from 'openai';
import { QAIssue } from '@/types/qa-feedback';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

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

  constructor(id: string, config: any = {}) {
    super(id, 'StatBlock Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: StatBlockAgentInput): Promise<{ statblock: any }> {
    try {
      await this.start();
      this.log('Generating stat block for monster');
      
      if (input.qaFeedback) {
        this.log(`[QA Feedback] Processing ${Array.isArray(input.qaFeedback) ? input.qaFeedback.length : 1} feedback items`);
      }

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
  private async generateStatBlock(input: { lore: string; name?: string; region?: string; qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[] }): Promise<any> {
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.log('Using mock mode - returning test stat block');
      return this.getMockStatBlock(input);
    }

    // Build the base prompt
    let prompt = buildStatBlockPrompt({
      lore: input.lore
    });

    // Process QA feedback and append specific instructions
    if (input.qaFeedback) {
      const feedbackInstructions = this.processQAFeedback(input.qaFeedback);
      if (feedbackInstructions) {
        prompt += `\n\n---\nQA Feedback for Revision:\n${feedbackInstructions}\nPlease address these specific issues in your stat block.`;
      }
    }
    
    // Try up to 3 times to get valid JSON
    for (let attempt = 1; attempt <= 3; attempt++) {
      let response: any;
      try {
        response = await this.openai.chat.completions.create({
          model: config.openai.model,
          messages: [
            {
              role: 'system',
              content: attempt === 1 
                ? 'You are a game designer writing D&D 5e-compatible stat blocks. Return only valid JSON without any markdown formatting or additional text. When given QA feedback, address the specific balance and mechanical issues mentioned.'
                : 'Your previous response contained invalid JSON. Please reformat your response as valid JSON only. Do not include any text, explanations, or markdown outside the JSON object. Ensure all property names are double-quoted and there are no trailing commas.'
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

        // Extract JSON using the new utility function
        const statblock = extractJsonWithFallback(statblockText);
        if (!statblock) {
          throw new Error('Failed to extract valid JSON from response');
        }
        
        return statblock;
        
      } catch (parseError) {
        this.log(`Attempt ${attempt}/3 failed to parse stat block JSON`);
        if (attempt === 3) {
          this.log(`Raw response: ${response?.choices[0]?.message?.content || 'No response'}`);
          throw new Error(`Invalid JSON in stat block response after 3 attempts: ${parseError}`);
        }
        // Continue to next attempt
      }
    }
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

  /**
   * Process QA feedback and generate specific instructions for the agent
   */
  private processQAFeedback(feedback: string | string[] | QAIssue[] | (string | QAIssue)[]): string {
    if (typeof feedback === 'string') {
      return this.processStringFeedback(feedback);
    }
    
    if (Array.isArray(feedback)) {
      if (feedback.length === 0) return '';
      
      // Check if it's QAIssue array
      if (typeof feedback[0] === 'object' && 'category' in feedback[0]) {
        return this.processQAIssues(feedback as QAIssue[]);
      }
      
      // String array
      return this.processStringArrayFeedback(feedback as string[]);
    }
    
    return '';
  }

  /**
   * Process structured QAIssue feedback
   */
  private processQAIssues(issues: QAIssue[]): string {
    const statBlockRelevantIssues = issues.filter(issue => 
      issue.affectedAgent === 'StatBlockAgent' || 
      issue.category === 'Stat Block Balance'
    );

    if (statBlockRelevantIssues.length === 0) {
      return '';
    }

    const instructions: string[] = [];
    
    statBlockRelevantIssues.forEach(issue => {
      switch (issue.category) {
        case 'Stat Block Balance':
          instructions.push(`- Adjust stat block balance: ${issue.issue}. ${issue.suggestion}`);
          break;
        case 'Consistency':
          instructions.push(`- Fix consistency issues: ${issue.issue}. ${issue.suggestion}`);
          break;
        case 'Quality':
          instructions.push(`- Improve overall quality: ${issue.issue}. ${issue.suggestion}`);
          break;
        default:
          instructions.push(`- Address: ${issue.issue}. ${issue.suggestion}`);
      }
    });

    return instructions.join('\n');
  }

  /**
   * Process string feedback
   */
  private processStringFeedback(feedback: string): string {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('cr') || lowerFeedback.includes('challenge rating')) {
      return '- Adjust the Challenge Rating (CR) to better reflect the monster\'s power level';
    }
    
    if (lowerFeedback.includes('balance') || lowerFeedback.includes('overpowered') || lowerFeedback.includes('underpowered')) {
      return '- Rebalance the stat block to ensure appropriate power level';
    }
    
    if (lowerFeedback.includes('hp') || lowerFeedback.includes('hit points')) {
      return '- Adjust hit points to appropriate level for the monster type';
    }
    
    if (lowerFeedback.includes('armor') || lowerFeedback.includes('ac')) {
      return '- Adjust Armor Class to appropriate level';
    }
    
    if (lowerFeedback.includes('damage') || lowerFeedback.includes('attack')) {
      return '- Adjust damage and attack bonuses to appropriate level';
    }
    
    return `- Address feedback: ${feedback}`;
  }

  /**
   * Process string array feedback
   */
  private processStringArrayFeedback(feedback: string[]): string {
    return feedback.map(f => this.processStringFeedback(f)).join('\n');
  }
} 