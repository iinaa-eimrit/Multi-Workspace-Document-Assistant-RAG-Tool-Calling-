'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import Spinner from '@/components/ui/Spinner';

export default function ToolLog() {
  const { activeWorkspace } = useWorkspace();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!activeWorkspace) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tool_calls')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .order('created_at', { ascending: false });
      
      setLogs(data || []);
      setLoading(false);
    };

    fetchLogs();
  }, [activeWorkspace, supabase]);

  if (!activeWorkspace) {
    return <div className="tool-log-empty">Select a workspace to view tool activity.</div>;
  }

  if (loading) return <div className="tool-log-loading"><Spinner /></div>;
  if (logs.length === 0) return <div className="tool-log-empty glass-panel">No tool activity logged yet.</div>;

  return (
    <div className="tool-log-list">
      {logs.map(log => (
        <div key={log.id} className="log-item glass-panel">
          <div className="log-header">
            <h4>{log.tool_name}</h4>
            <span className={`status-badge ${log.status}`}>{log.status}</span>
          </div>
          <div className="log-body">
            <strong>Arguments:</strong>
            <pre>{JSON.stringify(log.arguments, null, 2)}</pre>
            
            {log.result && (
              <>
                <strong>Result:</strong>
                <pre>{JSON.stringify(log.result, null, 2)}</pre>
              </>
            )}
            {log.error_message && <p className="error-text">Error: {log.error_message}</p>}
          </div>
          <div className="log-footer">
            Executed at {new Date(log.executed_at || log.created_at).toLocaleString()}
          </div>
        </div>
      ))}

      <style jsx>{`
        .tool-log-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .log-item {
          padding: 1.5rem;
        }
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .log-header h4 {
          margin: 0;
          color: var(--accent);
          font-family: monospace;
          font-size: 1.1rem;
        }
        .status-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          text-transform: uppercase;
          font-weight: bold;
        }
        .status-badge.success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid var(--success); }
        .status-badge.error { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid var(--error); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid #f59e0b; }
        
        .log-body {
          font-size: 0.9rem;
        }
        .log-body strong {
          display: block;
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          color: var(--text-muted);
        }
        pre {
          background: rgba(0,0,0,0.3);
          padding: 1rem;
          border-radius: var(--radius-sm);
          overflow-x: auto;
          margin: 0;
          color: var(--text-primary);
        }
        .error-text {
          color: var(--error);
          margin-top: 0.5rem;
        }
        .log-footer {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: right;
          border-top: 1px solid var(--surface-border);
          padding-top: 0.75rem;
        }
      `}</style>
    </div>
  );
}
