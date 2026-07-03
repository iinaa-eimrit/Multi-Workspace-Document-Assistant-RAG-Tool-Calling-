'use client';

import React from 'react';
import TaskList from '@/components/dashboard/TaskList';

export default function TasksPage() {
  return (
    <div className="tasks-page">
      <header className="page-header">
        <h1>Workspace Tasks</h1>
        <p className="subtitle">Manage actionable items and reminders for this workspace.</p>
      </header>

      <section className="list-section">
        <TaskList />
      </section>

      <style jsx>{`
        .tasks-page {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
