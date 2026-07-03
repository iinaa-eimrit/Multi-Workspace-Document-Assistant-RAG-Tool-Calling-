import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="error-text">{error}</span>}
      <style jsx>{`
        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          width: 100%;
        }
        .input-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-border);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
        }
        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .input-error {
          border-color: var(--error);
        }
        .input-error:focus {
          box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
        }
        .error-text {
          font-size: 0.8rem;
          color: var(--error);
        }
      `}</style>
    </div>
  );
}
