# AI Collaboration Notes

## 1. AI Tools & Models Used

Throughout this project, I used Antigravity IDE alongside Gemini models as my primary development assistant. Because I wanted to make sure I truly understood the architecture, I didn't use the AI to generate the entire application at once. Instead, I treated it like a more experienced pairing partner. 

I relied on it mostly for:
- Learning unfamiliar technologies, specifically how `pgvector` works and how to manage Server-Sent Events (SSE) in Next.js.
- Understanding the documentation for the newer `@google/genai` SDK.
- Reviewing my implementation ideas before writing the actual code.
- Speeding up repetitive tasks like writing CSS boilerplate and basic React component layouts.
- Helping me debug some tricky database configuration issues.

I made sure to manually verify, test, and adjust the AI-generated snippets to fit my overall project structure rather than blindly copy-pasting.

## 2. Key Decisions I Made

**Enforcing workspace isolation at the database level**
I realized early on that filtering vector search results in the application code could lead to security leaks if the logic was ever skipped. I decided to enforce tenant isolation directly inside the `match_chunks` PostgreSQL RPC function. I asked the AI to help me compare different indexing approaches, but ultimately chose to pass `workspace_id` directly into the database function to guarantee that chunks from other workspaces are never even queried.

**Validating tool calls explicitly**
The project required the model to autonomously trigger external tools. I didn't want the model executing arbitrary JSON directly on my backend. I decided to build a rigid validation layer. I set up schemas to validate every tool invocation before execution, returning structured errors back to the model if it hallucinated arguments. This kept the system predictable and prevented unexpected runtime crashes.

**Keeping the RAG pipeline modular**
Rather than putting parsing, chunking, embedding, and retrieval all in one massive API route, I separated them into distinct utility modules (`parser.js`, `embeddings.js`, `retrieval.js`). I used AI to help me understand standard practices for chunk overlap sizes, but the modular structure was my decision to make testing and debugging easier.

## 3. Hardest Bug / Wrong Turn

The most frustrating bug I encountered was getting `pgvector` to work correctly within a secure Supabase RPC function. 

Initially, my `match_chunks` function was throwing an error during chat: `operator does not exist: public.vector <=> public.vector`. I couldn't figure out why the vector similarity operator was suddenly unrecognizable, even though the extension was successfully enabled. I used the AI to help brainstorm potential causes. It helped me realize that because I had set the function to `security definer` (to safely bypass Row Level Security for the internal query), the default `search_path` was being restricted.

Once the AI pointed me toward the `search_path` concept, I investigated the Postgres docs, confirmed the root cause myself, and manually updated the SQL function to include `SET search_path = public`. That fixed the issue immediately.

## 4. What I'd Improve With More Time

If I had more time to work on this, I'd focus on:
- **Background Document Processing:** Moving the document parsing and embedding pipeline into a background queue. Right now, very large files might hit the Vercel serverless function timeout.
- **Hybrid Search:** Combining the current vector search with standard PostgreSQL full-text keyword search to improve accuracy for specific nouns, names, or IDs.
- **Better Observability:** Building out a dedicated dashboard to visualize token usage trends, latency spikes, and tool execution success rates over time.

## 5. Reflection

Building this project taught me a lot about integrating LLMs into traditional web architectures. Using AI definitely accelerated my development speed, especially when I was stuck on unfamiliar syntax or needed to quickly understand how a new library worked. 

However, this project reinforced that AI is just a tool. The AI couldn't design the overall system architecture, it couldn't tell if the UX felt intuitive, and it couldn't guarantee that the application met the specific requirements of the prompt. Understanding how the pieces fit together, testing the edge cases, and fixing the integration bugs remained entirely my responsibility.
