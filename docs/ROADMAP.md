# Development Roadmap: AI-Powered Monster Creation Platform

This document outlines a detailed, step-by-step development plan for building the monster generation platform. It focuses on small, testable increments that support reliable progress in a code-centric development environment like Cursor.

---

## Phase 1: Setup & Connectivity

### Step 1: Initialize Project Repository
- 🧱 **Create project directory and Git repo:** Set up the working folder and initialize version control using Git.
- 📦 **Set up `package.json` and TypeScript support:** Run `npm init` and install `typescript`, `ts-node`, and `@types/node`. Configure `tsconfig.json` for the project.
- 🧹 **Install and configure ESLint, Prettier:** Use `eslint --init` and `prettier` to ensure code consistency across the codebase.

### Step 2: Connect to Supabase
- 🛠️ **Create Supabase project:** Initialize a new project in Supabase with default settings.
- 🔐 **Set up `.env` with `SUPABASE_URL` and `SUPABASE_KEY`:** Securely store API credentials for local development.
- 🧰 **Install Supabase JS client:** Use `npm install @supabase/supabase-js`.
- 🧪 **Write and test `supabaseClient.ts`:** Export an instance of the Supabase client using environment variables.
- ✅ **Test database connectivity:** Write a test script that fetches rows from a test table (`monsters`) to confirm a successful connection.

### Step 3: Define Supabase Schema
- 🧱 **Use SQL editor or migration tool to define tables:** Create the following tables:
  - `monsters (id, name, lore, statblock, status, image_url, pdf_url, created_at)`
  - `citations (id, monster_id, title, url)`
  - `art_prompts (id, monster_id, prompt_text)`
  - `reviews (id, monster_id, rating, feedback)`
- 🌱 **Seed test data for development:** Manually add a few sample rows to allow local testing.

### Step 4: Create Schema Validation Layer
- 📐 **Define TypeScript interfaces for monster objects:** Ensure structure is enforced across functions.
- 🧰 **Add JSON Schema or Zod-based validation logic:** Automatically verify agent outputs.
- 🧪 **Write unit tests to validate sample monster payload:** Ensure malformed payloads throw useful errors.

---

## Phase 2: Agent Development & Testing

### Step 5: Create Agent Module Framework
- 🗂️ **Create `/agents` directory:** A folder to house all agent logic.
- 🔧 **Define base interface for each agent input/output:** Create reusable type contracts.
- 🧪 **Write `generateLore.ts` stub returning dummy lore:** Basic function to test pipeline scaffolding.
- ✅ **Add Jest test verifying output format:** Ensure the function returns a valid structure.

### Step 6: Implement Lore Agent (v1)
- ✍️ **Prompt: Build a folklore prompt template:** Use template strings to generate culturally appropriate LLM prompts.
- 🔌 **Connect to OpenAI API:** Use `openai.createChatCompletion` to get responses.
- 💾 **Store result to Supabase:** Save the generated lore to the appropriate row.
- 🧪 **Write test case to verify lore length and formatting:** Ensure outputs meet quality thresholds (e.g., 150+ words).

### Step 7: Build StatBlock Agent (v1)
- 🧠 **Prompt: Translate lore into D&D 5e stat block JSON:** Define schema-compatible outputs.
- ⚔️ **Generate CR, traits, actions, abilities:** Apply templates and lore parsing to fill mechanics.
- 🧪 **Validate output against stat schema:** Use type guards or Zod validation.
- ✅ **Add test for mechanical balance:** Ensure generated CRs, HP, and damage align reasonably.

### Step 8: Citation Agent
- 🌍 **Use Wikipedia API and Mythopedia to gather sources:** Extract references using scraper or fetch APIs.
- 📄 **Parse title, URL, origin:** Normalize fields.
- 💾 **Store as `citations[]` in Supabase:** Link references to monster record.
- 🧪 **Add unit test for valid citations:** Ensure accurate and deduplicated results.

### Step 9: Art Prompt Agent
- 🎨 **Prompt: Derive visual prompt from lore:** Capture key visual elements from description.
- 🧭 **Style guide: Define art style metadata:** Ensure prompts are visually consistent (e.g., “ink illustration”, “digital art”).
- 💾 **Save result to Supabase row:** Store prompt alongside monster ID.
- 🧪 **Test: Prompt includes correct folklore reference and style tag.**

### Step 10: Art Generator Agent
- 🔌 **Integrate DALL·E or SDXL API:** Use image generation API with generated prompt.
- 🖼️ **Receive image URL or binary output:** Save to Supabase storage.
- ✅ **Validate image loads and matches expectations:** Basic file integrity + visual test.

---

## Phase 3: Orchestration & Integration

### Step 11: Build Orchestrator
- 🔁 **Create `/orchestrator/runMonsterPipeline.ts`:** Central function to call all agents in sequence.
- 🧰 **Add retry logic and error logging:** Prevent failures from halting entire run.
- 🧪 **Test: Simulate pipeline on test monster record.** Ensure full flow completes.

### Step 12: Add Supabase Update Hooks
- 🔄 **Update Supabase row at each stage:** Reflect status after each agent (e.g., `lore_ready`, `image_ready`).
- 🚦 **Track status field:** Use enum: `draft`, `generating`, `complete`, `error`.
- 🧪 **Test: Confirm DB updates are correct and final output is complete.**

### Step 13: PDF Generation Agent
- 🧾 **Use PDFKit or html-pdf:** Create printable format for lore + statblock + image + citations.
- 💾 **Upload to Supabase Storage:** Link file to monster object.
- 🧪 **Validate PDF structure and download.** Ensure fonts, spacing, and links render.

---

## Phase 4: Frontend and Interface

### Step 14: Create Basic UI in Next.js
- 🧭 **Build `/generate` page:** Let users start monster creation.
- 👁️ **Build `/monster/[id]` page:** Show results with lore, art, stats, and PDF download.
- 🔌 **Use Supabase client:** Fetch and render data dynamically.
- 🧪 **Test: Validate state transitions and error handling.**

### Step 15: Add Search & Explore Page
- 🔍 **Enable pgvector/text search by tag/region/keyword.**
- 📊 **Add filters and display cards:** Use cards or grid to preview monsters.
- 🧪 **Test: Result matches input, pagination works.**

---

## Phase 5: QA, Batch Tests, and Launch

### Step 16: QA Batch Generation
- 🔁 **Run batch generation:** Create 50–100 monsters using orchestration.
- 📋 **Review quality:** Check stat balance, lore, spelling, cultural alignment.
- 🧪 **Write test: Run mock monster pipeline on dev record.**

### Step 17: Publish MVP
- 🎨 **Add branding, logo, color palette.**
- 🚀 **Deploy on Vercel:** Auto-deploy GitHub repo.
- 🌐 **Expose 10+ sample monsters publicly:** For demo and feedback.

---

## Optional Extensions

- 🧑‍🔬 Reviewer interface for manual edits
- 🧠 User-submitted monsters
- ⭐ Rating and feedback UI
- 🧩 Export to VTT (e.g., Foundry, Roll20)
- 🔎 LangSmith observability hooks for debugging chains

This roadmap is optimized for Cursor, supports TDD and iterative workflows, and offers clear test criteria for each milestone.

