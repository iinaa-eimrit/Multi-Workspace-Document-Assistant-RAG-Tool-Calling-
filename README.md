# Multi-Workspace Document Assistant (RAG & Tool Calling)

A full-stack web application built with **Next.js 15**, **Supabase**, and **Google Gemini**.  
Users upload documents into isolated workspaces and chat with an AI assistant that answers questions grounded strictly in the active workspace's knowledge base, with citations. The assistant can also call tools to take actions.

## Deployed URL

> **[https://your-deployed-url.vercel.app](https://your-deployed-url.vercel.app)**

## Quick Start — For Evaluators

1. Visit the deployed URL above.
2. Click **"→ Try Demo Account"** on the login page.  
   _(Credentials: `demo@docassist.app` / `demodemo123`)_
3. Two workspaces are pre-loaded with sample documents. Switch between them using the sidebar.
4. Try these in the Chat:
   - Ask a question about the uploaded documents → grounded answer with citations
   - Switch workspaces and repeat → assistant says "I don't know"
   - Ask the assistant to save a task → check the Tasks page
   - Ask it to send a Discord summary → check the Activity Log

## Features

| Requirement | Implementation |
|---|---|
| Multi-workspace isolation | `workspace_id` filter inside PostgreSQL `match_chunks` RPC (not app-level) |
| Shared vector store | Single `document_chunks` table with one HNSW index for all workspaces |
| Document ingestion | PDF/TXT/MD → chunk → embed (gemini-embedding-2, 768d) → pgvector |
| RAG chat with citations | Retrieve top-5 chunks → Gemini 2.5 Flash → inline source citations |
| Honest refusal | System prompt enforces "I don't know" when context is empty |
| Tool calling (2 tools) | `save_task` (real side-effect) + `send_discord_summary` |
| Dashboard | Documents, Chat, Tasks, Activity Log (tool-call history), Workspace Switcher |
| Streaming | SSE token-by-token streaming |
| Idempotent uploads | SHA-256 `content_hash` unique constraint per workspace |
| Retrieval debug view | RAG Debugger page shows chunks + similarity scores per workspace |
| Observability | Per-message latency, token usage, and tool execution metadata stored |

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Vanilla CSS
- **Backend**: Next.js Route Handlers (serverless)
- **Database**: Supabase (PostgreSQL + pgvector + RLS)
- **LLM**: Gemini 2.5 Flash (chat + tool calling)
- **Embeddings**: gemini-embedding-2 (768 dimensions via `outputDimensionality`)
- **Notifications**: Discord Webhook

## Local Setup

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project (free tier, no card)
- A [Google AI Studio](https://aistudio.google.com) API key (free tier, no card)

### 1. Clone and install
```bash
git clone https://github.com/iinaa-eimrit/Multi-Workspace-Document-Assistant-RAG-Tool-Calling-.git
cd Multi-Workspace-Document-Assistant-RAG-Tool-Calling-
npm install
```

### 2. Database setup
1. Create a Supabase project.
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`.

### 3. Environment variables
Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url   # optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create the demo account
Sign up a user with email `demo@docassist.app` and password `demodemo123`.  
In Supabase Dashboard → Authentication → Users, confirm the user's email if auto-confirm is not enabled.

### 5. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## How to Test Workspace Isolation

1. Log in with the demo account.
2. Create **Workspace A** → upload a document containing a unique fact (e.g., "The secret code is moonlight").
3. Create **Workspace B** → upload an unrelated document.
4. Switch to **Workspace B** → ask "What is the secret code?"
5. The assistant will say it doesn't know — Workspace A's chunks are filtered out at the database level inside the `match_chunks` RPC, before the LLM ever sees the context.

## Deployment (Vercel)

1. Push to GitHub.
2. Import into Vercel.
3. Set environment variables in Vercel project settings.
4. Deploy.

The `/api/upload` and `/api/chat` routes use `maxDuration = 60` for Vercel's serverless function timeout.

## Architecture

- **Workspace isolation** is enforced inside the PostgreSQL `match_chunks` function (`WHERE dc.workspace_id = target_workspace_id`), not in application code.
- **Idempotent uploads**: `content_hash` unique constraint prevents duplicate chunk insertion.
- **Tool execution**: Model proposes a function call → server validates arguments against schema → executes → logs to `tool_calls` table → feeds result back to model for final response.
- **Prompt injection resistance**: System prompt treats document text as data, not instructions.
