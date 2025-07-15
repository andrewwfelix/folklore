# TODO List

## Current Tasks

### High Priority
- [ ] **QA Feedback Loop**: Ensure that if the QA agent has feedback, the system provides an opportunity to send that feedback back into the relevant agent(s) for revision or rerun.
- [ ] **QA Feedback Incorporation**: Implement mechanism to automatically rerun specific agents (e.g., Lore Agent for name issues, StatBlock Agent for balance issues) based on QA feedback.

### Optional Tasks
- [ ] **PDF Blob Upload Script**: Create a script to upload any local PDF file to blob storage for manual testing.
- [ ] **Full Pipeline Test**: Run the full monster generation pipeline and verify that the generated PDF is uploaded to blob storage and is viewable.

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