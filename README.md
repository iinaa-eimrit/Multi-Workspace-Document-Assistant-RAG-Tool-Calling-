# Multi-Workspace Document Assistant (RAG & Tool Calling)

A full-stack, AI-powered web application built with Next.js 15, Supabase, and Google Gemini. 
This application allows users to upload documents (PDFs, Markdown, Text) into isolated workspaces, 
and chat with an AI assistant that answers questions grounded strictly in the workspace's knowledge base.

## Features

- **Multi-Workspace Isolation**: Create independent workspaces. RLS (Row Level Security) and database-level vector filtering guarantee strict data isolation.
- **RAG Pipeline**: Automatically parses, chunks, and embeds uploaded documents using `pdf-parse` and Gemini's `text-embedding-004`.
- **Vector Search**: Leverages PostgreSQL `pgvector` for rapid semantic similarity search.
- **Tool Calling**: The AI Assistant can execute backend tools autonomously (e.g., creating actionable tasks or sending Discord summaries).
- **Observability & Debugging**: Includes built-in interfaces to debug vector search similarities and monitor raw AI tool execution payloads.
- **Streaming UI**: Server-Sent Events (SSE) provide a fluid, real-time typing experience with inline citations.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Vanilla CSS (Custom Design System)
- **Backend**: Next.js Server Route Handlers
- **Database**: Supabase (PostgreSQL with `pgvector`)
- **AI Models**: `@google/genai` (Gemini 2.5 Flash for Chat, gemini-embedding-2 for Vectors)

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account (Free tier)
- A Google AI Studio API Key (Free tier)

### 2. Clone the repository
```bash
git clone https://github.com/iinaa-eimrit/Multi-Workspace-Document-Assistant-RAG-Tool-Calling-.git
cd Multi-Workspace-Document-Assistant-RAG-Tool-Calling-
npm install
```

### 3. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to the SQL Editor in your Supabase dashboard.
3. Copy the contents of `supabase/migration.sql` and run it. This will:
   - Enable `pgvector` and `uuid-ossp` extensions.
   - Create all necessary tables with Row Level Security (RLS).
   - Set up the vector similarity search RPC function (`match_chunks`).
   - Create triggers for user profile syncing.

### 4. Environment Variables
Create a `.env.local` file in the root directory and fill in the required keys based on `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Discord Webhook (Optional - for testing the send_discord_summary tool)
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 5. Run the Application
```bash
npm run dev
```
Visit `http://localhost:3000` to see the application running. Create an account via the Sign Up page to get started.

## How to Test Workspace Isolation

To demonstrate strict RAG isolation between workspaces:
1. Log in with a test account (or create one).
2. Create **Workspace A** and upload a document with unique facts (e.g., "The secret password for project Alpha is 'moonlight'").
3. Create **Workspace B** and upload a completely unrelated document (e.g., a recipe for a cake).
4. Switch to **Workspace B** and ask the assistant: "What is the secret password for project Alpha?"
5. The assistant will explicitly state that it does not know the answer, because Workspace A's chunks are filtered out at the vector database level before the LLM even sees the context.

## Deployment (Vercel)

This application is optimized for Vercel deployment using Next.js Serverless functions.

1. Push your code to GitHub.
2. Create a new project in Vercel and import your repository.
3. In the Vercel project settings, configure the Environment Variables exactly as they appear in your `.env.local`.
4. Deploy!

Note: The `/api/upload` and `/api/chat` endpoints are configured with `maxDuration = 60` to accommodate heavier document parsing and AI streaming logic on Vercel's Hobby Tier.

## Architecture Highlights

- **Data Privacy First**: Workspace separation isn't just a UI trick; it is enforced heavily at the database level inside the `match_chunks` PostgreSQL function.
- **Idempotent Uploads**: Uploading the exact same document twice is prevented efficiently via an indexed `content_hash` constraint.
- **No Heavy Libraries**: Eschewing heavy UI frameworks, the app utilizes highly optimized Vanilla CSS scoped locally via `styled-jsx` for incredible performance and a cohesive design system.
