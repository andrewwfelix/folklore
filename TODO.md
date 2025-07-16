# TODO List

## Current Tasks

### High Priority
- [x] **Test Full Refinement Pipeline**: Verify that the refinement loop properly incorporates QA feedback and improves monster quality.
    - [x] Run generate:refinement with target score 4.8 to force iterations
    - [x] Verify that LoreAgent receives and processes feedback correctly
    - [x] Verify that StatBlockAgent receives and processes feedback correctly
    - [x] Verify that ArtPromptAgent receives and processes feedback correctly
    - [x] Check that QA scores improve after refinement iterations
    - [x] Fix any database constraint issues with statblock persistence
    - [x] Ensure session logging works correctly throughout iterations
- [x] **Delay PDF Generation**: Move PDF generation to after refinement completion to avoid generating PDFs for monsters that will be refined.
    - [x] Modify RefinementPipeline to skip PDF generation during iterations
    - [x] Add PDF generation as final step after refinement loop completes
    - [x] Update generate-with-refinement.ts to handle PDF generation timing
    - [x] Ensure PDF includes final refined monster data (lore, stats, citations, art)
    - [x] Update blob storage to only upload final PDF, not intermediate versions
- [ ] **Implement Unified AI Provider System**: Create abstraction layer to support multiple AI providers (OpenAI, Anthropic, Together AI, etc.)
    - [ ] Research and evaluate unified AI API providers (Together AI, OpenRouter, Fireworks AI, etc.)
    - [ ] Design unified AI client interface
    - [ ] Implement provider-specific adapters
    - [ ] Update config system to support multiple providers
    - [ ] Add environment variables for provider selection
    - [ ] Test with different providers
- [ ] **Factor Out Model Definitions**: Move all OpenAI and DALL-E model definitions to config files and remove hardcoded model names from code.
    - [ ] Un-hardcode model in LoreAgent (src/agents/LoreAgent.ts)
    - [ ] Un-hardcode model in StatBlockAgent (src/agents/StatBlockAgent.ts)
    - [ ] Un-hardcode model in CitationAgent (src/agents/CitationAgent.ts)
    - [ ] Un-hardcode model in ArtPromptAgent (src/agents/ArtPromptAgent.ts)
    - [ ] Un-hardcode model in QAAgent (src/agents/QAAgent.ts)
    - [ ] Un-hardcode model in PDFAgent (src/agents/PDFAgent.ts)
    - [ ] Un-hardcode model in test scripts (e.g., tests/integration/openai/openai.test.ts)
- [x] **QA Feedback Loop**: Ensure that if the QA agent has feedback, the system provides an opportunity to send that feedback back into the relevant agent(s) for revision or rerun.
- [x] **QA Feedback Incorporation**: Implement mechanism to automatically rerun specific agents (e.g., Lore Agent for name issues, StatBlock Agent for balance issues) based on QA feedback.

## QA Algorithm Implementation

### Phase 1: Analysis & Classification ✅ COMPLETED
- [x] **QA Issue Classification**: Categorize QA issues by type (name, balance, cultural, art) and identify target agents
- [x] **Issue Severity Mapping**: Map issue severity (Critical/Major/Minor) to priority levels for agent routing

### Phase 2: Intelligent Routing ✅ COMPLETED
- [x] **Feedback Routing Logic**: Route issues to appropriate agents (Name → LoreAgent, Balance → StatBlockAgent, etc.)
- [x] **Action Plan Generation**: Create specific instructions for each agent based on QA feedback

### Phase 3: Iterative Refinement Loop ✅ COMPLETED
- [x] **Refinement Session Logging**: Implement session tracking with iterations, QA scores, and agent actions
- [x] **Database Persistence**: Save monsters with refinement metadata to separate tables
- [x] **QA Review Loop**: Implement iterative process (max 3 iterations) with QA review at each step
- [x] **Success Criteria**: Define when to stop (QA score ≥ 4.0 OR max iterations reached)
- [x] **Fallback Strategy**: Return best version if improvements fail
- [x] **Full Refinement Pipeline**: Orchestrate all agents, QA, and logging in a single pipeline
- [x] **QA Issue Display**: Fix display of QA issues in test script

### Phase 4: Agent Enhancement ✅ COMPLETED
- [x] **Agent Feedback Integration**: Modify each agent to accept `qaFeedback` parameter
- [x] **LoreAgent Enhancement**: Implement feedback processing for name distinctiveness and cultural authenticity
- [x] **StatBlockAgent Enhancement**: Implement feedback processing for balance and CR adjustments
- [x] **ArtPromptAgent Enhancement**: Implement feedback processing for art style and description improvements
- [x] **Agent Feedback Processing**: Add logic to each agent to respond to specific feedback types

### Phase 5: Quality Tracking
- [ ] **Metrics Collection**: Track success rates, iterations per monster, agent effectiveness
- [ ] **Performance Monitoring**: Monitor common issues and improvement rates
- [ ] **System Optimization**: Use metrics to refine the algorithm

## Next Priority Tasks

### Unified AI Provider System
- [ ] **Research and Evaluate AI Providers**: Comprehensive analysis of unified AI API providers
    - [ ] **Together AI**: Evaluate pricing, model availability, API quality, and reliability
    - [ ] **OpenRouter**: Compare aggregation features, supported models, and cost structure
    - [ ] **Fireworks AI**: Assess their own models vs. third-party integration
    - [ ] **Anthropic**: Direct Claude API vs. through aggregators
    - [ ] **Groq**: Evaluate speed vs. cost trade-offs
    - [ ] **Perplexity AI**: Check their unified API offerings
    - [ ] **Compare pricing**: Cost per token for different models across providers
    - [ ] **Compare reliability**: Uptime, response times, error rates
    - [ ] **Compare features**: Model availability, API consistency, documentation
    - [ ] **Make recommendation**: Choose best provider based on cost, reliability, and features
- [x] **Choose OpenRouter**: Selected OpenRouter as the unified AI provider
- [ ] **Implement OpenRouter Integration**: Complete rework to use OpenRouter with per-component model selection
    - [ ] **Environment Configuration**: Add OpenRouter API key and model configuration variables
        - [ ] Add OPENROUTER_API_KEY environment variable
        - [ ] Add OPENROUTER_BASE_URL environment variable (default: https://openrouter.ai/api/v1)
        - [ ] Add per-component model variables:
            - [ ] OPENROUTER_LORE_MODEL (e.g., "anthropic/claude-3-sonnet")
            - [ ] OPENROUTER_STATBLOCK_MODEL (e.g., "openai/gpt-4")
            - [ ] OPENROUTER_CITATION_MODEL (e.g., "anthropic/claude-3-haiku")
            - [ ] OPENROUTER_ART_MODEL (e.g., "openai/gpt-4")
            - [ ] OPENROUTER_QA_MODEL (e.g., "anthropic/claude-3-sonnet")
            - [ ] OPENROUTER_PDF_MODEL (e.g., "openai/gpt-4")
        - [ ] Add fallback model configuration
    - [ ] **Update Config System**: Extend configuration to support OpenRouter
        - [ ] Add OpenRouter configuration section to src/config/index.ts
        - [ ] Add model mapping for each agent type
        - [ ] Add validation for OpenRouter configuration
        - [ ] Update environment variable loading
    - [ ] **Create OpenRouter Client**: Build unified client for OpenRouter API
        - [ ] Create src/lib/openrouter-client.ts
        - [ ] Implement chat completion interface
        - [ ] Implement image generation interface (if supported)
        - [ ] Add error handling and retry logic
        - [ ] Add request/response logging
        - [ ] Add rate limiting support
    - [ ] **Update Base Agent**: Modify BaseAgent to use OpenRouter client
        - [ ] Update BaseAgent.ts to accept model parameter
        - [ ] Add model selection logic
        - [ ] Update agent initialization
    - [ ] **Update Individual Agents**: Modify each agent to use OpenRouter with specific models
        - [ ] **LoreAgent**: Update to use OPENROUTER_LORE_MODEL
        - [ ] **StatBlockAgent**: Update to use OPENROUTER_STATBLOCK_MODEL
        - [ ] **CitationAgent**: Update to use OPENROUTER_CITATION_MODEL
        - [ ] **ArtPromptAgent**: Update to use OPENROUTER_ART_MODEL
        - [ ] **QAAgent**: Update to use OPENROUTER_QA_MODEL
        - [ ] **PDFAgent**: Update to use OPENROUTER_PDF_MODEL
    - [ ] **Update Test Scripts**: Modify test scripts to use OpenRouter
        - [ ] Update tests/integration/openai/openai.test.ts to test OpenRouter
        - [ ] Update individual agent test scripts
        - [ ] Update generate-with-refinement.ts
    - [ ] **Update Environment Files**: Add OpenRouter configuration
        - [ ] Update env.example with OpenRouter variables
        - [ ] Update debug-env.ts to show OpenRouter configuration
    - [ ] **Add Documentation**: Document OpenRouter integration
        - [ ] Add OpenRouter setup instructions to README.md
        - [ ] Document model selection strategy
        - [ ] Add troubleshooting guide
    - [ ] **Testing and Validation**: Ensure everything works with OpenRouter
        - [ ] Test each agent individually with OpenRouter
        - [ ] Test full refinement pipeline with OpenRouter
        - [ ] Test with different model combinations
        - [ ] Validate cost optimization
        - [ ] Test fallback mechanisms
- [ ] **Design Provider Interface**: Create abstraction layer for multiple AI providers
- [ ] **Implement Provider Adapters**: Build adapters for each supported provider
- [ ] **Update Configuration**: Extend config system to support provider selection
- [ ] **Environment Variables**: Add AI_PROVIDER, AI_API_KEY, AI_MODEL variables
- [ ] **Testing**: Test with different providers and models

### Database & Persistence Improvements
- [ ] **Fix PDF Agent JSON Parsing**: Resolve the "Failed to parse PDF layout JSON" issue to avoid fallback layouts
- [ ] **Improve QA Score Stability**: Investigate why QA scores sometimes decrease during refinement and implement better improvement strategies
- [ ] **Add More Issue Categories**: Expand agent feedback handling to cover all QA issue types (e.g., Citation relevance, Art style consistency)

### System Optimization
- [ ] **Remove Debug Logging**: Clean up debug console.log statements from production code
- [ ] **Performance Monitoring**: Add metrics collection for refinement success rates and iteration counts
- [ ] **Error Handling**: Improve error handling in refinement pipeline for better resilience

### Testing & Validation
- [ ] **Test with Different Regions**: Run the pipeline with various regions to ensure cultural diversity
- [ ] **Batch Processing Test**: Test generating multiple monsters in sequence
- [ ] **Full Pipeline Validation**: Verify end-to-end workflow from generation to PDF upload

## Optional Tasks
- [ ] **Persist Monsters on Initial Success**: Save monsters to the database even if no refinement is needed
- [ ] **Test with Lower QA Score**: Lower the target QA score to force the refinement loop to run
- [ ] **Test with Different Regions**: Run the pipeline with different regions for diversity
- [ ] **Improve PDF Agent**: Update PDF agent to return valid JSON layout (avoid fallback)
- [ ] **Remove Debug Logging**: Remove debug logging from qa-classification when satisfied
- [ ] **PDF Blob Upload Script**: Create a script to upload any local PDF file to blob storage for manual testing.
- [ ] **Full Pipeline Test**: Run the full monster generation pipeline and verify that the generated PDF is uploaded to blob storage and is viewable.
- [ ] **Feedback Quality Metrics**: Implement tracking for QA feedback effectiveness (iterations per monster, success rate, average final score, common issues).
- [ ] **Batch Processing Enhancement**: Add batch processing mode that generates all monsters first, then refines only those needing revision based on QA feedback.
- [ ] **Advanced Feedback Parsing**: Implement sophisticated feedback parsing to extract specific instructions from QA suggestions and route them to appropriate agents.

## Completed Tasks
- [x] **PDF Generation**: Add PDFKit-based PDF generation utility and integrate with orchestrator
- [x] **PDF Testing**: Add test script for PDF output verification
- [x] **Blob Storage**: Implement blob storage utility for uploading PDFs and images
- [x] **Agent Orchestration**: Create orchestrator that runs all agents in sequence
- [x] **Individual Agent Tests**: Create test scripts for each agent (Lore, StatBlock, Citation, ArtPrompt, QA, PDF)
- [x] **Database Schema**: Create comprehensive schema with separate tables for monsters, citations, art prompts, reviews, and generation history
- [x] **Persistence Layer**: Implement monster persistence with proper table relationships
- [x] **Refinement Logging**: Implement session tracking and iteration logging
- [x] **QA Classification**: Implement issue classification and routing logic
- [x] **Full Refinement Pipeline**: Orchestrate all agents, QA, and logging in a single pipeline
- [x] **QA Issue Display**: Fix display of QA issues in test script
- [x] **Database Persistence Fix**: Resolve statblock property name mismatch causing null database saves
- [x] **Issue Category Handling**: Add support for all QA agent issue categories (Cultural, Balance, etc.)
- [x] **Refinement Loop Enhancement**: Include Minor severity issues in refinement processing

## Notes
- PDF generation now uses PDFKit with built-in fonts for maximum compatibility
- All agents are working and integrated into the orchestrator
- Blob storage is configured for file uploads
- Database persistence correctly saves to separate tables (monsters, citations, art_prompts)
- QA agent provides feedback and refinement pipeline successfully incorporates it
- QA agent enhanced to specifically check for name distinctiveness and avoid generic names like "Troll", "Dragon", "Spirit"
- QA feedback incorporation algorithm designed with 5 phases: Analysis, Routing, Iterative Refinement, Agent-Specific Handling, and Quality Metrics
- Database tables are in expected state: main tables populated, metadata tables empty (as designed)
- **Database persistence issue resolved**: Fixed statblock property name mismatch
- **Refinement pipeline working**: Successfully processes QA feedback and saves monsters to database
- **PDF generation delayed**: PDFs are now generated only after refinement completion to save resources 