import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Sidebar from './components/Sidebar';
import { LogOut, Droplets } from 'lucide-react';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { checkAuth, isAuthenticated, isLoading, logout, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading FrameDrop…</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={22} />
            FrameDrop
          </div>
          <div className="nav-right">
            <span className="nav-user">
              Hey, <strong>{user?.username}</strong>
            </span>
            <button className="btn btn-danger" onClick={logout} style={{ fontSize: '0.8125rem' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </nav>
      )}

      {isAuthenticated ? (
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/room/:id" element={<Room />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
