import { parseDocument, chunkText, calculateContentHash } from './parser';
import { generateEmbedding } from './embeddings';
import { createClient } from './supabase/server';

/**
 * Main ingestion pipeline:
 * 1. Hashes document for idempotency
 * 2. Extracts text
 * 3. Chunks text
 * 4. Generates embeddings for each chunk
 * 5. Saves everything to Supabase
 */
export async function ingestDocument(fileBuffer, mimeType, filename, workspaceId, userId, fileSize) {
  const supabase = await createClient();

  const contentHash = calculateContentHash(fileBuffer);

  // 1. Check for duplicates in the same workspace
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('content_hash', contentHash)
    .single();

  if (existingDoc) {
    throw new Error('This document has already been uploaded to this workspace.');
  }

  // 2. Parse text
  const text = await parseDocument(fileBuffer, mimeType);
  if (!text.trim()) {
    throw new Error('No readable text found in the document.');
  }

  // 3. Chunk text
  const chunks = chunkText(text);

  // 4. Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert([{
      workspace_id: workspaceId,
      filename,
      file_size: fileSize,
      mime_type: mimeType,
      content_hash: contentHash,
      chunk_count: chunks.length,
      uploaded_by: userId
    }])
    .select()
    .single();

  if (docError) {
    throw new Error(`Failed to create document record: ${docError.message}`);
  }

  // 5. Generate embeddings and prepare chunk records
  const chunkRecords = [];
  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent);

      chunkRecords.push({
        document_id: document.id,
        workspace_id: workspaceId,
        chunk_index: i,
        content: chunkContent,
        embedding,
        metadata: { source: filename, chunk: i }
      });
    }

    // 6. Bulk insert chunks
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords);

    if (chunksError) {
      throw chunksError;
    }
  } catch (error) {
    // Rollback document record if chunking/embedding fails
    await supabase.from('documents').delete().eq('id', document.id);
    throw new Error(`Ingestion pipeline failed: ${error.message}`);
  }

  return document;
}
