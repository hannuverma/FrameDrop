import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Sidebar from './components/Sidebar';
import { LogOut } from 'lucide-react';

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

  if (isLoading) return <div className="container text-center mt-4">Loading...</div>;

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-brand">FrameDrop</div>
          <div className="nav-links">
            <span>Welcome, {user?.username}</span>
            <button 
              className="danger d-flex items-center gap-2" 
              onClick={logout}
              style={{ padding: '0.5rem 1rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
      )}
      
      <div style={{ display: 'flex' }}>
        {isAuthenticated && <Sidebar />}
        <div style={{ flex: 1, height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/room/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
