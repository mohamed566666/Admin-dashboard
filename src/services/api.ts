import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - just add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor - NO auto refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, just clear tokens and redirect to login
    if (error.response?.status === 401) {
      console.log('Unauthorized, clearing tokens...');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('username');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;