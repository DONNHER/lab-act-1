// API Response Types
export interface ApiResponse<T> {
  data: T;
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'REGISTRAR' | 'INSTRUCTOR' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  redirect_url: string;
}

// Student Types
export interface Student {
  id: number;
  student_number: string;
  user_id: number | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  program_id: number;
  year_level: number;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  created_at: string;
  updated_at: string;
  program?: Program;
  user?: User;
}

export interface StudentFormData {
  student_number: string;
  user_id?: number | null;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birth_date?: string | null;
  program_id: number;
  year_level: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
}

export interface StudentFilters {
  search?: string;
  program_id?: number;
  year_level?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  sort?: string;
  page?: number;
  per_page?: number;
}

// Program Types
export interface Program {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ProgramFormData {
  code: string;
  name: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Course Types
export interface Course {
  id: number;
  course_code: string;
  title: string;
  units: number;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  course_code: string;
  title: string;
  units: number;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Academic Term Types
export interface AcademicTerm {
  id: number;
  academic_year: string;
  semester: '1st' | '2nd' | 'Summer';
  start_date: string;
  end_date: string;
  status: 'PLANNED' | 'OPEN' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface AcademicTermFormData {
  academic_year: string;
  semester: '1st' | '2nd' | 'Summer';
  start_date: string;
  end_date: string;
  status?: 'PLANNED' | 'OPEN' | 'CLOSED';
}

// Course Offering Types
export interface CourseOffering {
  id: number;
  course_id: number;
  academic_term_id: number;
  instructor_id: number;
  section: string;
  schedule: string | null;
  room: string | null;
  capacity: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  course?: Course;
  academic_term?: AcademicTerm;
  instructor?: User;
}

export interface CourseOfferingFormData {
  course_id: number;
  academic_term_id: number;
  instructor_id: number;
  section: string;
  schedule?: string | null;
  room?: string | null;
  capacity: number;
  status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
}

// Enrollment Types
export type Enrollment = {
  id: number;
  student_id: number;
  course_offering_id: number;
  enrollment_date: string;
  status: 'ENROLLED' | 'DROPPED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  student?: Student;
  course_offering?: CourseOffering;
  grade?: Grade | null;
};

export interface EnrollmentFormData {
  student_id: number;
  course_offering_id: number;
  enrollment_date?: string;
  status?: 'ENROLLED' | 'DROPPED' | 'COMPLETED';
}

// Grade Types
export interface Grade {
  id: number;
  enrollment_id: number;
  midterm_grade: number | null;
  final_grade: number | null;
  remarks: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  created_at: string;
  updated_at: string;
  enrollment?: Enrollment | null;
}

export interface GradeFormData {
  enrollment_id: number;
  midterm_grade?: number | null;
  final_grade?: number | null;
  remarks?: string | null;
  status?: 'DRAFT' | 'PUBLISHED';
}

// Academic Record Types
export interface AcademicRecord {
  student: Student;
  enrollments: Enrollment[];
  summary: {
    total_units: number;
    completed_units: number;
    gpa: number | null;
  };
  terms: Array<{
    term: {
      id: number;
      academic_year: string;
      semester: string | number;
      start_date: string | null;
      end_date: string | null;
      status: string;
    } | null;
    courses: Array<{
      course: {
        id: number;
        code: string;
        name: string;
        units: number;
      };
      offering: {
        id: number;
        section: string;
        schedule: string | null;
        room: string | null;
        instructor: {
          id: number;
          name: string;
        } | null;
      };
      enrollment: {
        id: number;
        enrollment_date: string | null;
        status: string;
      };
      grade: {
        id: number;
        midterm_grade: number | null;
        final_grade: number | null;
        remarks: string | null;
        status: string;
      } | null;
    }>;
  }>;
}