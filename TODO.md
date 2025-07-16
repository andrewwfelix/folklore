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
- [ ] **Fix Agent Unit Test Mocking**: Resolve OpenAI constructor mocking issues in Jest unit tests and establish consistent testing patterns across all agents.
    - [ ] **Fix LoreAgent Jest Mock**: Resolve "openai_1.default is not a constructor" error in tests/unit/agents/LoreAgent.test.ts
    - [ ] **Investigate Mock Strategy**: Determine if Jest mocking or script-based testing is preferred for agent tests
    - [ ] **Create Consistent Test Pattern**: Either create Jest unit tests for all agents with proper mocking, or remove Jest tests and rely on script-based tests
    - [ ] **Update Test Documentation**: Document the chosen testing approach and provide examples for future agent tests
    - [ ] **Consider Mock Alternatives**: Evaluate using dependency injection or service layer abstraction to make agents more testable
    - [ ] **Test Coverage Analysis**: Ensure all agents have adequate test coverage (currently only LoreAgent has Jest unit test, others use script tests)
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

### UI Development - Next.js Dashboard
- [ ] **Setup Next.js Dashboard Project**: Create new Next.js application for monster generation UI
    - [ ] Initialize Next.js project with TypeScript and Tailwind CSS
    - [ ] Set up project structure and routing
    - [ ] Configure API routes for backend integration
    - [ ] Add authentication (if needed)
    - [ ] Set up development environment
- [ ] **Dashboard Overview Page**: Create main dashboard with overview and quick actions
    - [ ] Design dashboard layout with stats cards
    - [ ] Add real-time generation status display
    - [ ] Create quick action buttons (start generation, view recent monsters)
    - [ ] Add QA score summary and success rate metrics
    - [ ] Implement WebSocket connection for live updates
    - [ ] Add progress indicators for active generations
- [ ] **Generation Page**: Interface for starting and monitoring monster generation
    - [ ] Create generation form with region selection and settings
    - [ ] Add real-time progress tracking for each generation step
    - [ ] Display current agent activity (Lore, StatBlock, Citation, etc.)
    - [ ] Show QA review results and refinement status
    - [ ] Add ability to pause/resume generation
    - [ ] Implement error handling and retry mechanisms
- [ ] **Monsters Page**: Browse and manage all generated monsters
    - [ ] Create monster list with filtering and search
    - [ ] Add monster detail view with all data (lore, stats, citations, art)
    - [ ] Implement PDF preview and download functionality
    - [ ] Add QA score display and refinement history
    - [ ] Create bulk actions (delete, re-run refinement, export)
    - [ ] Add sorting by date, region, QA score, etc.
- [ ] **Refinement Page**: View and manage refinement sessions
    - [ ] Display refinement session list with status and metrics
    - [ ] Show detailed iteration history for each session
    - [ ] Visualize QA score improvements over iterations
    - [ ] Display agent actions and feedback processing
    - [ ] Add ability to re-run refinement on existing monsters
    - [ ] Show common issues and improvement patterns
- [ ] **Analytics Page**: Comprehensive metrics and insights
    - [ ] Create QA score distribution charts
    - [ ] Show refinement success rates and iteration counts
    - [ ] Display common issue categories and trends
    - [ ] Add cost tracking and usage metrics
    - [ ] Show agent performance and effectiveness
    - [ ] Create exportable reports and data visualization
- [ ] **Database Explorer Page**: Direct database browsing and management
    - [ ] Create database table browser interface
    - [ ] Add monster data viewer with JSON formatting
    - [ ] Implement citation and art prompt browsing
    - [ ] Add refinement session data explorer
    - [ ] Create data export functionality
    - [ ] Add database health monitoring
- [ ] **Documentation Page**: Comprehensive documentation with Mermaid diagrams
    - [ ] Create documentation layout with navigation and sub-pages
    - [ ] **Architecture Documentation Page**:
        - [ ] Add system component diagram with detailed explanation
        - [ ] Document data flow between components
        - [ ] Explain agent orchestration and communication patterns
        - [ ] Add deployment architecture diagram
    - [ ] **Refinement Pipeline Documentation Page**:
        - [ ] Create detailed refinement flow diagram with explanation
        - [ ] Document QA feedback loop and issue classification
        - [ ] Explain iteration logic and stopping criteria
        - [ ] Add agent-specific improvement strategies
    - [ ] **Agent Documentation Page**:
        - [ ] Create agent interaction sequence diagram with explanation
        - [ ] Document each agent's purpose, inputs, and outputs
        - [ ] Add agent-specific prompt engineering details
        - [ ] Explain QA feedback integration for each agent
    - [ ] **Database Documentation Page**:
        - [ ] Create database schema diagram with entity relationships
        - [ ] Document table purposes and data flow
        - [ ] Explain refinement session tracking
        - [ ] Add data persistence patterns
    - [ ] **API Documentation Page**:
        - [ ] Create API endpoint diagram with request/response flows
        - [ ] Document each endpoint's purpose and parameters
        - [ ] Add authentication and error handling patterns
        - [ ] Include code examples and integration guides
    - [ ] **Deployment Documentation Page**:
        - [ ] Create deployment architecture diagram
        - [ ] Document environment setup and configuration
        - [ ] Add troubleshooting guides and common issues
        - [ ] Include performance optimization tips
    - [ ] **Development Roadmap Documentation Page**:
        - [ ] Create roadmap timeline diagram with current progress
        - [ ] Document completed phases and achievements
        - [ ] Add upcoming milestones and target dates
        - [ ] Include feature priorities and development phases
        - [ ] Show technical debt and improvement areas
        - [ ] Add resource allocation and team planning
        - [ ] Include risk assessment and mitigation strategies
    - [ ] **Design Patterns Documentation Page**:
        - [ ] Document Chain of Responsibility pattern in refinement process
        - [ ] Add Strategy pattern for different improvement strategies
        - [ ] Include Observer pattern for event-driven communication
        - [ ] Document State Machine pattern for refinement states
        - [ ] Add Pipeline pattern for modular processing stages
        - [ ] Create pattern interaction diagrams showing how patterns work together
        - [ ] Include code examples and implementation details
        - [ ] Add benefits and trade-offs for each pattern
    - [ ] **Documentation Repository Section**:
        - [x] Create centralized documentation content storage in `docs/content/`
        - [x] Add architecture documentation directory (`docs/content/architecture/`)
        - [x] Add refinement documentation directory (`docs/content/refinement/`)
        - [x] Add agents documentation directory (`docs/content/agents/`)
        - [x] Add database documentation directory (`docs/content/database/`)
        - [x] Add API documentation directory (`docs/content/api/`)
        - [x] Add deployment documentation directory (`docs/content/deployment/`)
        - [x] Add roadmap documentation directory (`docs/content/roadmap/`)
        - [x] Add design patterns documentation directory (`docs/content/design-patterns/`)
        - [x] Create README.md explaining documentation structure and guidelines
        - [x] Add sample documentation file (design-patterns/refinement-patterns.md)
        - [ ] Add architecture overview text and explanations
        - [ ] Store refinement pipeline flow descriptions
        - [ ] Include agent interaction documentation
        - [ ] Add database schema explanations
        - [ ] Store API documentation content
        - [ ] Include deployment guide content
        - [ ] Add design patterns explanations and examples
        - [ ] Create reusable documentation components
        - [ ] Add version control for documentation content
        - [ ] Include markdown templates for consistent formatting
    - [ ] **General Documentation Features**:
        - [ ] Implement search functionality across all documentation
        - [ ] Add version control for documentation updates
        - [ ] Create table of contents with navigation
        - [ ] Add print-friendly documentation export
- [ ] **Unified AI Provider System
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