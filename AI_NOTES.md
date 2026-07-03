# AI Collaboration Notes

## AI Tools & Models Used

I used Antigravity IDE with Gemini models as a development assistant throughout this project. Rather than generating the entire application at once, I mainly used AI for accelerating repetitive implementation, reviewing code, and helping explore areas I hadn't worked with before, particularly pgvector, RAG pipelines, Gemini tool calling, and Supabase Row Level Security.

For most features, I first decided how I wanted the architecture to work, then used AI to help scaffold implementations, explain unfamiliar APIs, or review specific pieces of code. Every feature was tested and adjusted manually before moving on to the next phase.

---

## Key Decisions I Made

### 1. Enforcing workspace isolation inside the vector search

One of the most important design decisions was ensuring tenant isolation at the database level instead of filtering retrieved results in application code.

I implemented retrieval so the active `workspace_id` is part of the vector search itself through the `match_chunks` SQL function. This guarantees that chunks from another workspace are never retrieved in the first place, which is both more secure and more efficient.

---

### 2. Keeping the AI pipeline modular

Since I hadn't previously built a complete RAG application with tool calling, I used AI to understand different implementation approaches before deciding on the final structure.

Instead of placing everything inside a single chat endpoint, I separated the pipeline into document parsing, chunking, embeddings, retrieval, tool execution, and chat orchestration. This made each part easier to test independently and kept the codebase easier to maintain.

---

### 3. Tool execution with explicit validation

The project required the model to call external tools safely.

I decided that every tool invocation should be validated before execution using a schema, with invalid requests returning structured errors rather than executing anything unexpected. This keeps the tool layer predictable and prevents malformed model responses from causing runtime issues.

---

## Hardest Bug / Wrong Turn

The most difficult issue happened while integrating the RAG retrieval pipeline.

Initially, document uploads completed successfully, but chat requests failed because retrieval wasn't returning the expected results. I hadn't worked with pgvector before, so I used AI to help inspect the SQL function and verify the retrieval flow.

After testing the RPC function directly and checking the generated SQL, I found the problem was related to the database function configuration rather than the application logic. Adjusting the function configuration resolved the issue, and I added additional validation to make retrieval failures easier to diagnose in the future.

This was the part of the project where AI was most valuable—it helped narrow down possibilities much faster, but I still had to verify each assumption by testing the database and API endpoints manually.

---

## What I'd Improve With More Time

If I continued developing this project, I would focus on a few areas:

* Add hybrid retrieval (vector search combined with PostgreSQL full-text search) to improve results for exact keyword queries.
* Move document ingestion into background jobs so larger documents don't depend on request time limits.
* Improve observability with a dedicated dashboard for retrieval scores, token usage, latency, and tool execution metrics.
* Expand the tool system with additional integrations and more advanced multi-step workflows.

---

## Reflection

The biggest value AI provided during this project was helping me learn unfamiliar technologies more quickly and validating implementation ideas before I committed to them. I still made the architectural decisions, integrated the different parts of the system, tested the application end-to-end, and debugged issues as they appeared. Using AI sped up development considerably, but understanding how the pieces fit together and verifying that they satisfied the project requirements remained my responsibility.
