'use client';

import React from 'react';

export default function ChatWindow() {
  return (
    <div className="chat-window glass-panel">
      <div className="chat-messages">
        {/* Messages will go here */}
        <div className="placeholder">Chat interface placeholder</div>
      </div>
      <div className="chat-input-area">
        <input type="text" placeholder="Ask a question..." className="chat-input" />
      </div>

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .placeholder {
          color: var(--text-muted);
        }
        .chat-input-area {
          padding: 1.5rem;
          border-top: 1px solid var(--surface-border);
        }
        .chat-input {
          width: 100%;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--surface-border);
          color: var(--text-primary);
          outline: none;
        }
        .chat-input:focus {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
