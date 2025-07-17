import { BaseAgent } from './base/BaseAgent';
import { AgentType, Monster, MonsterGenerationInput } from '@/types';
import { buildLorePrompt } from '@/prompts';
import OpenAI from 'openai';
import { QAIssue } from '@/types/qa-feedback';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

export interface LoreAgentInput extends MonsterGenerationInput {
  /**
   * QA feedback for refinement. Can be a string, array of issues, structured QAIssue array, or mixed array.
   */
  qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[];
}

export class LoreAgent extends BaseAgent {
  private openai: OpenAI;
  private model: string;
  private callCount: number = 0;

  constructor(id: string, config: any = {}) {
    super(id, 'Lore Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
    this.model = config.agents?.lore || 'gpt-4';
  }

  async execute(input: LoreAgentInput): Promise<Partial<Monster>> {
    try {
      await this.start();
      this.log('Generating lore for monster');
      
      if (input.qaFeedback) {
        this.log(`[QA Feedback] Processing ${Array.isArray(input.qaFeedback) ? input.qaFeedback.length : 1} feedback items`);
      }

      const loreResult = await this.generateLore(input);
      
      await this.complete();
      this.log('Lore generation completed');

      return {
        name: input.name || (typeof loreResult === 'string' ? this.generateName(input.region) : loreResult.name),
        region: input.region,
        tags: input.tags || [],
        lore: typeof loreResult === 'string' ? loreResult : loreResult.lore,
        status: 'draft' as any
      };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Generates lore, incorporating QA feedback as explicit instructions if provided.
   */
  private async generateLore(input: LoreAgentInput): Promise<string | { lore: string; name: string }> {
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.callCount++;
      this.log(`Using mock mode - returning test lore (call #${this.callCount})`);
      return this.getMockLore(input);
    }

    // Build the base prompt
    let prompt = buildLorePrompt({
      region: input.region,
      ...(input.tags && { tags: input.tags }),
      ...(input.description && { description: input.description })
    });

    // Process QA feedback and append specific instructions
    if (input.qaFeedback) {
      const feedbackInstructions = this.processQAFeedback(input.qaFeedback);
      if (feedbackInstructions) {
        prompt += `\n\n---\nQA Feedback for Revision:\n${feedbackInstructions}\nPlease address these specific issues in your response.`;
      }
    }
    
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a master storyteller and folklore expert. Create rich, engaging lore that captures the essence of mythical creatures from different cultures. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const lore = response.choices[0]?.message?.content;
    if (!lore) {
      throw new Error('Failed to generate lore');
    }

    try {
      // Extract JSON using the same utility function as other agents
      const parsedLore = extractJsonWithFallback(lore.trim());
      if (!parsedLore) {
        throw new Error('Failed to extract valid JSON from lore response');
      }
      return JSON.stringify(parsedLore); // Return as string for backward compatibility
    } catch (parseError) {
      this.log('Failed to parse lore JSON, returning raw response');
      return lore.trim();
    }
  }

  /**
   * Returns mock lore for testing
   */
  private getMockLore(input: LoreAgentInput): { lore: string; name: string } {
    try {
      const mockData = require('../mocks/mock-lore.json');
      // Extract name from mock data structure
      const name = mockData.Creature?.Name || 'Baba Yaga';
      return {
        lore: JSON.stringify(mockData),
        name: name
      };
    } catch (error) {
      this.log('Failed to load mock lore, using fallback');
      // Fallback to inline data if JSON file fails to load
      const mockLore = {
        'Japan': { lore: 'The Nue is a chimera-like creature from Japanese folklore, said to have the head of a monkey, the body of a tanuki, the legs of a tiger, and a snake for a tail. It is known for its ability to transform into a black cloud and bring misfortune to those who encounter it.', name: 'Nue' },
        'Norse': { lore: 'The Hrímþursar Frost Giant is a massive being of ice and snow from Norse mythology. Born from the primordial ice of Niflheim, these giants embody the harshness of winter and are said to be able to freeze the very air with their breath.', name: 'Hrímþursar Frost Giant' },
        'Greece': { lore: 'The Chimera is a fearsome creature from Greek mythology with the head of a lion, the body of a goat, and the tail of a serpent. It breathes fire and is said to be invincible, making it one of the most dangerous monsters in Greek lore.', name: 'Chimera' },
        'Celtic': { lore: 'The Banshee is a female spirit from Irish folklore who wails to foretell death. She appears as a beautiful woman with long flowing hair, dressed in white or gray, and her mournful cry is said to be heard by those who are about to die.', name: 'Banshee' },
        'Slavic': { lore: 'The Baba Yaga is a supernatural being from Slavic folklore who lives in a hut that stands on chicken legs. She is both feared and respected, known for her wisdom and her ability to help or hinder those who seek her out.', name: 'Baba Yaga' }
      };

      const region = input.region || 'Japan';
      const fallback = mockLore[region as keyof typeof mockLore] || mockLore['Japan'];
      return {
        lore: fallback.lore,
        name: fallback.name
      };
    }
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
      
      // Check if it's mixed array (string | QAIssue)[]
      if (feedback.some(item => typeof item === 'string') && feedback.some(item => typeof item === 'object')) {
        return this.processMixedFeedback(feedback as (string | QAIssue)[]);
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
    const loreRelevantIssues = issues.filter(issue => 
      issue.affectedAgent === 'LoreAgent' || 
      issue.category === 'Name Distinctiveness' || 
      issue.category === 'Cultural Authenticity'
    );

    if (loreRelevantIssues.length === 0) {
      return '';
    }

    const instructions: string[] = [];
    
    loreRelevantIssues.forEach(issue => {
      switch (issue.category) {
        case 'Name Distinctiveness':
          instructions.push(`- Refine the creature's name to be more distinctive while maintaining its core identity. Consider variations like "Greater [Creature]" or "Shadow [Creature]" rather than changing to a completely different creature. ${issue.suggestion}`);
          break;
        case 'Cultural Authenticity':
          instructions.push(`- Enhance cultural authenticity while maintaining the same creature type. Improve the lore and cultural details without changing to a different creature. ${issue.suggestion}`);
          break;
        case 'Consistency':
          instructions.push(`- Fix consistency issues while maintaining the same creature. Ensure the lore, abilities, and cultural details are coherent for this specific creature type. ${issue.suggestion}`);
          break;
        case 'Quality':
          instructions.push(`- Improve overall quality while maintaining the same creature type. Enhance the lore, description, and cultural details without changing the fundamental creature identity. ${issue.suggestion}`);
          break;
        default:
          instructions.push(`- Address: ${issue.issue}. ${issue.suggestion}`);
      }
    });

    return instructions.join('\n');
  }

  /**
   * Process mixed feedback array (string | QAIssue)[]
   */
  private processMixedFeedback(feedback: (string | QAIssue)[]): string {
    const instructions: string[] = [];
    
    feedback.forEach(item => {
      if (typeof item === 'string') {
        instructions.push(this.processStringFeedback(item));
      } else if (typeof item === 'object' && 'category' in item) {
        const qaIssue = item as QAIssue;
        if (qaIssue.affectedAgent === 'LoreAgent' || 
            qaIssue.category === 'Name Distinctiveness' || 
            qaIssue.category === 'Cultural Authenticity') {
          switch (qaIssue.category) {
            case 'Name Distinctiveness':
              instructions.push(`- Refine the creature's name to be more distinctive while maintaining its core identity. Consider variations like "Greater [Creature]" or "Shadow [Creature]" rather than changing to a completely different creature. ${qaIssue.suggestion}`);
              break;
            case 'Cultural Authenticity':
              instructions.push(`- Enhance cultural authenticity while maintaining the same creature type. Improve the lore and cultural details without changing to a different creature. ${qaIssue.suggestion}`);
              break;
            case 'Consistency':
              instructions.push(`- Fix consistency issues while maintaining the same creature. Ensure the lore, abilities, and cultural details are coherent for this specific creature type. ${qaIssue.suggestion}`);
              break;
            case 'Quality':
              instructions.push(`- Improve overall quality while maintaining the same creature type. Enhance the lore, description, and cultural details without changing the fundamental creature identity. ${qaIssue.suggestion}`);
              break;
            default:
              instructions.push(`- Address: ${qaIssue.issue}. ${qaIssue.suggestion}`);
          }
        }
      }
    });
    
    return instructions.join('\n');
  }

  /**
   * Process string feedback
   */
  private processStringFeedback(feedback: string): string {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('name') && (lowerFeedback.includes('generic') || lowerFeedback.includes('distinctive'))) {
      return '- Refine the creature\'s name to be more distinctive while maintaining its core identity. Consider variations like "Greater [Creature]" or "Shadow [Creature]" rather than changing to a completely different creature';
    }
    
    if (lowerFeedback.includes('cultural') || lowerFeedback.includes('authenticity')) {
      return '- Enhance cultural authenticity while maintaining the same creature type. Improve the lore and cultural details without changing to a different creature';
    }
    
    return `- Address feedback while maintaining the same creature type: ${feedback}`;
  }

  /**
   * Process string array feedback
   */
  private processStringArrayFeedback(feedback: string[]): string {
    return feedback.map(f => this.processStringFeedback(f)).join('\n');
  }

  private generateName(region: string): string {
    // Simple name generation based on region
    const regionNames: { [key: string]: string[] } = {
      'Japan': ['Yokai', 'Oni', 'Tengu', 'Kappa', 'Nue'],
      'Greece': ['Chimera', 'Hydra', 'Sphinx', 'Minotaur', 'Harpy'],
      'Norse': ['Troll', 'Draugr', 'Huldra', 'Nøkk', 'Mare'],
      'Celtic': ['Banshee', 'Púca', 'Dullahan', 'Kelpie', 'Selkie'],
      'Slavic': ['Baba Yaga', 'Leshy', 'Rusalka', 'Domovoi', 'Vodyanoy'],
      'Chinese': ['Jiangshi', 'Huli Jing', 'Nian', 'Pixiu', 'Qilin'],
      'Indian': ['Rakshasa', 'Naga', 'Garuda', 'Yaksha', 'Gandharva'],
      'Egyptian': ['Sphinx', 'Ammit', 'Serpopard', 'Griffin', 'Phoenix'],
      'Aztec': ['Ahuizotl', 'Cipactli', 'Tlaltecuhtli', 'Xolotl', 'Quetzalcoatl'],
      'Malaysia': ['Pontianak', 'Penanggal', 'Toyol', 'Polong', 'Hantu']
    };

    const names = regionNames[region] || ['Unknown Creature'];
    return names[Math.floor(Math.random() * names.length)] || 'Unknown Creature';
  }
} 