// src/services/auth.service.js
import api from './api';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post(`/auth/reset-password/${token}`, { newPassword });
  },

  updatePassword: async (currentPassword, newPassword) => {
    return api.post('/auth/update-password', { currentPassword, newPassword });
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  googleLogin: async () => {
    // In a real app, this would redirect to Google OAuth
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },

  facebookLogin: async () => {
    // In a real app, this would redirect to Facebook OAuth
    window.location.href = `${api.defaults.baseURL}/auth/facebook`;
  }
};

export default AuthService;