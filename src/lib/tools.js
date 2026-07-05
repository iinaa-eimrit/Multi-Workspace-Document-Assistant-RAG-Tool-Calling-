import { createClient, createAdminClient } from '@/lib/supabase/server';
import { env } from './env';

export const aiTools = [{
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
    },
    {
      name: 'send_discord_summary',
      description: 'Sends a summary, report, or notification to the shared Discord channel.',
      parameters: {
        type: 'OBJECT',
        properties: {
          message: { type: 'STRING', description: 'The content of the message or summary to send' }
        },
        required: ['message']
      }
    }
  ]
}];

/**
 * Executes a requested tool, logs the call to the database, and returns the result.
 */
export async function executeToolCall(workspaceId, chatMessageId, toolName, args) {
  const supabase = await createClient();

  // 1. Log the pending tool call
  const { data: logRecord, error: logError } = await supabase
    .from('tool_calls')
    .insert([{
      workspace_id: workspaceId,
      chat_message_id: chatMessageId,
      tool_name: toolName,
      arguments: args,
      status: 'pending'
    }])
    .select()
    .single();

  if (logError) {
    console.error('Failed to log tool call:', logError);
    return { error: 'Failed to initialize tool execution' };
  }

  let result;
  let status = 'success';
  let errorMessage = null;

  try {
    // 2. Execute the tool logic
    switch (toolName) {
      case 'save_task': {
        const { title, description, priority } = args;
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        const safePriority = validPriorities.includes(priority) ? priority : 'medium';

        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            workspace_id: workspaceId,
            title,
            description,
            priority: safePriority,
            created_by_tool: true
          }])
          .select()
          .single();

        if (error) throw error;
        result = { success: true, taskId: data.id, message: `Task "${title}" saved successfully.` };
        break;
      }

      case 'send_discord_summary': {
        const { message } = args;
        if (!env.discord.webhookUrl) {
          console.log('[MOCK DISCORD WEBHOOK]', message);
          result = { success: true, message: 'Message logged locally (Discord Webhook URL not configured in environment).' };
        } else {
          const res = await fetch(env.discord.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
          });

          if (!res.ok) throw new Error(`Discord API returned status: ${res.status}`);
          result = { success: true, message: 'Message sent to Discord successfully.' };
        }
        break;
      }

      default:
        throw new Error(`Unknown tool requested: ${toolName}`);
    }
  } catch (error) {
    console.error(`Tool execution failed (${toolName}):`, error);
    status = 'error';
    errorMessage = error.message;
    result = { error: errorMessage };
  }

  // 3. Update the tool call log with the final result using Admin Client since there is no UPDATE policy
  const adminSupabase = createAdminClient();
  await adminSupabase
    .from('tool_calls')
    .update({
      result,
      status,
      error_message: errorMessage,
      executed_at: new Date().toISOString()
    })
    .eq('id', logRecord.id);

  return result;
}
