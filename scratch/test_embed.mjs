import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const ai = new GoogleGenAI({ apiKey: env['GOOGLE_GENERATIVE_AI_API_KEY'] });

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: env['GOOGLE_GENERATIVE_AI_API_KEY'] });
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: 'Hello world',
      config: {
        outputDimensionality: 768
      }
    });
    console.log('Success Embed 2 Length:', response.embeddings[0].values.length);
  } catch(e) {
    console.error('Error Embed 2:', e.message);
  }
}
test();
