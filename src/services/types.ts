export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============ Base Types ============
export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

// ============ Auth Types ============
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: number;
  department_id?: number | null;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

// ============ User Types ============
export interface UserResponse {
  id: number;
  username: string;
  role: string;
  created_at: string;
  department_id?: number | null;
}

export interface UserCreate {
  username: string;
  password: string;
}

// ============ Manager Types ============
export interface ManagerCreate {
  username: string;
  password: string;
  department_id?: number | null;
}

export interface ManagerAssignDept {
  department_id: number;
}

// ============ Department Types ============
export interface DepartmentResponse {
  id: number;
  name: string;
}

export interface DepartmentCreate {
  name: string;
}

export interface DepartmentUpdate {
  name: string;
}

// ============ Employee Types ============
export interface EmployeeResponse {
  id: number;
  name: string;
  username: string;
  department_id: number | null;
  worked_hours: number;
  is_online: boolean;
  created_at: string;
}

export interface EmployeeCreate {
  name: string;
  username: string;
  manager_id?: number | null;
}

export interface EmployeeRegisterResponse {
  employee: EmployeeResponse;
  embedding_registered: boolean;
}

export interface WorkedHoursAdd {
  hours: number;
}

export interface WorkedHoursSet {
  hours: number;
}

// ============ Session Types ============
export interface SessionResponse {
  id: string;
  employee_id: number;
  login_time: string;
  logout_time: string | null;
  end_reason: string | null;
}

export interface LoginWithEmbeddingRequest {
  username: string;
  embedding: number[];
}

export interface SessionClose {
  end_reason: string;
}

// ============ Embedding Types ============
export interface EmbeddingResponse {
  embedding: number[];
}

export interface VerifyResponse {
  username: string;
  match: boolean;
  similarity: number;
}

export interface CompareResponse {
  match: boolean;
  similarity: number;
  threshold_used: number;
}

export interface ConfigResponse {
  similarity_threshold: number;
  lock_threshold: number;
  detection_interval: number;
  no_face_penalty: number;
  auto_unlock: boolean;
  enhanced_liveness: boolean;
  updated_at: string;
  updated_by: number | null;
}

export interface ConfigUpdateRequest {
  similarity_threshold?: number;
  lock_threshold?: number;
  detection_interval?: number;
  no_face_penalty?: number;
  auto_unlock?: boolean;
  enhanced_liveness?: boolean;
}
