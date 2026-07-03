import { generateEmbedding } from './embeddings';
import { createClient } from './supabase/server';

/**
 * Retrieves the most relevant document chunks for a given query,
 * strictly scoped to the specified workspace ID.
 * 
 * @param {string} query - The user's search query.
 * @param {string} workspaceId - The ID of the active workspace to isolate the search.
 * @param {number} matchThreshold - Minimum similarity score (0 to 1).
 * @param {number} matchCount - Maximum number of chunks to return.
 * @returns {Promise<Array>} - Array of matching chunks with similarity scores.
 */
export async function retrieveRelevantChunks(query, workspaceId, matchThreshold = 0.5, matchCount = 5) {
  const supabase = await createClient();

  // 1. Generate an embedding for the user's search query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Perform the vector search via the secure RPC function
  // The match_chunks function inherently filters by target_workspace_id
  const { data: chunks, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    target_workspace_id: workspaceId,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('Vector search error:', error);
    throw new Error(`Failed to retrieve relevant context: ${error.message}`);
  }

  return chunks || [];
}

/**
 * Formats retrieved chunks into a structured string for the LLM context.
 */
export function formatRetrievalContext(chunks) {
  if (!chunks || chunks.length === 0) return '';
  
  return chunks.map((chunk, i) => {
    const source = chunk.metadata?.source || 'Unknown source';
    return `[Source ${i + 1}: ${source}]\n${chunk.content}`;
  }).join('\n\n---\n\n');
}
