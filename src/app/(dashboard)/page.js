'use client';

import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="dashboard-home">
      <header className="page-header">
        <h1>Welcome, {user?.user_metadata?.display_name || user?.email?.split('@')[0]}!</h1>
        <p className="subtitle">
          {activeWorkspace 
            ? `Currently viewing workspace: ${activeWorkspace.name}` 
            : 'Select or create a workspace to get started.'}
        </p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <h3>Documents</h3>
          <p className="stat">0</p>
          <span className="stat-label">Indexed in this workspace</span>
        </div>
        <div className="glass-panel stat-card">
          <h3>Chat Sessions</h3>
          <p className="stat">0</p>
          <span className="stat-label">Recent conversations</span>
        </div>
        <div className="glass-panel stat-card">
          <h3>Tasks</h3>
          <p className="stat">0</p>
          <span className="stat-label">Pending actions</span>
        </div>
      </div>

      <style jsx>{`
        .dashboard-home {
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-header {
          margin-bottom: 3rem;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }
        .stat-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: var(--text-muted);
        }
        .stat {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: auto;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
