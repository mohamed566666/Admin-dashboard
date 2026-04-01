import api from './api';
import { 
  DepartmentResponse, 
  DepartmentCreate, 
  DepartmentUpdate,
  PaginatedResponse 
} from './types';

export const departmentsService = {
  createDepartment: async (name: string): Promise<DepartmentResponse> => {
    const response = await api.post('/departments', { name });
    return response.data;
  },

  // ✅ LIST - بدون pagination parameters (لأن الباك مش بيدعمها)
  listDepartments: async (): Promise<DepartmentResponse[]> => {
    try {
      console.log('[departmentsService] Fetching all departments');
      const response = await api.get('/departments');
      
      console.log('[departmentsService] Raw response:', response.data);
      
      // Handle response format
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ [departmentsService] Error fetching departments:', error);
      return [];
    }
  },

  // ✅ LIST WITH pagination - manual pagination في الفرونت
  listDepartmentsPaginated: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<DepartmentResponse>> => {
    try {
      console.log('[departmentsService] Fetching departments with manual pagination');
      // نجيب كل الأقسام (لأن الباك مش بيدعم pagination)
      const response = await api.get('/departments');
      
      let departments: DepartmentResponse[] = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        departments = response.data.data;
      } else if (Array.isArray(response.data)) {
        departments = response.data;
      }
      
      // Manual pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = departments.slice(start, end);
      
      return {
        data: paginatedData,
        total: departments.length,
        page: page,
        page_size: pageSize,
        total_pages: Math.ceil(departments.length / pageSize),
      };
    } catch (error) {
      console.error('❌ [departmentsService] Error fetching paginated departments:', error);
      return { data: [], total: 0, page: 1, page_size: pageSize, total_pages: 0 };
    }
  },

  getDepartment: async (deptId: number): Promise<DepartmentResponse> => {
    const response = await api.get(`/departments/${deptId}`);
    return response.data;
  },

  renameDepartment: async (deptId: number, name: string): Promise<DepartmentResponse> => {
    const response = await api.patch(`/departments/${deptId}`, { name });
    return response.data;
  },

  deleteDepartment: async (deptId: number): Promise<void> => {
    await api.delete(`/departments/${deptId}`);
  },
};