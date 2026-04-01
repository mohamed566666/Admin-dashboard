import api from "./api";
import Cookies from "js-cookie";
import { LoginRequest, TokenResponse } from "./types";

const COOKIE_OPTIONS = {
  expires: 7,
  path: "/",
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;

    console.log("[Auth] Login response:", data);

    if (data.access_token) {
      Cookies.set("access_token", data.access_token, COOKIE_OPTIONS);
    }
    if (data.refresh_token) {
      Cookies.set("refresh_token", data.refresh_token, COOKIE_OPTIONS);
    }

    localStorage.setItem("user_role", data.role);
    localStorage.setItem("username", credentials.username);
    localStorage.setItem("department_id", data.department_id ? data.department_id.toString() : "null");

    // Store manager_id from login response
    if (data.user_id) {
      localStorage.setItem("manager_id", data.user_id.toString());
      console.log("[Auth] Stored manager_id:", data.user_id);
    } else {
      // Fallback for testing
      localStorage.setItem("manager_id", "1");
      console.log("[Auth] Using default manager_id: 1");
    }

    return data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = Cookies.get("refresh_token");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    localStorage.removeItem("manager_id");
    localStorage.removeItem("department_id");
  },

  getCurrentRole: (): string | null => {
    return localStorage.getItem("user_role");
  },

  getCurrentUsername: (): string | null => {
    return localStorage.getItem("username");
  },

  getManagerId: (): number | null => {
    const id = localStorage.getItem("manager_id");
    return id ? parseInt(id) : null;
  },

  isAuthenticated: (): boolean => {
    const token = Cookies.get("access_token");
    return !!token;
  },
};
