import { BaseAgent } from './base/BaseAgent';
import { AgentType } from '@/types';
import { buildQAReviewPrompt } from '@/prompts';
import OpenAI from 'openai';
import { config } from '@/config';
import { extractJsonWithFallback } from '@/lib/utils/json-extractor';

export class QAAgent extends BaseAgent {
  private openai: OpenAI;
  private callCount: number = 0;

  constructor(id: string, config: any = {}) {
    super(id, 'QA Agent', AgentType.QUALITY_CONTROL, config);
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
  }): Promise<{ qaReview: any }> {
    try {
      await this.start();
      this.log('Performing QA review for monster');

      const qaReview = await this.performQAReview(input);
      
      await this.complete();
      this.log('QA review completed');

      return { qaReview };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async performQAReview(input: { 
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
      this.log(`Using mock mode - returning test QA review (call #${this.callCount})`);
      return this.getMockQAReview(input);
    }

    const prompt = buildQAReviewPrompt({
      name: input.name,
      region: input.region,
      lore: input.lore,
      statblock: input.statblock,
      citations: input.citations,
      artPrompt: input.artPrompt
    });
    
    const response = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a senior editor evaluating AI-generated content. Be CONSISTENT in your evaluations. Only flag actual problems, not preferences. Return only valid JSON without any markdown formatting or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1 // Lower temperature for more consistent results
    });

    const qaReviewText = response.choices[0]?.message?.content;
    if (!qaReviewText) {
      throw new Error('Failed to generate QA review');
    }

    try {
      // Extract JSON using the new utility function
      const qaReview = extractJsonWithFallback(qaReviewText);
      if (!qaReview) {
        throw new Error('Failed to extract valid JSON from QA review response');
      }
      return qaReview;
    } catch (parseError) {
      this.log('Failed to parse QA review JSON, retrying...');
      throw new Error(`Invalid JSON in QA review response: ${parseError}`);
    }
  }

  /**
   * Returns mock QA review for testing
   */
  private getMockQAReview(_input: any): any {
    // For issue-based refinement, progressively resolve issues
    const allIssues = [
      {
        severity: 'Major',
        category: 'Name Distinctiveness',
        issue: "The monster's name is too generic and doesn't reflect its unique characteristics.",
        suggestion: "Create a more distinctive name that captures the monster's unique features and cultural background."
      },
      {
        severity: 'Minor',
        category: 'Cultural Authenticity',
        issue: "The lore could better reflect the cultural traditions and beliefs of the region.",
        suggestion: "Enhance the cultural elements to better align with the region's folklore and mythology."
      },
      {
        severity: 'Minor',
        category: 'Stat Block Balance',
        issue: "The challenge rating seems slightly low for a creature with such abilities.",
        suggestion: "Consider adjusting the challenge rating to better match the creature's capabilities."
      }
    ];
    
    // Progressively resolve issues: 3 -> 2 -> 1 -> 0
    const remainingIssues = allIssues.slice(0, Math.max(0, 3 - this.callCount));
    
    return {
      overallScore: 3.0 + (this.callCount * 0.5), // Simple score progression
      status: remainingIssues.length === 0 ? 'acceptable' : 'needs_revision',
      issues: remainingIssues,
      summary: `Mock QA review #${this.callCount} - Issues remaining: ${remainingIssues.length}`,
      recommendations: [
        'Create a more distinctive name',
        'Enhance cultural authenticity',
        'Adjust challenge rating'
      ]
    };
  }
} 