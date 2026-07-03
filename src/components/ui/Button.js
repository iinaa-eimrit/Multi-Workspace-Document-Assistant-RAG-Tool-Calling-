import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      background: 'var(--gradient-primary)',
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.39)',
    },
    secondary: {
      background: 'var(--surface)',
      border: '1px solid var(--surface-border)',
      color: 'var(--text-primary)',
    },
    danger: {
      background: 'rgba(248, 113, 113, 0.1)',
      border: '1px solid var(--error)',
      color: 'var(--error)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
    }
  };

  const sizes = {
    sm: { padding: '0.4rem 0.8rem', fontSize: '0.8rem' },
    md: { padding: '0.6rem 1.2rem', fontSize: '0.9rem' },
    lg: { padding: '0.8rem 1.6rem', fontSize: '1rem' },
  };

  const hoverStyle = `
    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--surface-hover);
    }
    .btn-ghost:hover:not(:disabled) {
      color: var(--text-primary);
      background: var(--surface);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <button
        className={`btn btn-${variant} ${className}`}
        style={{ ...baseStyle, ...variants[variant], ...sizes[size] }}
        {...props}
      >
        {props.disabled && variant === 'primary' ? 'Processing...' : children}
      </button>
    </>
  );
}
