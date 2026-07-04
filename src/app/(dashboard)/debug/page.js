'use client';

import React from 'react';
import RetrievalDebugger from '@/components/dashboard/RetrievalDebugger';

export default function DebugPage() {
  return (
    <div className="debug-page">
      <header className="page-header">
        <h1>Retrieval Debug</h1>
        <p className="subtitle">Inspect retrieved document chunks, similarity scores, and workspace filtering for debugging retrieval.</p>
        <p className="subtitle mt-1">This page helps verify that document retrieval remains isolated to the active workspace.</p>
      </header>

      <section className="debugger-section">
        <RetrievalDebugger />
      </section>

      <style jsx>{`
        .debug-page {
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
        .mt-1 {
          margin-top: 0.5rem;
          font-size: 0.95rem;
          color: var(--accent);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
