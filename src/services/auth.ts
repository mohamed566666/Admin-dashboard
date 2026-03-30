import api from './api';
import Cookies from 'js-cookie';
import { LoginRequest, TokenResponse } from './types';

const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    
    console.log('Login successful, saving tokens...');
    
    if (data.access_token) {
      Cookies.set('access_token', data.access_token, COOKIE_OPTIONS);
    }
    if (data.refresh_token) {
      Cookies.set('refresh_token', data.refresh_token, COOKIE_OPTIONS);
    }
    
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('username', credentials.username);
    
    return data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  },

  getCurrentRole: (): string | null => {
    return localStorage.getItem('user_role');
  },

  getCurrentUsername: (): string | null => {
    return localStorage.getItem('username');
  },

  isAuthenticated: (): boolean => {
    const token = Cookies.get('access_token');
    return !!token;
  },
};