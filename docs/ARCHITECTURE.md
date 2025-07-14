# Architecture Document: AI-Powered Monster Creation Platform

## 1. Overview
This document describes the system architecture for the AI-powered folklore-inspired monster generation platform. It is built on a modern, serverless stack including Node.js, Supabase, and Vercel, designed for modularity, scalability, and AI integration.

---

## 2. Tech Stack

| Layer               | Technology          | Purpose                                               |
|--------------------|---------------------|-------------------------------------------------------|
| Frontend           | Vercel (Next.js)    | Static and dynamic web interface                      |
| Backend API        | Node.js             | Agent orchestration, monster creation workflows       |
| Database           | Supabase (Postgres) | Storage for monsters, embeddings, PDFs, citations     |
| Storage            | Supabase Storage    | Image files, PDFs                                     |
| AI Agents          | OpenAI / SDXL       | Text + image generation agents                        |
| Orchestration      | Custom + LangChain  | Multi-agent execution and error handling              |
| Deployment         | Vercel              | Auto-deploying serverless frontend and edge functions |

---

## 3. High-Level Architecture

```
[ Vercel Frontend ] <--> [ Node.js Agent Orchestrator ] <--> [ Supabase DB + Storage ]
                                              |          
                                       [ External APIs: OpenAI, DALL·E, Wikipedia ]
```

- The frontend triggers generation workflows (manual or scheduled).
- The orchestrator coordinates the AI agents.
- Outputs are persisted to Supabase and surfaced via API or frontend.

---

## 4. Core Modules

### 4.1 Agent Module (Node.js)
Each AI function (e.g., lore generation, citation scraping, statblock generation) is a pure function accepting and returning a monster object.

```ts
async function generateLore(monster) → monster
async function generateStatBlock(monster) → monster
```

### 4.2 Orchestrator
Sequentially runs each agent with retry logic and optional branching:
```ts
async function runMonsterPipeline(monsterId: string): Promise<Monster> { ... }
```

### 4.3 Supabase Integration
- Tables: `monsters`, `citations`, `reviews`, `art_prompts`
- Storage: PDFs, art files
- Extensions: `pgvector` for semantic search

### 4.4 Vercel Frontend
- Pages: Browse monsters, View monster details, Generate new
- API Routes: Trigger generation, Fetch PDFs, Search

---

## 5. Data Flow

1. User triggers generation
2. Orchestrator loads initial stub monster
3. Each AI agent updates and stores output to Supabase
4. Upon completion, metadata, citations, PDFs, and image files are persisted
5. Frontend displays structured monster with lore, stats, art, and citations

---

## 6. Scalability & Extensibility
- Stateless agent execution supports parallelism
- Vercel edge functions scale automatically
- Supabase handles database and file scalability
- Future agents can be plugged into the orchestrator

---

## 7. Observability
- Logs via Vercel and Supabase
- Errors recorded per monster
- Agent timing and status metadata can be tracked
- LangSmith (optional): trace agent chains and outputs

---

## 8. Security
- Supabase Auth protects endpoints
- Role-based access for admin generation
- No user PII stored in monster generation

---

## 9. Future Enhancements
- Queue-based job processing (e.g., via Supabase Edge Functions)
- Caching + rehydration of generation prompts
- Scheduled batch monster creation
- Admin dashboard for monitoring pipeline health

---

## 10. File Structure (src/)
```
/agents
  generateLore.ts
  generateStatBlock.ts
  ...
/orchestrator
  runMonsterPipeline.ts
/data
  supabaseClient.ts
/pages
  index.tsx
  monster/[id].tsx
/public
  styles.css
```

---

This architecture is optimized for fast iteration, high availability, and modular extension, making it suitable for both initial MVP launch and long-term product evolution.

