'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function TaskList() {
  const { activeWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    if (!activeWorkspace) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      addToast('Failed to load tasks', 'error');
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [activeWorkspace, supabase, addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      addToast('Failed to update task status', 'error');
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      addToast('Failed to delete task', 'error');
    } else {
      setTasks(tasks.filter(t => t.id !== id));
      addToast('Task deleted', 'success');
    }
  };

  if (!activeWorkspace) {
    return <div className="task-list-empty">Please select a workspace.</div>;
  }

  if (loading) return <div className="task-list-loading"><Spinner /></div>;
  if (tasks.length === 0) return <div className="task-list-empty glass-panel">No tasks found for this workspace. Use the Assistant to create one!</div>;

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task.id} className={`task-card glass-panel ${task.status}`}>
          <div className="task-header">
            <div className="task-title-group">
              <input 
                type="checkbox" 
                checked={task.status === 'completed'}
                onChange={() => toggleStatus(task.id, task.status)}
                className="task-checkbox"
              />
              <h4 className={task.status === 'completed' ? 'completed-text' : ''}>{task.title}</h4>
            </div>
            <div className="task-actions">
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              {task.created_by_tool && <span className="ai-badge" title="Created by AI Assistant">AI</span>}
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>&times;</button>
            </div>
          </div>
          {task.description && (
            <div className={`task-desc ${task.status === 'completed' ? 'completed-text' : ''}`}>
              {task.description}
            </div>
          )}
        </div>
      ))}
      <style jsx>{`
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .task-card {
          padding: 1.5rem;
          transition: all 0.2s;
        }
        .task-card.completed {
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.02);
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .task-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .task-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: var(--accent);
        }
        .task-header h4 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
          transition: color 0.2s;
        }
        .completed-text {
          text-decoration: line-through;
          color: var(--text-muted) !important;
        }
        .task-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .priority-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          font-weight: bold;
        }
        .priority-badge.low { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .priority-badge.medium { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .priority-badge.high { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .priority-badge.urgent { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        
        .ai-badge {
          font-size: 0.7rem;
          background: var(--gradient-primary);
          color: white;
          padding: 0.2rem 0.4rem;
          border-radius: var(--radius-sm);
          font-weight: bold;
        }
        .delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.25rem;
          cursor: pointer;
          line-height: 1;
        }
        .delete-btn:hover {
          color: var(--error);
        }
        .task-desc {
          margin-top: 1rem;
          margin-left: 2.25rem;
          color: var(--text-muted);
          font-size: 0.95rem;
          white-space: pre-wrap;
        }
        .task-list-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
        }
        .task-list-loading {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
