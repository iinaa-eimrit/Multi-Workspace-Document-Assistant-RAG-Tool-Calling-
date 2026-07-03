import React from 'react';

export default function Spinner({ size = 'md', color = 'var(--accent)' }) {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '36px',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          width: ${currentSize};
          height: ${currentSize};
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
