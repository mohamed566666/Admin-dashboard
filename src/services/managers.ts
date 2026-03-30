import api from './api';
import { UserResponse, ManagerAssignDept } from './types';

export const managersService = {
  // List all managers
  listManagers: async (): Promise<UserResponse[]> => {
    const response = await api.get('/managers');
    return response.data;
  },

  // Get manager by ID
  getManager: async (managerId: number): Promise<UserResponse> => {
    const response = await api.get(`/managers/${managerId}`);
    return response.data;
  },

  // Assign department to manager
  assignDepartment: async (managerId: number, departmentId: number): Promise<UserResponse> => {
    const response = await api.patch(`/managers/${managerId}/department`, {
      department_id: departmentId,
    });
    return response.data;
  },
};