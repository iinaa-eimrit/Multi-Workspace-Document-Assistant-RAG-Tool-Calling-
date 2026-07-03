import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import crypto from 'crypto';

/**
 * Calculates a SHA-256 hash of the file buffer for idempotent uploads.
 */
export function calculateContentHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Parses a document buffer and extracts text based on its MIME type.
 */
export async function parseDocument(fileBuffer, mimeType) {
  let text = '';
  
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  } else if (
    mimeType === 'text/plain' || 
    mimeType === 'text/markdown' || 
    mimeType === 'text/csv'
  ) {
    text = fileBuffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported document type: ${mimeType}`);
  }
  
  // Clean up extracted text: remove null bytes and excessive newlines
  text = text.replace(/\x00/g, '')
             .replace(/\n{3,}/g, '\n\n')
             .trim();
  
  return text;
}

/**
 * Splits text into overlapping chunks for vector embedding.
 * Uses a token/character approximation (roughly 4 chars per token).
 */
export function chunkText(text, maxChunkLength = 3000, overlap = 300) {
  const paragraphs = text.split(/(?:\r?\n){2,}/);
  const chunks = [];
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    // If adding this paragraph exceeds the limit (and we already have some text)
    if (currentChunk.length + paragraph.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Calculate overlap: take the last `overlap` characters of the current chunk
      // We try to find a space to avoid cutting in the middle of a word
      const overlapStartPos = Math.max(0, currentChunk.length - overlap);
      const spaceIndex = currentChunk.indexOf(' ', overlapStartPos);
      const actualStart = spaceIndex !== -1 ? spaceIndex : overlapStartPos;
      
      currentChunk = currentChunk.substring(actualStart).trim() + '\n\n' + paragraph;
    } else {
      if (currentChunk.length > 0) {
        currentChunk += '\n\n' + paragraph;
      } else {
        currentChunk = paragraph;
      }
    }
    
    // If a single paragraph is still too large, we forcefully chunk it (naive split)
    while (currentChunk.length > maxChunkLength * 1.5) {
      let splitPos = currentChunk.lastIndexOf(' ', maxChunkLength);
      if (splitPos === -1) splitPos = maxChunkLength;
      
      chunks.push(currentChunk.substring(0, splitPos).trim());
      currentChunk = currentChunk.substring(splitPos).trim();
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
