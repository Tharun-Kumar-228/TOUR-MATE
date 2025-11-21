import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  signup: async (name, email, password, passwordConfirm, role = 'user') => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        passwordConfirm,
        role,
      });
      const { token, data } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token, loading: false });
      return { success: true, user: data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
