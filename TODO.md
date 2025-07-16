# TODO List

## Immediate Priorities
- [ ] Implement Unified AI Provider System
- [ ] Factor Out Model Definitions
- [ ] Fix Agent Unit Test Mocking

## In Progress
- [ ] Metrics Collection & Quality Tracking
- [ ] Performance Monitoring & System Optimization

## Major Features & Enhancements
- [ ] Unified AI Provider Abstraction
  - [ ] Research and evaluate unified AI API providers (Together AI, OpenRouter, Fireworks AI, etc.)
  - [ ] Design unified AI client interface
  - [ ] Implement provider-specific adapters
  - [ ] Update config system to support multiple providers
  - [ ] Add environment variables for provider selection
  - [ ] Test with different providers
- [ ] Model Definitions in Config
  - [ ] Un-hardcode model in LoreAgent
  - [ ] Un-hardcode model in StatBlockAgent
  - [ ] Un-hardcode model in CitationAgent
  - [ ] Un-hardcode model in ArtPromptAgent
  - [ ] Un-hardcode model in QAAgent
  - [ ] Un-hardcode model in PDFAgent
  - [ ] Un-hardcode model in test scripts
- [ ] Agent Unit Test Mocking
  - [ ] Fix LoreAgent Jest Mock
  - [ ] Investigate Mock Strategy
  - [ ] Create Consistent Test Pattern
  - [ ] Update Test Documentation
  - [ ] Consider Mock Alternatives
  - [ ] Test Coverage Analysis

## QA Algorithm Implementation (Phased)
### Phase 1: Analysis & Classification ✅
- [x] QA Issue Classification
- [x] Issue Severity Mapping

### Phase 2: Intelligent Routing ✅
- [x] Feedback Routing Logic
- [x] Action Plan Generation

### Phase 3: Iterative Refinement Loop ✅
- [x] Refinement Session Logging
- [x] Database Persistence
- [x] QA Review Loop
- [x] Success Criteria
- [x] Fallback Strategy
- [x] Full Refinement Pipeline
- [x] QA Issue Display

### Phase 4: Agent Enhancement ✅
- [x] Agent Feedback Integration
- [x] LoreAgent Enhancement
- [x] StatBlockAgent Enhancement
- [x] ArtPromptAgent Enhancement
- [x] Agent Feedback Processing

### Phase 5: Quality Tracking
- [ ] Metrics Collection
- [ ] Performance Monitoring
- [ ] System Optimization

## UI Development (Next.js Dashboard)
### MVP
- [ ] Setup Next.js Dashboard Project
- [ ] Dashboard Overview Page
- [ ] Generation Page
- [ ] Monsters Page
- [ ] Refinement Page
- [ ] Analytics Page
- [ ] Database Explorer Page
- [ ] Documentation Page

### Future Enhancements
- [ ] Real-time generation status display
- [ ] WebSocket connection for live updates
- [ ] Bulk actions (delete, re-run refinement, export)
- [ ] Advanced filtering, sorting, and search
- [ ] PDF preview and download
- [ ] Progress indicators for active generations
- [ ] Error handling and retry mechanisms
- [ ] User authentication and roles

## Documentation
### MVP
- [ ] Architecture Documentation Page
- [ ] Refinement Pipeline Documentation Page
- [ ] Agent Documentation Page
- [ ] Database Documentation Page
- [ ] API Documentation Page
- [ ] Deployment Documentation Page
- [ ] Development Roadmap Documentation Page
- [ ] Design Patterns Documentation Page

### Future Enhancements
- [ ] Search functionality across all documentation
- [ ] Version control for documentation updates
- [ ] Reusable documentation components
- [ ] Markdown templates for consistent formatting
- [ ] Data visualization and diagrams

## Backlog / Ideas
- [ ] Add user feedback/review interface
- [ ] Support multiple image styles or variants
- [ ] Gamify monster creation or allow public submissions
- [ ] Build search frontend with filtering by region/type
- [ ] Enable export to VTTs or game engines
- [ ] Add cost tracking and usage metrics
- [ ] Create exportable reports
- [ ] Add database health monitoring
- [ ] Add troubleshooting guides and common issues
- [ ] Performance optimization tips
- [ ] Risk assessment and mitigation strategies

## Backlog / Ideas
- [ ] Add user feedback/review interface
- [ ] Support multiple image styles or variants
- [ ] Gamify monster creation or allow public submissions
- [ ] Build search frontend with filtering by region/type
- [ ] Enable export to VTTs or game engines
- [ ] Add cost tracking and usage metrics
- [ ] Create exportable reports
- [ ] Add database health monitoring
- [ ] Add troubleshooting guides and common issues
- [ ] Performance optimization tips
- [ ] Risk assessment and mitigation strategies
- [ ] Implement D&D 5e Stat Block Formatting
  - [ ] Add proper bold formatting for section headers (ARMOR CLASS, HIT POINTS, etc.)
  - [ ] Format ability scores with modifiers (STR 16 (+3))
  - [ ] Use italics for attack descriptions ("Melee Weapon Attack:", "Hit:")
  - [ ] Format damage expressions with dice notation (8 (1d8 + 4))
  - [ ] Include proper ranges and reach specifications (reach 5 ft.)
  - [ ] Add saving throw DC calculations and display
  - [ ] Format condition immunities as adjectives
  - [ ] Ensure proper visual hierarchy with bold headers
  - [ ] Follow established D&D conventions for monster stat blocks
  - [ ] Make formatting crucial for DM quick reference during combat

## Completed Tasks
- [x] Test Full Refinement Pipeline
- [x] Delay PDF Generation
- [x] QA Feedback Loop
- [x] QA Feedback Incorporation
- [x] Refinement Session Logging
- [x] Database Persistence Fixes
- [x] Issue Category Handling
- [x] Full Refinement Pipeline
- [x] QA Issue Display
- [x] Database Persistence correctly saves to separate tables
- [x] PDF Generation now uses PDFKit
- [x] Blob storage is configured for file uploads
- [x] Agent Orchestration and Logging
- [x] Modular agent contracts and prompt templates
- [x] Documentation structure in docs/content/ 