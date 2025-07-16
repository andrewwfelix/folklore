# Documentation Content Repository

This directory contains all the markdown content for the Folklore documentation system. The content is separated from the UI implementation, allowing for easy editing and version control of documentation.

## Directory Structure

```
docs/content/
├── architecture/          # System architecture documentation
├── refinement/           # Refinement pipeline documentation
├── agents/              # Agent documentation and interactions
├── database/            # Database schema and data flow
├── api/                 # API documentation and endpoints
├── deployment/          # Deployment and setup guides
├── roadmap/             # Development roadmap and planning
├── design-patterns/     # Software design patterns used
└── README.md           # This file
```

## Content Guidelines

### File Naming Convention
- Use kebab-case for file names: `system-overview.md`
- Include date in filename for drafts: `refinement-flow-2024-01.md`
- Use descriptive names that indicate content

### Markdown Format
- Use standard markdown syntax
- Include Mermaid diagrams where appropriate
- Add frontmatter for metadata (title, date, author)
- Keep files focused on single topics

### Content Organization
- Each subdirectory corresponds to a documentation page in the UI
- Files can be organized by topic within each directory
- Use index files for overview content
- Include examples and code snippets

## Usage

### For Content Writers
1. Create markdown files in appropriate directories
2. Use descriptive filenames
3. Include diagrams and examples
4. Update this README when adding new directories

### For UI Developers
1. Read markdown files from this directory
2. Parse content for display in UI
3. Support Mermaid diagram rendering
4. Implement search across all content

### For Version Control
1. Track changes to documentation content
2. Use meaningful commit messages
3. Tag releases when documentation is updated
4. Maintain history of documentation changes

## Example File Structure

```
architecture/
├── system-overview.md
├── component-diagram.md
└── data-flow.md

refinement/
├── pipeline-overview.md
├── qa-feedback-loop.md
└── iteration-logic.md

agents/
├── agent-overview.md
├── lore-agent.md
├── statblock-agent.md
└── qa-agent.md
```

## Integration with UI

The UI will read these markdown files and render them with:
- Syntax highlighting for code blocks
- Mermaid diagram rendering
- Search functionality
- Navigation between related content
- Print-friendly formatting

## Contributing

1. Create new content in appropriate directories
2. Follow naming conventions
3. Include diagrams and examples
4. Update this README if needed
5. Test content rendering in UI 