'use client';

import React from 'react';

export default function UploadZone() {
  return (
    <div className="upload-zone glass-panel">
      <div className="upload-content">
        <p>Drag and drop documents here</p>
        <p className="sub">Supports .pdf, .txt, .md (max 5MB)</p>
      </div>

      <style jsx>{`
        .upload-zone {
          border: 2px dashed var(--surface-border);
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .upload-zone:hover {
          border-color: var(--accent);
          background: rgba(34, 211, 238, 0.05);
        }
        .sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
