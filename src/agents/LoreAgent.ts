import { BaseAgent } from './base/BaseAgent';
import { AgentType, Monster, MonsterGenerationInput } from '@/types';
import { buildLorePrompt } from '@/prompts';
import OpenAI from 'openai';
import { QAIssue } from '@/types/qa-feedback';

export interface LoreAgentInput extends MonsterGenerationInput {
  /**
   * QA feedback for refinement. Can be a string, array of issues, structured QAIssue array, or mixed array.
   */
  qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[];
}

export class LoreAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'Lore Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: LoreAgentInput): Promise<Partial<Monster>> {
    try {
      await this.start();
      this.log('Generating lore for monster');
      
      if (input.qaFeedback) {
        this.log(`[QA Feedback] Processing ${Array.isArray(input.qaFeedback) ? input.qaFeedback.length : 1} feedback items`);
      }

      const lore = await this.generateLore(input);
      
      await this.complete();
      this.log('Lore generation completed');

      return {
        name: input.name || this.generateName(input.region),
        region: input.region,
        tags: input.tags || [],
        lore: lore,
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
  private async generateLore(input: LoreAgentInput): Promise<string> {
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
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a cultural mythographer creating folklore-based content for a fantasy RPG. Create original monsters inspired by real-world myths and legends. When given QA feedback, address the specific issues mentioned.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    });

    const lore = response.choices[0]?.message?.content;
    if (!lore) {
      throw new Error('Failed to generate lore');
    }

    return lore.trim();
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
          instructions.push(`- Generate a more distinctive name. Current name is too generic. ${issue.suggestion}`);
          break;
        case 'Cultural Authenticity':
          instructions.push(`- Enhance cultural authenticity for ${issue.issue}. ${issue.suggestion}`);
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
              instructions.push(`- Generate a more distinctive name. Current name is too generic. ${qaIssue.suggestion}`);
              break;
            case 'Cultural Authenticity':
              instructions.push(`- Enhance cultural authenticity for ${qaIssue.issue}. ${qaIssue.suggestion}`);
              break;
            case 'Consistency':
              instructions.push(`- Fix consistency issues: ${qaIssue.issue}. ${qaIssue.suggestion}`);
              break;
            case 'Quality':
              instructions.push(`- Improve overall quality: ${qaIssue.issue}. ${qaIssue.suggestion}`);
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
      return '- Generate a more distinctive, culturally authentic name that is not generic like "Troll", "Dragon", or "Spirit"';
    }
    
    if (lowerFeedback.includes('cultural') || lowerFeedback.includes('authenticity')) {
      return '- Enhance cultural authenticity and regional specificity in the lore';
    }
    
    return `- Address feedback: ${feedback}`;
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