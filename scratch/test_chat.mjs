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
    const contents = [{
      role: 'user',
      parts: [{ text: 'Hello' }]
    }];
    
    const aiTools = [{
      functionDeclarations: [
        {
          name: 'save_task',
          description: 'Saves an actionable task, to-do item, or reminder for the user.',
          parameters: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING', description: 'A short, clear title for the task' },
              description: { type: 'STRING', description: 'A detailed description of what needs to be done' },
              priority: { type: 'STRING', description: 'Priority level. Must be one of: low, medium, high, urgent' }
            },
            required: ['title', 'priority']
          }
        }
      ]
    }];

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: { 
        tools: aiTools,
        systemInstruction: "You are a friendly assistant."
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.functionCalls) console.log('Tool:', JSON.stringify(chunk.functionCalls));
      if (chunk.text) console.log('Chunk:', chunk.text);
    }
  } catch(e) {
    console.error('Stream Error:', e);
  }
}
test();
