import api from './api';
import { SessionResponse, LoginWithEmbeddingRequest, SessionClose } from './types';

export const sessionsService = {
  // Login with embedding (edge device)
  loginWithEmbedding: async (username: string, embedding: number[]): Promise<SessionResponse> => {
    const response = await api.post('/sessions/login', { username, embedding });
    return response.data;
  },

  // Login with image (debug)
  loginWithImage: async (username: string, photo: File): Promise<SessionResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('photo', photo);

    const response = await api.post('/sessions/login/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Open session directly (debug)
  openSessionByUsername: async (username: string): Promise<SessionResponse> => {
    const response = await api.post(`/sessions/open/${username}`);
    return response.data;
  },

  // Close session
  closeSession: async (sessionId: string, endReason: string = 'LOGOUT'): Promise<SessionResponse> => {
    const response = await api.post(`/sessions/${sessionId}/close`, { end_reason: endReason });
    return response.data;
  },

  // List all sessions
  listAllSessions: async (): Promise<SessionResponse[]> => {
    const response = await api.get('/sessions');
    return response.data;
  },

  // List sessions by department
  listByDepartment: async (departmentId: number): Promise<SessionResponse[]> => {
    const response = await api.get(`/sessions/department/${departmentId}`);
    return response.data;
  },

  // List sessions by employee
  listByEmployee: async (employeeId: number): Promise<SessionResponse[]> => {
    const response = await api.get(`/sessions/employee/${employeeId}`);
    return response.data;
  },

  // Get active session for employee
  getActiveSession: async (employeeId: number): Promise<SessionResponse> => {
    const response = await api.get(`/sessions/employee/${employeeId}/active`);
    return response.data;
  },

  // Get session by ID
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
};