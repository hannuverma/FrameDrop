import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { UserPlus } from 'lucide-react';

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
    <div className="container d-flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <div className="d-flex justify-center mb-4">
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <UserPlus size={32} color="var(--primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join FrameDrop to start sharing</p>
        </div>

        {error && (
          <div className="mb-4" style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              placeholder="johndoe"
              required 
            />
          </div>
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com"
              required 
            />
          </div>
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>
          <div>
            <label className="mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>About (Optional)</label>
            <textarea 
              name="about"
              value={formData.about} 
              onChange={handleChange} 
              placeholder="Tell us about yourself"
              rows="2"
            />
          </div>
          <button type="submit" disabled={loading} className="mt-2" style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
