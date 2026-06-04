import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';

export default function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
