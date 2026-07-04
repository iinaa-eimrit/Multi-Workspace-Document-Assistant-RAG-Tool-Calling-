'use client';

import React from 'react';
import ToolLog from '@/components/dashboard/ToolLog';

export default function ActivityPage() {
  return (
    <div className="activity-page">
      <header className="page-header">
        <h1>Tool Calls</h1>
        <p className="subtitle">View tool calls executed by the AI assistant, including execution status and results.</p>
      </header>

      <section className="log-section">
        <ToolLog />
      </section>

      <style jsx>{`
        .activity-page {
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
