// Centralized API Client
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  ApiError,
  LoginCredentials,
  LoginResponse,
  User,
  Student,
  StudentFormData,
  Program,
  ProgramFormData,
  Course,
  CourseFormData,
  AcademicTerm,
  AcademicTermFormData,
  CourseOffering,
  CourseOfferingFormData,
  Enrollment,
  EnrollmentFormData,
  Grade,
  GradeFormData,
  AcademicRecord,
} from '../types/api';

// Re-export types for consumers
export type {
  ApiResponse,
  ApiError,
  LoginCredentials,
  LoginResponse,
  User,
  Student,
  StudentFormData,
  StudentFilters,
  Program,
  ProgramFormData,
  Course,
  CourseFormData,
  AcademicTerm,
  AcademicTermFormData,
  CourseOffering,
  CourseOfferingFormData,
  Enrollment,
  EnrollmentFormData,
  Grade,
  GradeFormData,
  AcademicRecord,
  PaginationLinks,
  PaginationMeta,
} from '../types/api';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Token management
let authToken: string | null = null;

// Initialize token from localStorage on module load
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('auth_token');
  if (storedToken) {
    authToken = storedToken;
  }
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token');
    } else {
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'NO TOKEN');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: error.response.data }));
    }

    // Normalize error response
    const normalizedError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

// Generic API methods
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data),

  delete: <T>(url: string) =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data),
};

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<User>('/auth/me'),

  impersonate: (userId: number) =>
    api.post<LoginResponse>(`/auth/impersonate/${userId}`),
};

// Students API
export const studentsApi = {
  list: (params?: {
    search?: string;
    program_id?: number;
    year_level?: number;
    status?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }) => {
    // Filter out undefined, null, and empty string values
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<Student[]>('/students', cleanParams);
  },

  get: (id: number) =>
    api.get<Student>(`/students/${id}`),

  create: (data: StudentFormData) =>
    api.post<Student>('/students', data),

  update: (id: number, data: Partial<StudentFormData>) =>
    api.patch<Student>(`/students/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/students/${id}`),

  enrollments: (studentId: number) =>
    api.get<Enrollment[]>(`/students/${studentId}/enrollments`),

  grades: (studentId: number) =>
    api.get<Grade[]>(`/students/${studentId}/grades`),

  academicRecord: (studentId: number) =>
    api.get<AcademicRecord>(`/students/${studentId}/academic-record`),

  me: () =>
    api.get<Student>('/students/me'),
};

// Programs API
export const programsApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<Program[]>('/programs', cleanParams);
  },

  get: (id: number) =>
    api.get<Program>(`/programs/${id}`),

  create: (data: ProgramFormData) =>
    api.post<Program>('/programs', data),

  update: (id: number, data: Partial<ProgramFormData>) =>
    api.patch<Program>(`/programs/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/programs/${id}`),
};

// Courses API
export const coursesApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<Course[]>('/courses', cleanParams);
  },

  get: (id: number) =>
    api.get<Course>(`/courses/${id}`),

  create: (data: CourseFormData) =>
    api.post<Course>('/courses', data),

  update: (id: number, data: Partial<CourseFormData>) =>
    api.patch<Course>(`/courses/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/courses/${id}`),
};

// Academic Terms API
export const termsApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<AcademicTerm[]>('/academic-terms', cleanParams);
  },

  get: (id: number) =>
    api.get<AcademicTerm>(`/academic-terms/${id}`),

  create: (data: AcademicTermFormData) =>
    api.post<AcademicTerm>('/academic-terms', data),

  update: (id: number, data: Partial<AcademicTermFormData>) =>
    api.patch<AcademicTerm>(`/academic-terms/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/academic-terms/${id}`),
};

// Course Offerings API
export const offeringsApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    // Filter out undefined, null, and empty string values
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<CourseOffering[]>('/course-offerings', cleanParams);
  },

  get: (id: number) =>
    api.get<CourseOffering>(`/course-offerings/${id}`),

  create: (data: CourseOfferingFormData) =>
    api.post<CourseOffering>('/course-offerings', data),

  update: (id: number, data: Partial<CourseOfferingFormData>) =>
    api.patch<CourseOffering>(`/course-offerings/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/course-offerings/${id}`),

  students: (offeringId: number) =>
    api.get<Enrollment[]>(`/course-offerings/${offeringId}/students`),
};

// Users API
export const usersApi = {
  list: (params?: { search?: string; role?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<User[]>('/users', cleanParams);
  },

  get: (id: number) =>
    api.get<User>(`/users/${id}`),

  create: (data: Partial<User>) =>
    api.post<User>('/users', data),

  update: (id: number, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/users/${id}`),
};

// Enrollments API
export const enrollmentsApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<Enrollment[]>('/enrollments', cleanParams);
  },

  get: (id: number) =>
    api.get<Enrollment>(`/enrollments/${id}`),

  create: (data: EnrollmentFormData) =>
    api.post<Enrollment>('/enrollments', data),

  update: (id: number, data: Partial<EnrollmentFormData>) =>
    api.patch<Enrollment>(`/enrollments/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/enrollments/${id}`),
};

// Grades API
export const gradesApi = {
  list: (params?: { search?: string; status?: string; sort?: string; page?: number; per_page?: number }) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
          )
        )
      : {};
    return api.get<Grade[]>('/grades', cleanParams);
  },

  get: (id: number) =>
    api.get<Grade>(`/grades/${id}`),

  create: (data: GradeFormData) =>
    api.post<Grade>('/grades', data),

  update: (id: number, data: Partial<GradeFormData>) =>
    api.patch<Grade>(`/grades/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/grades/${id}`),

  byStudent: (studentId: number) =>
    api.get<Grade[]>(`/students/${studentId}/grades`),
};