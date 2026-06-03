import { create } from 'zustand';
import axios from 'axios';

// Configure axios globally
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      // In a real app we would have an endpoint like GET /api/auth/me to get current user.
      // Since there's no such endpoint, we will assume user state from successful login.
      // Wait, let's keep it simple: if there's no auth check endpoint, we'll rely on localstorage or just memory state.
      const userStr = localStorage.getItem('user');
      if (userStr) {
        set({ user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    try {
      const res = await axios.post('/auth/login', credentials);
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (data) => {
    try {
      const res = await axios.post('/auth/register', data);
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    // In a real app we'd also call a logout endpoint to clear the cookie.
  }
}));

export default useAuthStore;
