import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1493225457124-a1a2a4af3045?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1557761469-f29c6e082855?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1526405786016-53d71221b22e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1508739773402-3ce9cef24102?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1485872299829-c673f5194813?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=400",
];

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
    <div className="split-layout">
      <div className="pane-visual">
        <motion.div 
          className="collage-container"
          animate={{ x: ["-5%", "-15%"], y: ["-5%", "-15%"] }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 30, ease: "linear" }}
        >
          {IMAGES.map((src, i) => {
            const randHeight = 250 + Math.random() * 150;
            const yOffset = (i % 3) * 40;
            return (
              <motion.div 
                key={i} 
                className="polaroid"
                style={{ height: randHeight, marginTop: yOffset }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05, rotate: 2, zIndex: 10 }}
              >
                <img src={src} alt="Memory" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="pane-form">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <h1 className="brand-title">FlashRoom</h1>
          <p className="auth-subtitle">Join us and start sharing.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              <motion.div
                className="field-group"
                style={{ marginBottom: 24 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <input 
                  type="text" 
                  name="username"
                  placeholder="Username" 
                  className="input-field"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email address" 
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            </AnimatePresence>

            <motion.button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} /> Signing Up…</>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <div className="toggle-text">
            Already have an account?
            <Link to="/login">Log in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
