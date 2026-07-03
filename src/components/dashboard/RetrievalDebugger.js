'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

export default function RetrievalDebugger() {
  const { activeWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleTest = async (e) => {
    e.preventDefault();
    if (!query.trim() || !activeWorkspace) return;

    setLoading(true);
    setChunks([]);
    
    try {
      const response = await fetch('/api/debug/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, workspaceId: activeWorkspace.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to retrieve chunks');
      
      setChunks(data.chunks || []);
      addToast(`Retrieved ${data.chunks?.length || 0} chunks`, 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!activeWorkspace) {
    return <div className="debugger-empty">Select a workspace to test retrieval.</div>;
  }

  return (
    <div className="retrieval-debugger">
      <form onSubmit={handleTest} className="debugger-form glass-panel">
        <Input 
          label="Test Query" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Enter a search query to test pgvector similarity matching..." 
        />
        <Button type="submit" disabled={loading || !query.trim()} className="mt-2">
          Run Vector Search
        </Button>
      </form>

      {loading && <div className="mt-4 flex-center"><Spinner /></div>}

      {!loading && chunks.length > 0 && (
        <div className="chunks-list">
          <h3>Retrieved Context Chunks ({chunks.length})</h3>
          {chunks.map((chunk, i) => (
            <div key={chunk.id || i} className="chunk-card glass-panel">
              <div className="chunk-header">
                <strong>Source: {chunk.metadata?.source || 'Unknown'}</strong>
                <span className="similarity-badge">
                  Score: {(chunk.similarity || 0).toFixed(4)}
                </span>
              </div>
              <pre className="chunk-content">{chunk.content}</pre>
            </div>
          ))}
        </div>
      )}

      {!loading && query && chunks.length === 0 && (
        <p className="no-results">No relevant chunks found above the similarity threshold.</p>
      )}

      <style jsx>{`
        .retrieval-debugger {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .debugger-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .flex-center { display: flex; justify-content: center; }
        .chunks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .chunks-list h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }
        .chunk-card {
          padding: 1.25rem;
        }
        .chunk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .similarity-badge {
          background: rgba(34, 211, 238, 0.1);
          color: var(--accent);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          font-family: monospace;
          font-weight: bold;
        }
        .chunk-content {
          margin: 0;
          white-space: pre-wrap;
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
        }
        .no-results {
          color: var(--text-muted);
          font-style: italic;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}
