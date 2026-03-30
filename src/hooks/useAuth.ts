import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('access_token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ username, password });
      setIsLoading(false);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (err: any) {
      setIsLoading(false);
      setIsAuthenticated(false);
      const message = err.response?.data?.detail || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUsername = useCallback((): string | null => {
    return authService.getCurrentUsername();
  }, []);

  const getCurrentRole = useCallback((): string | null => {
    return authService.getCurrentRole();
  }, []);

  return {
    login,
    logout,
    isAuthenticated,
    getCurrentUsername,
    getCurrentRole,
    isLoading,
    error,
  };
};