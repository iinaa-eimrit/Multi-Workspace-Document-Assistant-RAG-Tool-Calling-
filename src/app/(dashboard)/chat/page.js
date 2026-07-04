'use client';

import React from 'react';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <div className="chat-page">
      <header className="page-header">
        <h1>Assistant</h1>
        <p className="subtitle">Ask questions about documents in your active workspace.</p>
      </header>
      
      <div className="chat-container">
        <ChatWindow />
      </div>

      <style jsx>{`
        .chat-page {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 8rem);
          gap: 1.5rem;
        }
        .page-header {
          flex-shrink: 0;
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
        .chat-container {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}
