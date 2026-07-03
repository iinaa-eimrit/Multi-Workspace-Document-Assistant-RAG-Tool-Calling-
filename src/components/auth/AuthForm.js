'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const DEMO_EMAIL = 'demo@docassist.app';
const DEMO_PASSWORD = 'demodemo123';

export default function AuthForm({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName) {
          throw new Error('Display name is required');
        }
        const { data, error } = await signUp(email, password, displayName);
        if (error) throw error;
        
        if (data?.user && !data?.session) {
          setError('Account created! Please check your email to confirm your account.');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      if (error) throw error;
      router.push('/');
    } catch (err) {
      setError('Demo account not available. Please sign up with your own credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{mode === 'login' ? 'Sign In' : 'Create an Account'}</h2>
      {error && <div className="error-message">{error}</div>}

      {mode === 'login' && (
        <button
          type="button"
          className="demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : '→ Try Demo Account'}
        </button>
      )}

      {mode === 'login' && <div className="divider"><span>or sign in with your account</span></div>}

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="input-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        )}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-switch">
        {mode === 'login' ? (
          <p>
            Don't have an account? <Link href="/signup">Sign up</Link>
          </p>
        ) : (
          <p>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        )}
      </div>
      <style jsx>{`
        .auth-form-container {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          max-width: 400px;
          width: 100%;
          margin: 0 auto;
        }
        h2 {
          margin-top: 0;
          text-align: center;
        }
        .error-message {
          color: var(--error);
          background: rgba(248, 113, 113, 0.1);
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
        .demo-btn {
          width: 100%;
          padding: 0.85rem;
          border: 2px solid var(--accent);
          border-radius: 6px;
          background: rgba(34, 211, 238, 0.08);
          color: var(--accent);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-btn:hover:not(:disabled) {
          background: rgba(34, 211, 238, 0.15);
        }
        .demo-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          gap: 1rem;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--surface-border);
        }
        .divider span {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .input-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-primary);
          box-sizing: border-box;
        }
        input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .submit-btn {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          background: var(--gradient-primary);
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .auth-switch {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .auth-switch a {
          color: var(--accent);
          text-decoration: none;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
