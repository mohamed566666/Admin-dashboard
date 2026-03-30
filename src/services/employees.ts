import api from './api';
import {
  EmployeeResponse,
  EmployeeCreate,
  EmployeeRegisterResponse,
  WorkedHoursAdd,
  WorkedHoursSet,
} from './types';

export const employeesService = {
  // Register employee with photo
registerWithPhoto: async (
  name: string,
  username: string,
  photo: File,
  managerId?: number | null
): Promise<EmployeeRegisterResponse> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('username', username);
  if (managerId !== undefined && managerId !== null) {
    formData.append('manager_id', managerId.toString());
  }
  formData.append('photo', photo);

  const response = await api.post('/employees/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

  // Create employee without photo
  createEmployee: async (data: EmployeeCreate): Promise<EmployeeResponse> => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // List all employees
  listEmployees: async (): Promise<EmployeeResponse[]> => {
    const response = await api.get('/employees');
    return response.data;
  },

  // List employees by department
  listByDepartment: async (departmentId: number): Promise<EmployeeResponse[]> => {
    const response = await api.get(`/employees/department/${departmentId}`);
    return response.data;
  },

  // Get employee by ID
  getEmployee: async (employeeId: number): Promise<EmployeeResponse> => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  // Add worked hours
  addWorkedHours: async (employeeId: number, hours: number): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/add`, { hours });
    return response.data;
  },

  // Set worked hours
  setWorkedHours: async (employeeId: number, hours: number): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/set`, { hours });
    return response.data;
  },

  // Reset worked hours
  resetWorkedHours: async (employeeId: number): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/reset`);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (employeeId: number): Promise<void> => {
    await api.delete(`/employees/${employeeId}`);
  },
};