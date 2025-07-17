import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildArtPrompt } from '@/prompts';
import OpenAI from 'openai';
import { config } from '@/config';
import { QAIssue } from '@/types/qa-feedback';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

export interface ArtPromptAgentInput {
  name: string;
  region: string;
  lore: string;
  /**
   * QA feedback for refinement. Can be a string, array of issues, structured QAIssue array, or mixed array.
   */
  qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[];
}

export class ArtPromptAgent extends BaseAgent {
  private openai: OpenAI;
  private callCount: number = 0;

  constructor(id: string, config: any = {}) {
    super(id, 'ArtPrompt Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: ArtPromptAgentInput): Promise<{ artPrompt: any }> {
    try {
      await this.start();
      this.log('Generating art prompt for monster');
      
      if (input.qaFeedback) {
        this.log(`[QA Feedback] Processing ${Array.isArray(input.qaFeedback) ? input.qaFeedback.length : 1} feedback items`);
      }

      const artPrompt = await this.generateArtPrompt(input);
      
      await this.complete();
      this.log('Art prompt generation completed');

      return { artPrompt };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Generates art prompt, incorporating QA feedback as explicit instructions if provided.
   */
  private async generateArtPrompt(input: { name: string; region: string; lore: string; qaFeedback?: string | string[] | QAIssue[] | (string | QAIssue)[] }): Promise<any> {
    // Check if mock mode is enabled
    if (config.development.mockLLM) {
      this.callCount++;
      this.log(`Using mock mode - returning test art prompt (call #${this.callCount})`);
      return this.getMockArtPrompt(input);
    }

    // Build the base prompt
    let prompt = buildArtPrompt({
      name: input.name,
      region: input.region,
      lore: input.lore
    });

    // Process QA feedback and append specific instructions
    if (input.qaFeedback) {
      const feedbackInstructions = this.processQAFeedback(input.qaFeedback);
      if (feedbackInstructions) {
        prompt += `\n\n---\nQA Feedback for Revision:\n${feedbackInstructions}\nPlease address these specific issues in your art prompt.`;
      }
    }
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an art director creating visual descriptions for AI image generation. Return only valid JSON without any markdown formatting or additional text. When given QA feedback, address the specific style and cultural issues mentioned.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const artPromptText = response.choices[0]?.message?.content;
    if (!artPromptText) {
      throw new Error('Failed to generate art prompt');
    }

    try {
      // Extract JSON using the new utility function
      const artPrompt = extractJsonWithFallback(artPromptText);
      if (!artPrompt) {
        throw new Error('Failed to extract valid JSON from art prompt response');
      }
      return artPrompt;
    } catch (parseError) {
      this.log('Failed to parse art prompt JSON, retrying...');
      throw new Error(`Invalid JSON in art prompt response: ${parseError}`);
    }
  }

  /**
   * Returns mock art prompt for testing
   */
  private getMockArtPrompt(input: any): any {
    try {
      const mockData = require('../mocks/mock-artprompt.json');
      return mockData;
    } catch (error) {
      this.log('Failed to load mock art prompt, using fallback');
      // Fallback to inline data if JSON file fails to load
      const mockArtPrompts = {
        'Japan': {
          theme: 'Japanese Yokai',
          artistic_style: 'Ukiyo-e',
          mood: 'Mysterious and eerie',
          key_visual_elements: [
            'Traditional Japanese architecture',
            'Cherry blossoms',
            'Mystical creatures',
            'Dark atmospheric lighting'
          ],
          description: 'A supernatural creature from Japanese folklore, depicted in traditional ukiyo-e style with rich cultural details and mystical atmosphere.'
        },
        'Norse': {
          theme: 'Norse Mythology',
          artistic_style: 'Nordic Art',
          mood: 'Epic and powerful',
          key_visual_elements: [
            'Frozen landscapes',
            'Ancient runes',
            'Mythical weapons',
            'Aurora borealis'
          ],
          description: 'A mighty being from Norse mythology, portrayed with epic scale and ancient Nordic artistic elements.'
        },
        'Greece': {
          theme: 'Greek Mythology',
          artistic_style: 'Classical Greek',
          mood: 'Heroic and divine',
          key_visual_elements: [
            'Ancient Greek architecture',
            'Olympian symbols',
            'Mediterranean landscapes',
            'Classical proportions'
          ],
          description: 'A legendary creature from Greek mythology, rendered in classical Greek artistic style with heroic proportions.'
        },
        'Celtic': {
          theme: 'Celtic Mythology',
          artistic_style: 'Celtic Art',
          mood: 'Mystical and ancient',
          key_visual_elements: [
            'Celtic knots and patterns',
            'Ancient forests',
            'Mystical symbols',
            'Natural elements'
          ],
          description: 'A mystical being from Celtic folklore, illustrated with traditional Celtic artistic motifs and natural elements.'
        },
        'Slavic': {
          theme: 'Slavic Folklore',
          artistic_style: 'Slavic Art',
          mood: 'Mysterious and folkloric',
          key_visual_elements: [
            'Traditional Slavic patterns',
            'Dense forests',
            'Folkloric symbols',
            'Rustic settings'
          ],
          description: 'A supernatural creature from Slavic folklore, depicted with traditional Slavic artistic elements and folkloric atmosphere.'
        }
      };

      const region = input.region || 'Japan';
      return mockArtPrompts[region as keyof typeof mockArtPrompts] || mockArtPrompts['Japan'];
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
    const artRelevantIssues = issues.filter(issue => 
      issue.affectedAgent === 'ArtPromptAgent' || 
      issue.category === 'Cultural Authenticity' ||
      issue.issue.toLowerCase().includes('art') ||
      issue.issue.toLowerCase().includes('style') ||
      issue.issue.toLowerCase().includes('visual')
    );

    if (artRelevantIssues.length === 0) {
      return '';
    }

    const instructions: string[] = [];
    
    artRelevantIssues.forEach(issue => {
      switch (issue.category) {
        case 'Cultural Authenticity':
          instructions.push(`- Enhance cultural authenticity in art style: ${issue.issue}. ${issue.suggestion}`);
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
    
    if (lowerFeedback.includes('art') && lowerFeedback.includes('style')) {
      return '- Adjust the art style to be more culturally authentic and visually distinctive';
    }
    
    if (lowerFeedback.includes('cultural') || lowerFeedback.includes('authenticity')) {
      return '- Enhance cultural authenticity in the visual description and art style';
    }
    
    if (lowerFeedback.includes('visual') || lowerFeedback.includes('appearance')) {
      return '- Improve the visual description to be more detailed and culturally accurate';
    }
    
    if (lowerFeedback.includes('prompt') || lowerFeedback.includes('description')) {
      return '- Refine the art prompt to be more specific and culturally appropriate';
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