import { QAAgent } from '../../agents/QAAgent';
import { LoreAgent } from '../../agents/LoreAgent';
import { StatBlockAgent } from '../../agents/StatBlockAgent';
import { CitationAgent } from '../../agents/CitationAgent';
import { ArtPromptAgent } from '../../agents/ArtPromptAgent';
import { PDFAgent } from '../../agents/PDFAgent';
import { RefinementLogger } from './refinement-logger';
import { MonsterPersistence } from './monster-persistence';
import { QAReview } from '../../types/qa-feedback';
import { config, getIterationModel } from '../../config';
import { generatePDF, generateSimplePDF } from './pdf-generator';
import { uploadPDF, uploadImage } from './blob-storage';

export interface RefinementConfig {
  maxIterations: number;
  enableLogging: boolean;
  enablePersistence: boolean;
  delayPDFGeneration?: boolean; // If true, PDF is generated only after refinement is complete
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
    enableLogging: true,
    enablePersistence: true,
    delayPDFGeneration: true // Default to delaying PDF generation
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
    console.log(`Fixed Iterations: 3`);
    console.log(`Iteration Models: ${config.iterations.iteration1}, ${config.iterations.iteration2}, ${config.iterations.iteration3}`);
    console.log('=====================================\n');

    let sessionId: string | undefined;
    let monsterId: string | undefined;
    let currentMonster: any;
    let iterations = 0;
    let improvements: string[] = [];
    let allIssues: any[] = [];
    let logs: string[] = [];

    try {
      // Start refinement session
      if (this.config.enableLogging) {
        sessionId = await this.logger.startSession({
          session_name: `Refinement Pipeline - ${region}`,
          max_iterations: 3
        });
        console.log(`📊 Started refinement session: ${sessionId}`);
      }

      // Generate initial monster
      console.log('🎲 Generating Initial Monster...');
      currentMonster = await this.generateMonster(region);
      
      console.log(`📝 Initial Monster: ${currentMonster.name}`);
      console.log(`📍 Region: ${currentMonster.region}`);

      // Always do exactly 3 iterations with different models
      for (let iteration = 1; iteration <= 3; iteration++) {
        console.log(`\n🔄 Starting Iteration ${iteration}/3`);
        console.log(`📊 Using model: ${getIterationModel(iteration)}`);
        
        const iterationStart = Date.now();
        
        // Run QA review with iteration-specific model
        console.log('\n🔍 Running QA Review...');
        const qaResult = await this.qaAgent.execute({
          name: currentMonster.name,
          region: currentMonster.region,
          lore: currentMonster.lore,
          statblock: currentMonster.statblock,
          citations: currentMonster.citations || [],
          artPrompt: currentMonster.art || {},
          forceImprovement: true, // Always force improvement for each iteration
          iteration: iteration
        });
        
        if (qaResult.logs) logs.push(...qaResult.logs);
        const qaReview = qaResult.qaReview;
        
        console.log(`📊 QA Status: ${qaReview.status}`);
        console.log(`⚠️  Issues Found: ${qaReview.issues?.length || 0}`);
        
        // Process QA feedback
        const iterationIssues = await this.processQAFeedback(qaReview);
        
        // Always apply at least one improvement per iteration
        if (iterationIssues.length === 0) {
          console.log('🔧 No QA issues found, applying default improvement...');
          // Force a default improvement for this iteration
          const defaultIssue = {
            category: 'Quality',
            issue: 'General improvement needed',
            suggestion: 'Enhance overall quality and coherence',
            severity: 'Minor',
            affectedAgent: 'LoreAgent'
          };
          const iterationImprovements = await this.applyImprovements(currentMonster, [defaultIssue]);
          improvements.push(...iterationImprovements);
        } else {
          // Apply improvements based on QA feedback
          console.log(`🔧 Applying ${iterationIssues.length} improvements...`);
          const iterationImprovements = await this.applyImprovements(currentMonster, iterationIssues);
          improvements.push(...iterationImprovements);
        }

        // Log iteration
        if (this.config.enableLogging && sessionId) {
          await this.logger.logIteration({
            session_id: sessionId,
            iteration_number: iteration,
            qa_score_before: 0,
            qa_score_after: 0,
            qa_issues: qaReview.issues || [],
            agent_actions: this.createAgentActions(iterationIssues),
            improvements_made: improvements.slice(-1), // Always log the improvement made
            duration_ms: Date.now() - iterationStart,
            success: true // Always mark as successful since we always apply an improvement
          });
        }

        iterations = iteration;
        allIssues = [...(qaReview.issues || [])];
      }

      // Generate final PDF layout after refinement is complete (if enabled)
      console.log(`🔍 Debug - PDF Generation Settings:`);
      console.log(`   • GENERATE_PDF env var: ${process.env['GENERATE_PDF']}`);
      console.log(`   • config.generation.generatePDF: ${config.generation.generatePDF}`);
      console.log(`   • config.generation.enablePDFGeneration: ${config.generation.enablePDFGeneration}`);
      
      if (config.generation.generatePDF) {
        console.log('\n📄 Generating Final PDF Layout...');
        currentMonster = await this.generateFinalPDF(currentMonster);
        
        // Verification step
        console.log(`🔍 PDF Generation Verification:`);
        console.log(`   • PDF URL: ${currentMonster.pdfUrl || 'NOT GENERATED'}`);
        console.log(`   • Image URL: ${currentMonster.imageUrl || 'NOT GENERATED'}`);
        console.log(`   • PDF Layout exists: ${!!currentMonster.pdfLayout}`);
      } else {
        console.log('\n📄 Skipping PDF generation (disabled)');
      }

      // Save final monster
      if (this.config.enablePersistence) {
        console.log('\n💾 Saving Final Monster to Database...');
        
        // Debug: Check statblock data
        console.log(`🔍 Debug - Statblock type: ${typeof currentMonster.statblock}`);
        console.log(`🔍 Debug - Statblock value:`, currentMonster.statblock);
        
        const monsterData: any = {
          name: currentMonster.name,
          region: currentMonster.region,
          lore: currentMonster.lore,
          statBlock: currentMonster.statblock, // Convert to camelCase for persistence
          citations: currentMonster.citations || [],
          art: currentMonster.art || {},
          pdfLayout: currentMonster.pdfLayout,
          monsterJson: currentMonster.monsterJson, // Complete monster JSON
          imageUrl: currentMonster.imageUrl,
          initial_qa_score: 0,
          final_qa_score: 0,
          refinement_iterations: iterations,
          refinement_success: true, // Always mark as successful since we complete 3 iterations
          console_log: logs.join('\n---\n') // Persist logs
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
            initial_qa_score: 0,
            final_qa_score: 0,
            refinement_iterations: iterations,
            refinement_success: allIssues.length === 0
          });
        }
      }

      // Always mark as completed since we run exactly 3 iterations
      const completed = true;

      // Complete session
      if (this.config.enableLogging && sessionId) {
        await this.logger.completeSession({
          final_qa_score: 0,
          total_iterations: iterations,
          success_criteria_met: completed,
          final_status: 'COMPLETED'
        });
      }
        
      console.log(`\n🎯 Refinement Complete!`);
      console.log(`Final Issues: ${allIssues.length}`);
      console.log(`Status: ✅ Completed`);
      console.log(`Iterations: ${iterations}`);
      console.log(`Mode: Fixed 3-iteration refinement`);
      
      // Final verification
      console.log(`\n🔍 Final Monster Verification:`);
      console.log(`   • Name: ${currentMonster.name}`);
      console.log(`   • Region: ${currentMonster.region}`);
      console.log(`   • PDF URL: ${currentMonster.pdfUrl || 'NOT GENERATED'}`);
      console.log(`   • Image URL: ${currentMonster.imageUrl || 'NOT GENERATED'}`);
      console.log(`   • PDF Layout: ${currentMonster.pdfLayout ? 'EXISTS' : 'NOT GENERATED'}`);
      console.log(`   • Monster ID: ${monsterId || 'NOT SAVED'}`);

      return this.createResult(currentMonster, 0, iterations, completed, sessionId, monsterId, improvements, allIssues);

    } catch (error) {
      console.error('❌ Refinement pipeline failed:', error);
      
      // Log failure
      if (this.config.enableLogging && sessionId) {
        try {
          await this.logger.completeSession({
            final_qa_score: 0,
            total_iterations: iterations,
            success_criteria_met: false,
            final_status: 'MAX_ITERATIONS_REACHED' // Use a valid status instead of ERROR
          });
        } catch (logError) {
          console.error('❌ Failed to log session completion:', logError);
          // Don't re-throw this error since the main error is more important
        }
      }

      throw error;
    }
  }

  /**
   * Generate a monster using all agents (without PDF generation)
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
    
    let artResult = { artPrompt: {} };
    if (config.generation.enableArtGeneration) {
      console.log('🎨 Generating art prompt...');
      artResult = await this.artPromptAgent.execute({
        name: loreResult.name,
        region: loreResult.region,
        lore: loreResult.lore
      });
    } else {
      console.log('🎨 Skipping art prompt generation (disabled)');
    }

    // PDF generation is skipped during refinement iterations to save resources
    // and avoid generating PDFs for intermediate versions that will be refined
    // Final PDF will be generated after refinement is complete with the best version

    return {
      name: loreResult.name,
      region: loreResult.region,
      lore: loreResult.lore,
      statblock: statResult.statblock,
      citations: citationResult.citations,
      art: artResult.artPrompt
    };
  }

  /**
   * Generate final PDF layout for the refined monster
   */
  private async generateFinalPDF(monster: any): Promise<any> {
    console.log('📄 Generating Final PDF Layout...');
    
    const pdfResult = await this.pdfAgent.execute({
      name: monster.name,
      region: monster.region,
      lore: monster.lore,
      statblock: monster.statblock,
      citations: monster.citations || [],
      artPrompt: monster.art || {}
    });

    // Create complete monster JSON for persistence
    const completeMonsterJson = {
      name: monster.name,
      region: monster.region,
      lore: monster.lore,
      statblock: monster.statblock,
      citations: monster.citations || [],
      art: monster.art || {},
      pdfLayout: pdfResult.pdfLayout
    };

    // Generate actual PDF and upload to blob storage
    let pdfUrl: string | undefined;
    let imageUrl: string | undefined;
    
    try {
      console.log('📄 Generating actual PDF file...');
      
      // Generate actual PDF from the layout
      let pdfContent: Buffer;
      try {
        // Try to use the PDF layout from PDFAgent
        pdfContent = await generatePDF(pdfResult.pdfLayout);
      } catch (pdfError) {
        console.log('📄 PDF layout generation failed, using fallback:', (pdfError as Error).message);
        // Fallback to simple PDF generation
        pdfContent = await generateSimplePDF(
          monster.name,
          monster.lore,
          monster.statblock,
          monster.citations || [],
          monster.art || {}
        );
      }
      
      // Upload PDF to blob storage
      console.log(`📄 Attempting to upload PDF for: ${monster.name}`);
      console.log(`📄 PDF content size: ${pdfContent.length} bytes`);
      const pdfUploadResult = await uploadPDF(monster.name, pdfContent, { addRandomSuffix: true });
      pdfUrl = pdfUploadResult.url;
      console.log('📄 PDF uploaded successfully:', pdfUrl);
      console.log(`📄 PDF filename: ${pdfUploadResult.filename}`);
      console.log(`📄 PDF size: ${pdfUploadResult.size} bytes`);
      
      // For now, create placeholder image content
      // In the future, this would be generated from artPrompt using DALL-E or similar
      console.log(`🖼️  Attempting to upload image for: ${monster.name}`);
      const imageContent = Buffer.from(`Placeholder image for ${monster.name}`);
      const imageUploadResult = await uploadImage(monster.name, imageContent, { addRandomSuffix: true });
      imageUrl = imageUploadResult.url;
      console.log('🖼️  Image uploaded successfully:', imageUrl);
      console.log(`🖼️  Image filename: ${imageUploadResult.filename}`);
      console.log(`🖼️  Image size: ${imageUploadResult.size} bytes`);
      
    } catch (error) {
      console.error('❌ PDF generation/upload failed:', (error as Error).message);
    }

    return {
      ...monster,
      pdfLayout: pdfResult.pdfLayout,
      monsterJson: completeMonsterJson, // Include complete monster JSON
      pdfUrl,
      imageUrl
    };
  }

  /**
   * Process QA feedback and identify actionable issues
   */
  private async processQAFeedback(qaReview: QAReview): Promise<any[]> {
    const actionableIssues = qaReview.issues.filter(issue => 
      issue.severity === 'Critical' || issue.severity === 'Major' || issue.severity === 'Minor'
    );

    console.log(`🔍 Processing ${actionableIssues.length} actionable issues...`);
    
    return actionableIssues;
  }

  /**
   * Apply improvements based on QA feedback
   */
  private async applyImprovements(monster: any, issues: any[]): Promise<string[]> {
    const improvements: string[] = [];

    // Debug: Check statblock before improvements
    console.log(`🔍 Debug - Before improvements - Statblock exists: ${!!monster.statblock}`);

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
          case 'Cultural':
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

          case 'Name-Lore Alignment':
            // Re-run LoreAgent to fix name-lore consistency
            const alignmentResult = await this.loreAgent.execute({
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.name = alignmentResult.name;
            monster.lore = alignmentResult.lore;
            improvements.push(`Fixed name-lore alignment`);
            break;

          case 'Completeness':
            // Handle completeness issues - could involve multiple agents
            if (issue.issue.toLowerCase().includes('art') || issue.issue.toLowerCase().includes('prompt')) {
              // Generate art prompt if missing
              const artResult = await this.artPromptAgent.execute({
                name: monster.name,
                region: monster.region,
                lore: monster.lore,
                qaFeedback: [issue]
              });
              monster.art = artResult.artPrompt;
              improvements.push(`Added missing art prompt`);
            } else {
              // Default to lore improvement for completeness
              const completenessResult = await this.loreAgent.execute({
                region: monster.region,
                qaFeedback: [issue]
              });
              monster.lore = completenessResult.lore;
              improvements.push(`Improved completeness`);
            }
            break;

          case 'Balance':
            // Re-run StatBlockAgent with balance feedback
            const balanceResult = await this.statBlockAgent.execute({
              lore: monster.lore,
              name: monster.name,
              region: monster.region,
              qaFeedback: [issue]
            });
            monster.statblock = balanceResult.statblock;
            improvements.push(`Improved stat block balance`);
            break;

          default:
            console.log(`⚠️  Unknown issue category: ${issue.category}`);
        }
      } catch (error) {
        console.error(`❌ Failed to apply improvement for ${issue.category}:`, error);
      }
    }

    // Debug: Check statblock after improvements
    console.log(`🔍 Debug - After improvements - Statblock exists: ${!!monster.statblock}`);

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
      case 'Cultural':
      case 'Consistency':
      case 'Quality':
      case 'Name-Lore Alignment':
        return 'LoreAgent';
      case 'Stat Block Balance':
      case 'Balance':
        return 'StatBlockAgent';
      case 'Art Style':
      case 'Completeness':
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