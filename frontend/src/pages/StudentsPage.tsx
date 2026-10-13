// Students Page with Search, Filter, Sort, Pagination (Modern Dashboard Style)
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { studentsApi, programsApi, authApi, setAuthToken } from '../api';
import type { Student, StudentFilters, Program } from '../types/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  X,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor, getInitials } from '../utils';
import { AppError } from '../utils/errors';
import { Button } from '../components/ui/Button';

// Schemas
const studentSchema = z.object({
  student_number: z.string().min(1, 'Student number is required'),
  user_id: z.number().nullable().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  program_id: z.number().min(1, 'Program is required'),
  year_level: z.number().min(1).max(6),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']),
});

type StudentFormValues = z.infer<typeof studentSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

interface ActionButtonsProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
  onImpersonate: (student: Student) => void;
  deletingId: number | null;
  impersonatingId: number | null;
  isAdmin: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  student, 
  onEdit, 
  onDelete, 
  onView, 
  onImpersonate,
  deletingId, 
  impersonatingId,
  isAdmin 
}) => (
  <div className="flex items-center gap-1">
    <Tooltip content="View student">
      <button
        onClick={() => onView(student)}
        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        aria-label="View student"
      >
        <Eye className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Edit student">
      <button
        onClick={() => onEdit(student)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Edit student"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    {isAdmin && student.user_id && (
      <Tooltip content="Impersonate student">
        <button
          onClick={() => onImpersonate(student)}
          disabled={impersonatingId === student.id}
          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Impersonate student"
        >
          {impersonatingId === student.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserCog className="w-4 h-4" />
          )}
        </button>
      </Tooltip>
    )}
    <Tooltip content="Deactivate student">
      <button
        onClick={() => onDelete(student)}
        disabled={deletingId === student.id}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
        aria-label="Deactivate student"
      >
        {deletingId === student.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Student Modal
interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormValues) => Promise<void>;
  student?: Student | null;
  isLoading: boolean;
  programs: { id: number; name: string; code: string }[];
}

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  isLoading,
  programs,
}) => {
  const isEditing = !!student;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student_number: '',
      user_id: null,
      first_name: '',
      last_name: '',
      middle_name: null,
      email: '',
      phone: '',
      address: '',
      birth_date: '',
      program_id: 0,
      year_level: 1,
      status: 'ACTIVE' as const,
    },
  });

  useEffect(() => {
    if (isOpen && student) {
      reset({
        student_number: student.student_number,
        user_id: student.user_id,
        first_name: student.first_name,
        last_name: student.last_name,
        middle_name: student.middle_name,
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        birth_date: student.birth_date || '',
        program_id: student.program_id,
        year_level: student.year_level,
        status: student.status,
      });
    } else if (isOpen && !student) {
      reset({
        student_number: '',
        user_id: null,
        first_name: '',
        last_name: '',
        middle_name: null,
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        program_id: 0,
        year_level: 1,
        status: 'ACTIVE',
      });
    }
  }, [isOpen, student, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Student' : 'Create Student'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Number */}
              <div>
                <label htmlFor="student_number" className="block text-sm font-medium text-slate-700 mb-1">
                  Student Number <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('student_number')}
                  id="student_number"
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.student_number && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isEditing || isLoading}
                  aria-invalid={errors.student_number ? 'true' : 'false'}
                />
                {errors.student_number && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.student_number.message}</p>
                )}
              </div>

              {/* Program */}
              <div>
                <label htmlFor="program_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Program <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('program_id', { valueAsNumber: true })}
                  id="program_id"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.program_id && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.program_id ? 'true' : 'false'}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
                {errors.program_id && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.program_id.message}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('first_name')}
                  id="first_name"
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.first_name && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.first_name ? 'true' : 'false'}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('last_name')}
                  id="last_name"
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.last_name && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.last_name ? 'true' : 'false'}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.last_name.message}</p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium text-slate-700 mb-1">
                  Middle Name
                </label>
                <input
                  {...register('middle_name')}
                  id="middle_name"
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.email && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  id="phone"
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>

              {/* Year Level */}
              <div>
                <label htmlFor="year_level" className="block text-sm font-medium text-slate-700 mb-1">
                  Year Level <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('year_level', { valueAsNumber: true })}
                  id="year_level"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.year_level && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.year_level ? 'true' : 'false'}
                >
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
                {errors.year_level && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.year_level.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>

              {/* Birth Date */}
              <div className="md:col-span-2">
                <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Birth Date
                </label>
                <input
                  {...register('birth_date')}
                  id="birth_date"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            <div id="modal-error" className="mt-4 hidden" role="alert" aria-live="polite"></div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmText: string;
  isLoading: boolean;
  variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isLoading,
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 id="confirm-title" className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={async () => {
                  await onConfirm();
                  onClose();
                }}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    program_id: undefined,
    year_level: undefined,
    status: undefined,
    sort: 'last_name',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch programs for dropdown using programsApi
  const { data: programsData } = useQuery({
    queryKey: ['programs', 'list'],
    queryFn: () => programsApi.list({ per_page: 100 }),
    select: (data) => data.data.map((p: Program) => ({ id: p.id, name: p.name, code: p.code })),
  });

  const programs = programsData || [];

  // Fetch students with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsApi.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: StudentFormValues) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setModalOpen(false);
      setEditingStudent(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentFormValues> }) => studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setModalOpen(false);
      setEditingStudent(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDeleteConfirm(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Impersonation mutation
  const impersonateMutation = useMutation({
    mutationFn: (userId: number) => authApi.impersonate(userId),
    onSuccess: (response) => {
      // Store the impersonation token and redirect
      // Response is ApiResponse<LoginResponse> = { data: LoginResponse, links?, meta? }
      const loginResponse = response.data;
      const { token, redirect_url } = loginResponse;
      setAuthToken(token);
      window.location.href = redirect_url;
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof StudentFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (per_page: number) => {
    setFilters((prev) => ({ ...prev, per_page, page: 1 }));
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const openDeleteConfirm = (student: Student) => {
    setDeleteConfirm(student);
  };

  const openViewModal = (student: Student) => {
    // Navigate to academic records page with student ID as query parameter
    navigate(`/academic-records?student_id=${student.id}`);
  };

  const handleSubmit = async (data: StudentFormValues) => {
    setGlobalError(null);
    const submitData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      birth_date: data.birth_date || null,
      middle_name: data.middle_name || null,
      user_id: data.user_id || null,
    };

    if (editingStudent) {
      await updateMutation.mutateAsync({ id: editingStudent.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      program_id: undefined,
      year_level: undefined,
      status: undefined,
      sort: 'last_name',
      page: 1,
      per_page: 20,
    });
  };

  const hasActiveFilters = filters.search || filters.program_id || filters.year_level || filters.status;

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-500 mt-1">Manage student records</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Add Student
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-2/3"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-1/3"></div></td>
                    <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    const appError = AppError.fromApiError(error);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-500 mt-1">Manage student records</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Add Student
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load students</h3>
          <p className="text-slate-500 mb-4">{appError.message}</p>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const students = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 mt-1">Manage student records</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Add Student
        </Button>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, student number, or email..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              aria-label="Search students"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.program_id || ''}
              onChange={(e) => handleFilterChange('program_id', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-w-[180px] bg-white"
              aria-label="Filter by program"
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>

            <select
              value={filters.year_level || ''}
              onChange={(e) => handleFilterChange('year_level', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-w-[140px] bg-white"
              aria-label="Filter by year level"
            >
              <option value="">All Year Levels</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-w-[140px] bg-white"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
            </select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No students found</h3>
            <p className="text-slate-500 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Get started by adding your first student.'}
            </p>
            {!hasActiveFilters && (
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                Add Student
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="grid">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <code className="text-sm font-mono text-slate-900">{student.student_number}</code>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                            {getInitials(`${student.first_name} ${student.last_name}`)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{student.first_name} {student.last_name}</p>
                            {student.middle_name && (
                              <p className="text-sm text-slate-500">{student.middle_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {student.email ? (
                          <a href={`mailto:${student.email}`} className="text-sm text-primary-600 hover:underline">
                            {student.email}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {student.program ? (
                          <span className="text-sm text-slate-900">{student.program.code} - {student.program.name}</span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">Year {student.year_level}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          student={student}
                          onEdit={openEditModal}
                          onDelete={openDeleteConfirm}
                          onView={openViewModal}
                          onImpersonate={(student) => impersonateMutation.mutate(student.user_id!)}
                          deletingId={deleteMutation.variables as number | null}
                          impersonatingId={impersonateMutation.variables as number | null}
                          isAdmin={user?.role === 'ADMIN'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Showing {meta.from} to {meta.to} of {meta.total} results
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.per_page}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                    aria-label="Items per page"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} per page
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ChevronLeft className="w-5 h-5" />}
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1 || isLoading}
                    aria-label="Previous page"
                  />
                  <span className="text-sm text-slate-600">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ChevronRight className="w-5 h-5" />}
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page || isLoading}
                    aria-label="Next page"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        student={editingStudent}
        isLoading={createMutation.isPending || updateMutation.isPending}
        programs={programs}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${deleteConfirm?.first_name} ${deleteConfirm?.last_name} (${deleteConfirm?.student_number})? This action cannot be undone.`}
        confirmText="Deactivate"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      </div>
  );
};