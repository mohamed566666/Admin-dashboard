import api from "./api";
import {
  EmployeeResponse,
  EmployeeCreate,
  EmployeeRegisterResponse,
  WorkedHoursAdd,
  WorkedHoursSet,
  PaginatedResponse,
} from "./types";

export const employeesService = {
  registerWithPhoto: async (
    name: string,
    username: string,
    photo: File,
    managerId?: number | null,
  ): Promise<EmployeeRegisterResponse> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);

    // ✅ إضافة manager_id فقط إذا كان موجود
    if (managerId !== undefined && managerId !== null) {
      formData.append("manager_id", managerId.toString());
    }

    // ✅ إضافة الصورة بالكامل بدون أي تعديل
    formData.append("photo", photo);

    console.log("📤 Sending registration request:", {
      name,
      username,
      managerId,
      photoName: photo.name,
      photoSize: photo.size,
      photoType: photo.type,
    });

    const response = await api.post("/employees/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // ✅ زيادة timeout للسماح بمعالجة الصورة في الباك
      timeout: 30000,
    });

    console.log("✅ Registration response:", response.data);
    return response.data;
  },

  createEmployee: async (data: EmployeeCreate): Promise<EmployeeResponse> => {
    const response = await api.post("/employees", data);
    return response.data;
  },

  // ✅ للـ صفحات اللي فيها Pagination (UserManagement)
  listEmployeesPaginated: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<EmployeeResponse>> => {
    try {
      console.log("[employeesService] Fetching paginated employees:", {
        page,
        pageSize,
      });
      const response = await api.get("/employees", {
        params: {
          page: page,
          page_size: Math.min(pageSize, 100), // الحد الأقصى 100
        },
      });
      console.log("[employeesService] Paginated response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [employeesService] Error fetching paginated employees:",
        error,
      );
      return {
        data: [],
        total: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 0,
      };
    }
  },

  // ✅ للـ صفحات اللي مش فيها Pagination (Dashboard, SessionLogs)
  // بترجع كل الموظفين مرة واحدة باستخدام الحد الأقصى المسموح
  listEmployees: async (): Promise<EmployeeResponse[]> => {
    try {
      console.log(
        "[employeesService] Fetching all employees (for non-paginated view)",
      );

      // استخدم الحد الأقصى المسموح (100)
      const response = await api.get("/employees", {
        params: {
          page: 1,
          page_size: 100, // ✅ الحد الأقصى المسموح في الباك
        },
      });

      console.log("[employeesService] listEmployees response:", response.data);

      // الـ Backend بيرجع: { data: [...], total, page, page_size, total_pages }
      if (response.data?.data && Array.isArray(response.data.data)) {
        const total = response.data.total || 0;
        const currentCount = response.data.data.length;
        console.log(
          `[employeesService] Got ${currentCount} employees out of ${total} total`,
        );

        // لو في موظفين أكثر من 100، هنحتاج نجيب الصفحات التانية
        if (total > currentCount) {
          console.log(
            `[employeesService] Warning: There are ${total - currentCount} more employees not loaded. Consider using pagination.`,
          );
        }

        return response.data.data;
      }

      // Fallback لو الـ response شكل تاني
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error("❌ [employeesService] Error fetching employees:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        params: error.config?.params,
      });
      return [];
    }
  },

  listByDepartment: async (
    departmentId: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<EmployeeResponse>> => {
    const response = await api.get(`/employees/department/${departmentId}`, {
      params: { page, page_size: Math.min(pageSize, 100) },
    });
    return response.data;
  },

  getEmployee: async (employeeId: number): Promise<EmployeeResponse> => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  addWorkedHours: async (
    employeeId: number,
    hours: number,
  ): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/add`, {
      hours,
    });
    return response.data;
  },

  setWorkedHours: async (
    employeeId: number,
    hours: number,
  ): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/set`, {
      hours,
    });
    return response.data;
  },

  resetWorkedHours: async (employeeId: number): Promise<EmployeeResponse> => {
    const response = await api.patch(`/employees/${employeeId}/hours/reset`);
    return response.data;
  },

  deleteEmployee: async (employeeId: number): Promise<void> => {
    await api.delete(`/employees/${employeeId}`);
  },
};
