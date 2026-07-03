'use client';

import React, { useState } from 'react';
import UploadZone from '@/components/documents/UploadZone';
import DocumentList from '@/components/dashboard/DocumentList';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="documents-page">
      <header className="page-header">
        <h1>Documents</h1>
        <p className="subtitle">Manage the knowledge base for your active workspace.</p>
      </header>

      <section className="upload-section">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
      </section>

      <section className="list-section">
        <h2>Indexed Documents</h2>
        <DocumentList refreshTrigger={refreshTrigger} />
      </section>

      <style jsx>{`
        .documents-page {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
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
        .list-section h2 {
          font-size: 1.25rem;
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
