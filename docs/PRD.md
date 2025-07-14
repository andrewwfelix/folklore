# Product Requirements Document (PRD): AI-Powered Monster Creation Pipeline

## 1. Project Overview & Goals

### 1.1 Your Core Idea

You are developing an AI-powered system to generate thousands of custom monsters based on the mythologies, folklores, and cultural stories of countries around the world. These monsters will be formatted in a structure compatible with the Dungeons & Dragons 5.1 System Reference Document (SRD), while also presenting unique flair derived from real-world traditions.

### 1.2 Target of 3,000 Monsters

Your goal is to generate 3,000 monsters with cultural diversity, each rooted in authentic mythology or folklore. The project will be organized by country or region, allowing for a geographically diverse compendium. Each monster will feature lore, stat block, AI art, citations, and a downloadable PDF.

### 1.3 D&D 5.1 Compatibility

To ensure alignment with the D&D 5.1 SRD, your stat blocks and abilities will follow the formatting and mechanical principles defined in the SRD. This includes using CR ratings, action blocks, traits, and spellcasting features consistent with D&D rules.

### 1.4 Node.js + Supabase Stack

Your technical foundation will remain in the Node.js ecosystem, supported by Supabase for database, authentication, storage, and possibly vector search. This allows tight integration between data orchestration, AI agent workflows, and persistent data storage.

---

## 2. D&D SRD & Design Foundations

### 2.1 What is the SRD?

The SRD is a subset of D&D rules published under the Open Gaming License (OGL), providing standardized classes, monsters, spells, and mechanics. You plan to use SRD 5.1 to stay within legally sharable content.

### 2.2 Monster Mechanics and Features

D&D monsters typically include armor class, hit points, speed, ability scores, senses, languages, challenge rating, and actions. Some monsters have legendary actions, lair actions, and innate spellcasting. Your system will replicate this design schema.

### 2.3 SRD-Compliant Expansion

You’ll build custom monsters inspired by world myths while retaining SRD-compatible formatting. Original abilities will be inspired by folklore but mechanically balanced using SRD conventions.

### 2.4 Real-World Mythology

By sourcing from mythological databases like Wikipedia, Mythopedia, and public domain works, you will enrich the monsters with real-world cultural authenticity while layering on game-friendly mechanics.

---

## 3. Architecture

### 3.1 Agent-Based Modular Design

Each step of the monster creation process is handled by a discrete agent function. Each agent takes structured input and returns structured output, updating the shared monster object.

#### Core Agents:

- **Lore Agent**: Generates myth-inspired description
- **StatBlock Agent**: Produces SRD 5.1-compatible stats
- **Citation Agent**: Gathers and formats references
- **Art Prompt Agent**: Designs art description
- **Art Generator Agent**: Interfaces with AI image tools
- **QA Agent**: Evaluates quality, coherence, and compliance
- **PDF Agent**: Exports final document in styled format

### 3.2 Pipeline Types and Overview

You have discussed two major pipelines:

- **Text Generation Pipeline**: Includes lore generation, stat block creation, citation generation, and SRD rule enforcement.
- **Art Generation Pipeline**: Produces image prompts, coordinates AI art models, manages style guidelines, and ensures thematic consistency with the text pipeline.

Each of these pipelines can operate independently but are designed to converge during final QA and publishing.

### 3.3 Agent Roles and Flow

For each pipeline, the agents work in stages:

- **Lore Agent**: Gathers regional myth data and creates original lore.
- **Statblock Agent**: Translates lore into D&D 5e-style mechanics.
- **Citation Agent**: Extracts and formats sources, linking to myths and traditions.
- **Art Prompt Agent**: Generates visual description and stylization.
- **Art Generator Agent**: Interfaces with image generation tools (e.g., DALL·E, Midjourney).
- **QA/Review Agent**: Evaluates completeness, consistency, balance, and formatting.
- **PDF Agent**: Finalizes layout and produces styled PDF with citations and art.

### 3.4 Orchestrator Agent

A manager or orchestrator agent coordinates the sequence of these agents, tracks which step a monster is at, ensures data flows properly between agents, and re-runs stages as needed. It can act as a retry/review engine and is vital to large-scale automation.

### 3.5 Agent Coordination Tools

Each agent is implemented as a function in your Node.js stack. For orchestration and debugging, you may integrate LangChain (for LLM chains and tool use), LangSmith (for tracking, evaluation, and error tracing), or n8n (for visual orchestration). Each stage logs its outputs to a shared data record in Supabase.

### 3.6 Evaluation and Feedback Loops

To ensure quality at scale, a system of internal reviewer agents will periodically re-analyze monster content for bias, lore inconsistencies, power creep, or citation errors. Eventually, these evaluations could also be crowdsourced or integrated with user feedback.

---

## 4. Data Schema & Storage

### 4.1 Supabase Schema

Two options are supported:

- **Relational Model**: Normalized schema with `monsters`, `citations`, `reviews`, `art_prompts` tables
- **Embedded JSON Model**: Single `jsonb` per row capturing the full monster lifecycle

### 4.2 Sample Embedded Row

```json
{
  "id": "monster_001",
  "name": "Pontianak",
  "region": "Malaysia",
  "tags": ["undead", "ghost"],
  "lore": "A bloodthirsty ghost from Malaysian folklore...",
  "statblock": { ... },
  "citations": [ { "title": "Pontianak - Wikipedia", "url": "..." } ],
  "art": {
    "prompt": "Ghostly woman with blood-stained robes in Malaysian jungle",
    "image_url": "..."
  },
  "pdf_url": "...",
  "embedding": "..."
}
```

### 4.3 Supabase Capabilities

Supabase supports `jsonb`, full-text search, file storage, and vector similarity via pgvector. This makes it ideal for serving both structured data and AI queries.

### 4.4 Data Relationships

All components of the monster (citations, art, reviews) are logically tied to the main monster record. Whether using relational joins or embedded JSON, the relationships model real-world creation workflows.

---

## 5. Pipeline Execution Flow

```js
monster = await generateLore(monster);
monster = await generateStatBlock(monster);
monster = await generateCitation(monster);
monster = await generateArtPrompt(monster);
monster = await generateArt(monster);
monster = await runQA(monster);
monster = await generatePDF(monster);
```

Optionally:

```js
const [citations, artPrompt] = await Promise.all([
  generateCitation(monster),
  generateArtPrompt(monster)
]);
```

---

## 6. Tools & Libraries

- **Node.js** for orchestration logic and agent functions
- **Supabase** for database, auth, storage, and vector embedding
- **LangChain / LangSmith (optional)** for LLM chaining and pipeline tracing
- **n8n (optional)** for visual workflow automation
- **AI Image APIs** (Midjourney, DALL·E, SDXL)
- **PDF Export** via ReportLab or FPDF

---

## 7. Output Requirements

Each monster must include:

- Name, Region, Tags
- Lore (minimum 150 words)
- Stat Block (SRD-compatible JSON)
- Citation List (title + URL)
- Art Metadata (prompt + image URL)
- Downloadable PDF
- Vector Embedding for search

---

## 8. Future Enhancements

- Add user feedback/review interface
- Support multiple image styles or variants
- Gamify monster creation or allow public submissions
- Build search frontend with filtering by region/type
- Enable export to VTTs or game engines

---

## 9. Deliverables

- Working orchestrated pipeline
- Supabase DB schema
- 1,000+ generated monster records (Phase 1)
- Documentation (agent contracts, prompt templates, data samples)
- Initial user-facing web frontend (optional)

---

## 10. Timeline (Phase 1)

- Week 1–2: Lore + stat agents + Supabase schema
- Week 3: Art prompt + citation agents
- Week 4: Art integration + PDF agent
- Week 5: QA + review agents
- Week 6: Generate 100 monsters + validate PDF exports
- Week 7–8: Build frontend / publish first wave

