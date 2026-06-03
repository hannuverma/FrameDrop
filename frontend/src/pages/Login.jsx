import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isEmail = emailOrUsername.includes('@');
    const credentials = { password };
    if (isEmail) credentials.email = emailOrUsername;
    else credentials.username = emailOrUsername;

    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass auth-card animate-fade-in-up">
        <div className="auth-icon">
          <LogIn size={26} color="var(--accent-primary-hover)" />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to FrameDrop</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="input-label">Email or Username</label>
            <input
              className="input-field"
              type="text"
              value={emailOrUsername}
              onChange={e => setEmailOrUsername(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
