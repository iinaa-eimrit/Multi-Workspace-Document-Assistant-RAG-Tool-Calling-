# AI Collaboration Notes

## AI Tools & Models Used
I used the Google DeepMind agent ("Antigravity") powered by Gemini models for this project. 
The work was split highly collaboratively: the AI autonomously authored the Next.js foundation, CSS design systems, Supabase schemas, and RAG pipelines, while I (the developer) acted as the orchestrator—guiding architectural constraints (e.g. demanding strict workspace isolation inside PostgreSQL rather than application code), and stepping in to test endpoint failures or API key environments when local dev environments drifted.

## Key Decisions
1. **Workspace Isolation via PostgreSQL `match_chunks` RPC**: Instead of fetching vectors and filtering in Javascript (which compromises security and token bandwidth), I decided to pass `target_workspace_id` directly into a `security definer` RPC function. The exact filter `dc.workspace_id = target_workspace_id` guarantees tenancy isolation at the lowest database level.
2. **Dynamic Dimensionality Scaling (Gemini Embeddings)**: Initially we faced `pgvector` HNSW index limitations (which caps vectors at 2000 dimensions) when we moved to the cutting-edge `gemini-embedding-2` model (default 3072 dims). Instead of degrading the database schema or forgoing HNSW performance, I explicitly passed `outputDimensionality: 768` to the embedding configuration, generating high-quality compressed vectors that cleanly fit our DB.
3. **Vanilla CSS Design System**: Avoiding bloated utility frameworks like Tailwind for this task, I architected a token-based glassmorphism aesthetic using raw Vanilla CSS in `index.css`. This achieved a premium UI with subtle micro-animations and perfect dark-mode gradients without a single external styling dependency.

## Hardest Bug / Wrong Turn
The hardest bug occurred when setting up the RAG retrieval pipeline for chat. The assistant was throwing a `Failed to start chat stream` 500 Server Error.
The AI helped me dig through Next.js console logs but couldn't find the error because it was trapped in the client-side parsing of the stream. After using a browser subagent to catch the exact error toast on the UI, I wrote a test script to execute the Supabase RPC call directly. 
It turned out the issue was a database error: `operator does not exist: public.vector <=> public.vector`.
The AI identified that my `match_chunks` security definer function was configured with `set search_path = ''` to prevent hijacking. However, this prevented the function from accessing the `pgvector` operators in the `public` schema. Adding `public` back to the `search_path` instantly resolved the failure.

## Future Improvements
With more time, I would:
1. Implement **Hybrid Search (Keyword + Vector)** by coupling `pgvector` with Postgres Full Text Search for high-accuracy exact-word lookups in large documents.
2. Build an **Upload Queue** with background workers for processing massive PDF documents without risking Vercel function timeouts.
3. Enhance the `save_task` tool by integrating it directly into an interactive kanban board on the frontend.
