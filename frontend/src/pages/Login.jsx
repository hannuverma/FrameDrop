import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogIn } from 'lucide-react';

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
    
    // Determine if it's an email or username based on '@'
    const isEmail = emailOrUsername.includes('@');
    const credentials = {
      password,
    };
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
    <div className="container d-flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <div className="d-flex justify-center mb-4">
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <LogIn size={32} color="var(--primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to FrameDrop</p>
        </div>

        {error && (
          <div className="mb-4" style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Email or Username</label>
            <input 
              type="text" 
              value={emailOrUsername} 
              onChange={e => setEmailOrUsername(e.target.value)} 
              placeholder="Enter email or username"
              required 
            />
          </div>
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="mt-2" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
