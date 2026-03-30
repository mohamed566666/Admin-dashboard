import api from './api';
import { DepartmentResponse, DepartmentCreate, DepartmentUpdate } from './types';

export const departmentsService = {
  // Create department
  createDepartment: async (name: string): Promise<DepartmentResponse> => {
    const response = await api.post('/departments', { name });
    return response.data;
  },

  // List all departments
  listDepartments: async (): Promise<DepartmentResponse[]> => {
    const response = await api.get('/departments');
    return response.data;
  },

  // Get department by ID
  getDepartment: async (deptId: number): Promise<DepartmentResponse> => {
    const response = await api.get(`/departments/${deptId}`);
    return response.data;
  },

  // Rename department
  renameDepartment: async (deptId: number, name: string): Promise<DepartmentResponse> => {
    const response = await api.patch(`/departments/${deptId}`, { name });
    return response.data;
  },

  // Delete department
  deleteDepartment: async (deptId: number): Promise<void> => {
    await api.delete(`/departments/${deptId}`);
  },
};