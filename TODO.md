# TODO List

## Current Tasks

### High Priority
- [ ] **QA Feedback Loop**: Ensure that if the QA agent has feedback, the system provides an opportunity to send that feedback back into the relevant agent(s) for revision or rerun.
- [ ] **QA Feedback Incorporation**: Implement mechanism to automatically rerun specific agents (e.g., Lore Agent for name issues, StatBlock Agent for balance issues) based on QA feedback.
## QA Algorithm Implementation

### Phase 1: Analysis & Classification
- [ ] **QA Issue Classification**: Categorize QA issues by type (name, balance, cultural, art) and identify target agents
- [ ] **Issue Severity Mapping**: Map issue severity (Critical/Major/Minor) to priority levels for agent routing

### Phase 2: Intelligent Routing
- [x] **Feedback Routing Logic**: Route issues to appropriate agents (Name → LoreAgent, Balance → StatBlockAgent, etc.)
- [x] **Action Plan Generation**: Create specific instructions for each agent based on QA feedback

### Phase 3: Iterative Refinement Loop
- [ ] **QA Review Loop**: Implement iterative process (max 3 iterations) with QA review at each step
- [ ] **Success Criteria**: Define when to stop (QA score ≥ 4.0 OR max iterations reached)
- [ ] **Fallback Strategy**: Return best version if improvements fail

### Phase 4: Agent Enhancement
- [ ] **LoreAgent Enhancement**: Accept QA feedback for name distinctiveness and cultural authenticity
- [ ] **StatBlockAgent Enhancement**: Accept QA feedback for balance and CR adjustments
- [ ] **ArtPromptAgent Enhancement**: Accept QA feedback for art style and description improvements
- [ ] **Agent Feedback Integration**: Modify each agent to handle specific feedback types

### Phase 5: Quality Tracking
- [ ] **Metrics Collection**: Track success rates, iterations per monster, agent effectiveness
- [ ] **Performance Monitoring**: Monitor common issues and improvement rates
- [ ] **System Optimization**: Use metrics to refine the algorithm

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

## Notes
- PDF generation now uses PDFKit with built-in fonts for maximum compatibility
- All agents are working and integrated into the orchestrator
- Blob storage is configured for file uploads
- QA agent provides feedback but currently no mechanism to act on that feedback
- QA agent enhanced to specifically check for name distinctiveness and avoid generic names like "Troll", "Dragon", "Spirit"
- QA feedback incorporation algorithm designed with 5 phases: Analysis, Routing, Iterative Refinement, Agent-Specific Handling, and Quality Metrics 