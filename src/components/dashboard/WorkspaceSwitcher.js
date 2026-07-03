'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, loading } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    
    setCreating(true);
    const { error } = await createWorkspace(newWsName);
    setCreating(false);
    
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Workspace created', 'success');
      setNewWsName('');
      setIsModalOpen(false);
    }
  };

  if (loading) return <div className="ws-switcher-loading">Loading workspaces...</div>;

  return (
    <div className="ws-switcher">
      <label>Active Workspace</label>
      <select 
        value={activeWorkspace?.id || ''} 
        onChange={(e) => switchWorkspace(e.target.value)}
        className="ws-select"
      >
        {workspaces.map(ws => (
          <option key={ws.id} value={ws.id}>{ws.name}</option>
        ))}
        {workspaces.length === 0 && <option value="">No workspaces</option>}
      </select>
      
      <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)} className="create-btn">
        + New Workspace
      </Button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Workspace"
      >
        <form onSubmit={handleCreate}>
          <Input 
            label="Workspace Name" 
            value={newWsName} 
            onChange={e => setNewWsName(e.target.value)} 
            placeholder="e.g. Project Alpha"
            required
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>Create</Button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .ws-switcher {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ws-select {
          width: 100%;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--surface-border);
          color: var(--text-primary);
          outline: none;
        }
        .ws-select:focus {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
