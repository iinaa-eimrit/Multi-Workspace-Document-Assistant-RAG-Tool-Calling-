import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retrieveRelevantChunks, formatRetrievalContext } from '@/lib/retrieval';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { aiTools, executeToolCall } from '@/lib/tools';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

export const maxDuration = 60; // Allow more time for streaming response

const ai = new GoogleGenAI({ apiKey: env.ai.geminiApiKey });

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, workspaceId } = body;

    if (!workspaceId || !messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid chat request:', { workspaceId, messages });
      return NextResponse.json({ error: 'Valid workspaceId and messages array are required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from the user' }, { status: 400 });
    }

    // 1. Context Retrieval (Workspace-scoped)
    const chunks = await retrieveRelevantChunks(latestMessage.content, workspaceId);
    const contextStr = formatRetrievalContext(chunks);
    const systemInstruction = buildSystemPrompt(contextStr);

    // 2. Format history for Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // 3. Persist the user message
    const { data: userMsgRecord } = await supabase.from('chat_messages').insert([{
      workspace_id: workspaceId,
      user_id: user.id,
      role: 'user',
      content: latestMessage.content
    }]).select().single();

    // 4. Create an SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const startTime = Date.now();
          let fullText = '';
          let toolCallDetected = null;
          let usageMetadata = null;

          // Initial LLM Call
          const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              tools: aiTools,
            }
          });

          for await (const chunk of responseStream) {
            if (chunk.usageMetadata) {
              usageMetadata = chunk.usageMetadata;
            }
            // Check for tool calls
            if (chunk.functionCalls && chunk.functionCalls.length > 0) {
              toolCallDetected = chunk.functionCalls[0];
              break; // Stop streaming text, transition to tool execution phase
            }
            if (chunk.text) {
              fullText += chunk.text;
              const payload = JSON.stringify({ type: 'text', text: chunk.text });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          }

          // Handle Tool Execution Phase
          let executedToolName = null;
          if (toolCallDetected) {
            const toolName = toolCallDetected.name;
            const args = toolCallDetected.args;
            executedToolName = toolName;
            
            // Execute the physical tool logic and log it to DB
            const toolResult = await executeToolCall(workspaceId, userMsgRecord.id, toolName, args);
            
            // Notify the client about the tool execution so it can render a ToolCallCard
            const toolPayload = JSON.stringify({ type: 'tool_call', name: toolName, args, result: toolResult });
            controller.enqueue(encoder.encode(`data: ${toolPayload}\n\n`));

            // Return the result back to Gemini for the final answer
            contents.push({
              role: 'model',
              parts: [{ functionCall: toolCallDetected }]
            });
            contents.push({
              role: 'user',
              parts: [{ functionResponse: { name: toolName, response: toolResult } }]
            });

            const followUpStream = await ai.models.generateContentStream({
              model: 'gemini-2.5-flash',
              contents,
              config: { systemInstruction, tools: aiTools }
            });

            for await (const chunk of followUpStream) {
              if (chunk.usageMetadata) {
                usageMetadata = chunk.usageMetadata;
              }
              if (chunk.text) {
                fullText += chunk.text;
                const payload = JSON.stringify({ type: 'text', text: chunk.text });
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              }
            }
          }

          const latencyMs = Date.now() - startTime;

          // 5. Persist the final assistant message (with citations and AI metrics)
          const citationData = chunks.map(c => ({ id: c.id, source: c.metadata.source }));
          await supabase.from('chat_messages').insert([{
            workspace_id: workspaceId,
            user_id: user.id,
            role: 'assistant',
            content: fullText,
            citations: citationData,
            metadata: {
              latency_ms: latencyMs,
              model: 'gemini-2.5-flash',
              usage: usageMetadata,
              tool_executed: executedToolName
            }
          }]);

          // Send citations metadata to the client and close stream
          const metaPayload = JSON.stringify({ type: 'citations', citations: citationData });
          controller.enqueue(encoder.encode(`data: ${metaPayload}\n\n`));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          const errPayload = JSON.stringify({ type: 'error', error: streamError.message });
          controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
