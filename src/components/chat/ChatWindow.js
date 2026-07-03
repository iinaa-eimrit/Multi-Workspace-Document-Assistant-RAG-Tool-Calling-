'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

export default function ChatWindow() {
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();
  const supabase = createClient();

  const fetchHistory = async () => {
    if (!activeWorkspace) return;
    setFetchingHistory(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      addToast('Failed to load chat history', 'error');
    } else {
      setMessages(data || []);
    }
    setFetchingHistory(false);
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchHistory();
    } else {
      setMessages([]);
      setFetchingHistory(false);
    }
  }, [activeWorkspace]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !activeWorkspace || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMsg = { role: 'assistant', content: '', toolCalls: [], citations: [] };
      setMessages(prev => [...prev, assistantMsg]);

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex;
        
        // Parse complete SSE lines from buffer
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                const current = { ...newMessages[lastIdx] };

                if (data.type === 'text') {
                  current.content += data.text;
                } else if (data.type === 'tool_call') {
                  current.toolCalls = [...(current.toolCalls || []), data];
                } else if (data.type === 'citations') {
                  current.citations = data.citations;
                } else if (data.type === 'error') {
                  addToast(data.error, 'error');
                }
                
                newMessages[lastIdx] = current;
                return newMessages;
              });
            } catch (err) {
              console.error('Failed to parse SSE data fragment', dataStr);
            }
          }
        }
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
      // Refresh history to pick up the actual saved records and IDs from DB
      fetchHistory();
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="chat-window empty glass-panel">
        <p>Please select a workspace to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chat-window glass-panel">
      <div className="chat-messages">
        {fetchingHistory ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <p className="placeholder">Ask a question to search your workspace documents.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.content && <div className="message-text">{msg.content}</div>}
                
                {msg.toolCalls?.map((tc, idx) => (
                  <div key={idx} className="tool-call-card">
                    <div className="tool-header">🔧 Action: {tc.name}</div>
                    {tc.result?.success ? (
                      <div className="tool-success">{tc.result.message}</div>
                    ) : (
                      <div className="tool-error">{tc.result?.error || 'Execution failed'}</div>
                    )}
                  </div>
                ))}
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citations-list">
                    <strong>Sources:</strong>
                    {msg.citations.map((cit, idx) => (
                      <span key={idx} className="citation-pill">
                        {cit.source}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? 'Waiting for response...' : 'Ask a question...'} 
          className="chat-input" 
          disabled={loading}
          autoFocus
        />
      </form>

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .chat-window.empty {
          justify-content: center;
          align-items: center;
          color: var(--text-muted);
        }
        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .placeholder {
          text-align: center;
          color: var(--text-muted);
          margin: auto;
        }
        .message-row {
          display: flex;
          width: 100%;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-row.assistant {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 80%;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: var(--surface);
          border: 1px solid var(--surface-border);
          line-height: 1.5;
        }
        .message-row.user .message-bubble {
          background: rgba(34, 211, 238, 0.1);
          border-color: rgba(34, 211, 238, 0.3);
        }
        .message-text {
          white-space: pre-wrap;
        }
        .tool-call-card {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          border-left: 2px solid var(--accent);
        }
        .tool-header {
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.25rem;
        }
        .tool-success { color: var(--success); }
        .tool-error { color: var(--error); }
        
        .citations-list {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--surface-border);
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .citation-pill {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--surface-border);
          color: var(--text-muted);
        }
        
        .chat-input-area {
          padding: 1.5rem;
          border-top: 1px solid var(--surface-border);
          background: var(--bg-base);
        }
        .chat-input {
          width: 100%;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--surface-border);
          color: var(--text-primary);
          outline: none;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: var(--accent);
        }
        .chat-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
