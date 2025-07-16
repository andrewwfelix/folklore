import { RefinementLogger } from './refinement-logger';
import { MonsterPersistence } from './monster-persistence';
import { QAAgent } from '../../agents/QAAgent';
import { LoreAgent } from '../../agents/LoreAgent';
import { StatBlockAgent } from '../../agents/StatBlockAgent';
import { CitationAgent } from '../../agents/CitationAgent';
import { ArtPromptAgent } from '../../agents/ArtPromptAgent';
import { PDFAgent } from '../../agents/PDFAgent';
import { classifyQAIssues } from './qa-classification';
import { QAReview } from '../../types/qa-feedback';

export interface RefinementConfig {
  maxIterations: number;
  targetQAScore: number;
  enableLogging: boolean;
  enablePersistence: boolean;
}

export interface RefinementResult {
  monster: any;
  finalQAScore: number;
  iterations: number;
  success: boolean;
  sessionId?: string | undefined;
  monsterId?: string | undefined;
  improvements: string[];
  issues: any[];
}

export class RefinementPipeline {
  private logger: RefinementLogger;
  private persistence: MonsterPersistence;
  private qaAgent: QAAgent;
  private loreAgent: LoreAgent;
  private statBlockAgent: StatBlockAgent;
  private citationAgent: CitationAgent;
  private artPromptAgent: ArtPromptAgent;
  private pdfAgent: PDFAgent;
  private config: RefinementConfig;

  constructor(config: RefinementConfig = {
    maxIterations: 3,
    targetQAScore: 4.0,
    enableLogging: true,
    enablePersistence: true
  }) {
    this.logger = new RefinementLogger();
    this.persistence = new MonsterPersistence();
    this.qaAgent = new QAAgent('refinement-pipeline');
    this.loreAgent = new LoreAgent('refinement-pipeline');
    this.statBlockAgent = new StatBlockAgent('refinement-pipeline');
    this.citationAgent = new CitationAgent('refinement-pipeline');
    this.artPromptAgent = new ArtPromptAgent('refinement-pipeline');
    this.pdfAgent = new PDFAgent('refinement-pipeline');
    this.config = config;
  }

  /**
   * Run the full refinement pipeline
   */
  async refineMonster(region: string): Promise<RefinementResult> {
    console.log('🚀 Starting Refinement Pipeline');
    console.log(`Target QA Score: ${this.config.targetQAScore}`);
    console.log(`Max Iterations: ${this.config.maxIterations}`);
    console.log('=====================================\n');

    let sessionId: string | undefined;
    let monsterId: string | undefined;
    let currentMonster: any;
    let currentQAScore = 0;
    let iterations = 0;
    let improvements: string[] = [];
    let allIssues: any[] = [];

    try {
      // Start refinement session
      if (this.config.enableLogging) {
        sessionId = await this.logger.startSession({
          session_name: `Refinement Pipeline - ${region}`,
          max_iterations: this.config.maxIterations
        });
        console.log(`📊 Started refinement session: ${sessionId}`);
      }

      // Generate initial monster
      console.log('🎲 Generating Initial Monster...');
      currentMonster = await this.generateMonster(region);
      
      console.log(`📝 Initial Monster: ${currentMonster.name}`);
      console.log(`📍 Region: ${currentMonster.region}`);

      // Initial QA review
      console.log('\n🔍 Running Initial QA Review...');
      const initialQA = await this.runQAReview(currentMonster);
      currentQAScore = initialQA.overallScore;
      allIssues = [...initialQA.issues];

      console.log(`📊 Initial QA Score: ${currentQAScore}/5.0`);
      console.log(`⚠️  Issues Found: ${initialQA.issues.length}`);

      // Log initial iteration
      if (this.config.enableLogging && sessionId) {
        await this.logger.logIteration({
          session_id: sessionId,
          iteration_number: 0,
          qa_score_before: 0,
          qa_score_after: currentQAScore,
          qa_issues: initialQA.issues,
          agent_actions: [],
          improvements_made: [],
          duration_ms: 0,
          success: false
        });
      }

      // Check if we already meet the target score
      if (currentQAScore >= this.config.targetQAScore) {
        console.log('✅ Initial monster already meets target QA score!');
        return this.createResult(currentMonster, currentQAScore, iterations, true, sessionId, undefined, improvements, allIssues);
      }

      // Iterative refinement loop
      for (let iteration = 1; iteration <= this.config.maxIterations; iteration++) {
        console.log(`\n🔄 Starting Iteration ${iteration}/${this.config.maxIterations}`);
        
        const iterationStart = Date.now();
        const iterationIssues = await this.processQAFeedback(initialQA);
        
        if (iterationIssues.length === 0) {
          console.log('✅ No actionable issues found - stopping refinement');
          break;
        }

        // Apply improvements based on QA feedback
        const iterationImprovements = await this.applyImprovements(currentMonster, iterationIssues);
        improvements.push(...iterationImprovements);

        // Run QA review on improved monster
        console.log('\n🔍 Running QA Review on Improved Monster...');
        const iterationQA = await this.runQAReview(currentMonster);
        const previousScore = currentQAScore;
        currentQAScore = iterationQA.overallScore;
        allIssues = [...iterationQA.issues];

        console.log(`📊 QA Score: ${currentQAScore}/5.0 (was ${previousScore}/5.0)`);
        console.log(`⚠️  Remaining Issues: ${iterationQA.issues.length}`);

        // Log iteration
        if (this.config.enableLogging && sessionId) {
          await this.logger.logIteration({
            session_id: sessionId,
            iteration_number: iteration,
            qa_score_before: previousScore,
            qa_score_after: currentQAScore,
            qa_issues: iterationQA.issues,
            agent_actions: this.createAgentActions(iterationIssues),
            improvements_made: iterationImprovements,
            duration_ms: Date.now() - iterationStart,
            success: currentQAScore > previousScore
          });
        }

        iterations = iteration;

        // Check if we've reached the target score
        if (currentQAScore >= this.config.targetQAScore) {
          console.log('✅ Target QA score reached!');
          break;
        }

        // Check if we're not improving
        if (currentQAScore <= previousScore) {
          console.log('⚠️  No improvement detected - stopping refinement');
          break;
        }
      }

      // Save final monster
      if (this.config.enablePersistence) {
        console.log('\n💾 Saving Final Monster to Database...');
        const monsterData: any = {
          name: currentMonster.name,
          region: currentMonster.region,
          lore: currentMonster.lore,
          statblock: currentMonster.statblock,
          citations: currentMonster.citations || [],
          art: currentMonster.art || {},
          pdfLayout: currentMonster.pdfLayout,
          imageUrl: currentMonster.imageUrl,
          initial_qa_score: initialQA.overallScore,
          final_qa_score: currentQAScore,
          refinement_iterations: iterations,
          refinement_success: currentQAScore >= this.config.targetQAScore
        };

        // Only add refinement_session_id if it exists
        if (sessionId) {
          monsterData.refinement_session_id = sessionId;
        }

        monsterId = await this.persistence.saveMonster(monsterData);
        console.log(`✅ Saved monster with ID: ${monsterId}`);

        // Update monster with refinement metadata
        if (sessionId) {
          await this.logger.updateMonsterRefinement(monsterId, sessionId, {
            initial_qa_score: initialQA.overallScore,
            final_qa_score: currentQAScore,
            refinement_iterations: iterations,
            refinement_success: currentQAScore >= this.config.targetQAScore
          });
        }
      }

      // Complete session
      if (this.config.enableLogging && sessionId) {
        await this.logger.completeSession({
          final_qa_score: currentQAScore,
          total_iterations: iterations,
          success_criteria_met: currentQAScore >= this.config.targetQAScore,
          final_status: currentQAScore >= this.config.targetQAScore ? 'SUCCESS' : 'MAX_ITERATIONS_REACHED'
        });
      }

      const success = currentQAScore >= this.config.targetQAScore;
      console.log(`\n🎯 Refinement Complete!`);
      console.log(`Final QA Score: ${currentQAScore}/5.0`);
      console.log(`Success: ${success ? '✅' : '❌'}`);
      console.log(`Iterations: ${iterations}`);

      return this.createResult(currentMonster, currentQAScore, iterations, success, sessionId, monsterId, improvements, allIssues);

    } catch (error) {
      console.error('❌ Refinement pipeline failed:', error);
      
      // Log failure
      if (this.config.enableLogging && sessionId) {
        await this.logger.completeSession({
          final_qa_score: currentQAScore,
          total_iterations: iterations,
          success_criteria_met: false,
          final_status: 'ERROR'
        });
      }

      throw error;
    }
  }

  /**
   * Generate a monster using all agents
   */
  private async generateMonster(region: string): Promise<any> {
    console.log('🎭 Generating lore...');
    const loreResult = await this.loreAgent.execute({ region });
    
    // Ensure we have required properties
    if (!loreResult.name || !loreResult.region || !loreResult.lore) {
      throw new Error('LoreAgent failed to generate required properties');
    }
    
    console.log('⚔️  Generating stat block...');
    const statResult = await this.statBlockAgent.execute({
      name: loreResult.name,
      region: loreResult.region,
      lore: loreResult.lore
    });
    
    console.log('📚 Generating citations...');
    const citationResult = await this.citationAgent.execute({
      name: loreResult.name,
      region: loreResult.region,
      description: loreResult.lore
    });
    
    console.log('🎨 Generating art prompt...');
    const artResult = await this.artPromptAgent.execute({
      name: loreResult.name,
      region: loreResult.region,
      lore: loreResult.lore
    });
    
    console.log('📄 Generating PDF layout...');
    const pdfResult = await this.pdfAgent.execute({
      name: loreResult.name,
      region: loreResult.region,
      lore: loreResult.lore,
      statblock: statResult.statblock,
      citations: citationResult.citations,
      artPrompt: artResult.artPrompt
    });

    return {
      name: loreResult.name,
      region: loreResult.region,
      lore: loreResult.lore,
      statblock: statResult.statblock,
      citations: citationResult.citations,
      art: artResult.artPrompt,
      pdfLayout: pdfResult.pdfLayout
    };
  }

  /**
   * Run QA review on a monster
   */
  private async runQAReview(monster: any): Promise<QAReview> {
    const result = await this.qaAgent.execute({
      name: monster.name,
      region: monster.region,
      lore: monster.lore,
      statblock: monster.statblock || {},
      citations: monster.citations || [],
      artPrompt: monster.art || {}
    });

    const classifiedIssues = classifyQAIssues(result.qaReview);
    
    return {
      ...result.qaReview,
      issues: classifiedIssues
    };
  }

  /**
   * Process QA feedback and identify actionable issues
   */
  private async processQAFeedback(qaReview: QAReview): Promise<any[]> {
    const actionableIssues = qaReview.issues.filter(issue => 
      issue.severity === 'Critical' || issue.severity === 'Major'
    );

    console.log(`🔍 Processing ${actionableIssues.length} actionable issues...`);
    
    return actionableIssues;
  }

  /**
   * Apply improvements based on QA feedback
   */
  private async applyImprovements(monster: any, issues: any[]): Promise<string[]> {
    const improvements: string[] = [];

    for (const issue of issues) {
      console.log(`🔧 Applying improvement for: ${issue.category} - ${issue.issue}`);

      try {
        switch (issue.category) {
          case 'Name Distinctiveness':
            // Re-run LoreAgent with name feedback
            const nameResult = await this.loreAgent.execute({
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.name = nameResult.name;
            monster.lore = nameResult.lore;
            improvements.push(`Enhanced name: ${monster.name}`);
            break;

          case 'Stat Block Balance':
            // Re-run StatBlockAgent with balance feedback
            const statResult = await this.statBlockAgent.execute({
              lore: monster.lore,
              name: monster.name,
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.statblock = statResult.statblock;
            improvements.push(`Improved stat block balance`);
            break;

          case 'Cultural Authenticity':
            // Re-run LoreAgent with cultural feedback
            const culturalResult = await this.loreAgent.execute({
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.lore = culturalResult.lore;
            improvements.push(`Improved cultural authenticity`);
            break;

          case 'Consistency':
            // Re-run LoreAgent with consistency feedback
            const consistencyResult = await this.loreAgent.execute({
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.lore = consistencyResult.lore;
            improvements.push(`Fixed consistency issues`);
            break;

          case 'Quality':
            // Re-run LoreAgent with quality feedback
            const qualityResult = await this.loreAgent.execute({
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.lore = qualityResult.lore;
            improvements.push(`Improved overall quality`);
            break;

          default:
            console.log(`⚠️  Unknown issue category: ${issue.category}`);
        }
      } catch (error) {
        console.error(`❌ Failed to apply improvement for ${issue.category}:`, error);
      }
    }

    return improvements;
  }

  /**
   * Create agent actions for logging
   */
  private createAgentActions(issues: any[]): any[] {
    return issues.map(issue => ({
      agent_name: this.getAgentNameForIssue(issue.category),
      feedback_received: issue.issue,
      action_taken: `Applied ${issue.category} improvement`,
      duration_ms: 0, // Would need to track actual duration
      success: true
    }));
  }

  /**
   * Get agent name for issue category
   */
  private getAgentNameForIssue(issueCategory: string): string {
    switch (issueCategory) {
      case 'Name Distinctiveness':
      case 'Cultural Authenticity':
      case 'Consistency':
      case 'Quality':
        return 'LoreAgent';
      case 'Stat Block Balance':
        return 'StatBlockAgent';
      case 'Art Style':
        return 'ArtPromptAgent';
      default:
        return 'UnknownAgent';
    }
  }

  /**
   * Create refinement result
   */
  private createResult(
    monster: any, 
    qaScore: number, 
    iterations: number, 
    success: boolean, 
    sessionId?: string, 
    monsterId?: string, 
    improvements: string[] = [], 
    issues: any[] = []
  ): RefinementResult {
    return {
      monster,
      finalQAScore: qaScore,
      iterations,
      success,
      sessionId,
      monsterId,
      improvements,
      issues
    };
  }
} 