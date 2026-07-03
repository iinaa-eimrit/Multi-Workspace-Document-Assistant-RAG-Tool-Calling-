import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);
const ai = new GoogleGenAI({ apiKey: env['GOOGLE_GENERATIVE_AI_API_KEY'] });

async function test() {
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: 'Hello',
      config: { outputDimensionality: 768 }
    });
    const embed = response.embeddings[0].values;
    console.log('Embed length:', embed.length);

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embed,
      target_workspace_id: '123e4567-e89b-12d3-a456-426614174000',
      match_threshold: 0.5,
      match_count: 5
    });
    console.log('RPC Error:', error);
    console.log('RPC Data:', data);
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
