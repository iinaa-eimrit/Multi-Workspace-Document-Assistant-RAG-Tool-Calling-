'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type} animate-fade-in`}>
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)}>&times;</button>
            </div>
          ))}
          <style jsx>{`
            .toast-container {
              position: fixed;
              bottom: 2rem;
              right: 2rem;
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              z-index: 9999;
            }
            .toast {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1rem 1.25rem;
              border-radius: var(--radius-md);
              background: var(--surface);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              color: var(--text-primary);
              min-width: 300px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
              border: 1px solid var(--surface-border);
            }
            .toast-success {
              border-left: 4px solid var(--success);
            }
            .toast-error {
              border-left: 4px solid var(--error);
            }
            .toast-info {
              border-left: 4px solid var(--accent);
            }
            button {
              background: none;
              border: none;
              color: var(--text-muted);
              font-size: 1.25rem;
              cursor: pointer;
              margin-left: 1rem;
            }
            button:hover {
              color: white;
            }
          `}</style>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
