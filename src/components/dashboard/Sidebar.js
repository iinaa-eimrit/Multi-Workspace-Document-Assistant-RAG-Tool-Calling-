'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import Button from '@/components/ui/Button';

export default function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>DocAssist</h2>
      </div>
      
      <div className="sidebar-section">
        <WorkspaceSwitcher />
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className="nav-link">Dashboard</Link>
        <Link href="/chat" className="nav-link">Chat</Link>
        <Link href="/documents" className="nav-link">Documents</Link>
        <Link href="/tasks" className="nav-link">Tasks</Link>
        <Link href="/activity" className="nav-link">Activity Log</Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span>{user?.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--surface-border);
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.25rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-section {
          padding: 1.5rem;
          border-bottom: 1px solid var(--surface-border);
        }
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          transition: background 0.2s;
        }
        .nav-link:hover {
          background: var(--surface-hover);
        }
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--surface-border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .user-info {
          font-size: 0.85rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </aside>
  );
}
