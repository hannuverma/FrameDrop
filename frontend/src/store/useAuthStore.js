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
      const res = await axios.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
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
