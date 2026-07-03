import { GoogleGenAI } from '@google/genai';
import { env } from './env';

const ai = new GoogleGenAI({ apiKey: env.ai.geminiApiKey });

/**
 * Generates an embedding vector for the provided text using Gemini.
 * Returns an array of floats (768 dimensions).
 */
export async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
      config: {
        outputDimensionality: 768
      }
    });
    
    // The new SDK returns embeddings in response.embeddings[0].values
    if (response.embeddings && response.embeddings.length > 0) {
      return response.embeddings[0].values;
    }
    throw new Error('No embeddings returned from Gemini');
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}
