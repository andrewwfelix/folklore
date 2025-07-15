# TODO List

## Current Tasks

### High Priority
- [ ] **QA Feedback Loop**: Ensure that if the QA agent has feedback, the system provides an opportunity to send that feedback back into the relevant agent(s) for revision or rerun.
- [ ] **QA Feedback Incorporation**: Implement mechanism to automatically rerun specific agents (e.g., Lore Agent for name issues, StatBlock Agent for balance issues) based on QA feedback.

## QA Algorithm Implementation

### Phase 1: Analysis & Classification ✅ COMPLETED
- [x] **QA Issue Classification**: Categorize QA issues by type (name, balance, cultural, art) and identify target agents
- [x] **Issue Severity Mapping**: Map issue severity (Critical/Major/Minor) to priority levels for agent routing

### Phase 2: Intelligent Routing ✅ COMPLETED
- [x] **Feedback Routing Logic**: Route issues to appropriate agents (Name → LoreAgent, Balance → StatBlockAgent, etc.)
- [x] **Action Plan Generation**: Create specific instructions for each agent based on QA feedback

### Phase 3: Iterative Refinement Loop 🔄 IN PROGRESS
- [x] **Refinement Session Logging**: Implement session tracking with iterations, QA scores, and agent actions
- [x] **Database Persistence**: Save monsters with refinement metadata to separate tables
- [ ] **QA Review Loop**: Implement iterative process (max 3 iterations) with QA review at each step
- [ ] **Success Criteria**: Define when to stop (QA score ≥ 4.0 OR max iterations reached)
- [ ] **Fallback Strategy**: Return best version if improvements fail

### Phase 4: Agent Enhancement 🔄 IN PROGRESS
- [x] **Agent Feedback Integration**: Modify each agent to accept `qaFeedback` parameter
- [ ] **LoreAgent Enhancement**: Implement feedback processing for name distinctiveness and cultural authenticity
- [ ] **StatBlockAgent Enhancement**: Implement feedback processing for balance and CR adjustments
- [ ] **ArtPromptAgent Enhancement**: Implement feedback processing for art style and description improvements
- [ ] **Agent Feedback Processing**: Add logic to each agent to respond to specific feedback types

### Phase 5: Quality Tracking
- [ ] **Metrics Collection**: Track success rates, iterations per monster, agent effectiveness
- [ ] **Performance Monitoring**: Monitor common issues and improvement rates
- [ ] **System Optimization**: Use metrics to refine the algorithm

## Next Suggested Actions

### Immediate Priority (Choose One)
- [ ] **Option A: Full Refinement Pipeline**: Create `RefinementPipeline` class that orchestrates the entire refinement process (generate → QA → refine → repeat)
- [ ] **Option B: Agent Enhancement**: Focus on implementing feedback processing logic in individual agents first
- [ ] **Option C: End-to-End Testing**: Test current system to identify specific improvements needed

### Database Table Status
- [x] **folklore_monsters**: ✅ Populated with test data
- [x] **folklore_art_prompts**: ✅ Structure working (has one row from test)
- [x] **folklore_citations**: ✅ Structure ready (empty - expected)
- [x] **folklore_generation_history**: ✅ Structure ready (empty - expected)
- [x] **folklore_monster_tags**: ✅ Structure ready (empty - expected)
- [x] **folklore_agent_metrics**: ✅ Structure ready (empty - expected)

### Optional Tasks
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

## Notes
- PDF generation now uses PDFKit with built-in fonts for maximum compatibility
- All agents are working and integrated into the orchestrator
- Blob storage is configured for file uploads
- Database persistence correctly saves to separate tables (monsters, citations, art_prompts)
- QA agent provides feedback but currently no mechanism to act on that feedback
- QA agent enhanced to specifically check for name distinctiveness and avoid generic names like "Troll", "Dragon", "Spirit"
- QA feedback incorporation algorithm designed with 5 phases: Analysis, Routing, Iterative Refinement, Agent-Specific Handling, and Quality Metrics
- Database tables are in expected state: main tables populated, metadata tables empty (as designed) 