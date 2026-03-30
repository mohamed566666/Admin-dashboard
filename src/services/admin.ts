import api from './api';
import { UserResponse, UserCreate } from './types';

export const adminService = {
  // Bootstrap first admin (no auth needed)
  bootstrap: async (username: string, password: string): Promise<UserResponse> => {
    const response = await api.post('/admin/seed', { username, password });
    return response.data;
  },

  // Create admin (requires admin auth)
  createAdmin: async (username: string, password: string): Promise<UserResponse> => {
    const response = await api.post('/admin', { username, password });
    return response.data;
  },

  // List all admins
  listAdmins: async (): Promise<UserResponse[]> => {
    const response = await api.get('/admin');
    return response.data;
  },

  // Get admin by ID
  getAdmin: async (adminId: number): Promise<UserResponse> => {
    const response = await api.get(`/admin/${adminId}`);
    return response.data;
  },

  // Delete admin
  deleteAdmin: async (adminId: number): Promise<void> => {
    await api.delete(`/admin/${adminId}`);
  },

  // Create manager (admin action)
  createManager: async (username: string, password: string, departmentId?: number | null): Promise<UserResponse> => {
    const response = await api.post('/admin/managers', {
      username,
      password,
      department_id: departmentId,
    });
    return response.data;
  },

  // Delete manager (admin action)
  deleteManager: async (managerId: number): Promise<void> => {
    await api.delete(`/admin/managers/${managerId}`);
  },
};