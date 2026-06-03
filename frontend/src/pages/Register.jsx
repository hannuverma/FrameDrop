import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    about: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
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
          <UserPlus size={26} color="var(--accent-primary-hover)" />
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join FrameDrop and start sharing</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="input-label">Username</label>
            <input
              className="input-field"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
            />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="input-label">About <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span></label>
            <textarea
              className="input-field"
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="2"
              style={{ resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} /> Creating…</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
