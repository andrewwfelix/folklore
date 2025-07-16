import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildStatBlockPrompt } from '@/prompts';
import OpenAI from 'openai';
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
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a game designer writing D&D 5e-compatible stat blocks. Return only valid JSON without any markdown formatting or additional text. When given QA feedback, address the specific balance and mechanical issues mentioned.'
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