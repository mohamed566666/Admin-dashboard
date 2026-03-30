import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await promise;
      setState({ data, loading: false, error: null });
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  return { ...state, execute };
}