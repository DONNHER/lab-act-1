// Grades Page with Search, Filter, Sort, Pagination (for Instructors/Admins/Registrars)
// Student view shows read-only academic record format
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { gradesApi, enrollmentsApi, studentsApi } from '../api';
import { useAuth } from '../contexts';
import type { Grade, Enrollment } from '../types/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor } from '../utils';
import { AppError } from '../utils/errors';

// Schemas
const gradeSchema = z.object({
  enrollment_id: z.number().min(1, 'Enrollment is required'),
  midterm_grade: z.number().min(0, 'Grade cannot be negative').max(100, 'Grade cannot exceed 100').nullable().optional(),
  final_grade: z.number().min(0, 'Grade cannot be negative').max(100, 'Grade cannot exceed 100').nullable().optional(),
  remarks: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

type GradeFormValues = z.infer<typeof gradeSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const ActionButtons: React.FC<{
  grade: Grade;
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
  deletingId: number | null;
}> = ({ grade, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Edit grade">
      <button
        onClick={() => onEdit(grade)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
        aria-label="Edit grade"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Delete grade">
      <button
        onClick={() => onDelete(grade)}
        disabled={deletingId === grade.id}
        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors disabled:opacity-50"
        aria-label="Delete grade"
      >
        {deletingId === grade.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Grade Modal
interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GradeFormValues) => Promise<void>;
  grade?: Grade | null;
  isLoading: boolean;
  enrollments: { id: number; name: string; code: string }[];
}

const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grade,
  isLoading,
  enrollments,
}) => {
  const isEditing = !!grade;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      enrollment_id: 0,
      midterm_grade: null,
      final_grade: null,
      remarks: '',
      status: 'DRAFT' as const,
    },
  });

  React.useEffect(() => {
    if (isOpen && grade) {
      reset({
        enrollment_id: grade.enrollment_id,
        midterm_grade: grade.midterm_grade,
        final_grade: grade.final_grade,
        remarks: grade.remarks || '',
        status: grade.status,
      });
    } else if (isOpen && !grade) {
      reset({
        enrollment_id: 0,
        midterm_grade: null,
        final_grade: null,
        remarks: '',
        status: 'DRAFT',
      });
    }
  }, [isOpen, grade, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Grade' : 'Add Grade'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]" noValidate>
            <div className="space-y-4">
              {/* Enrollment */}
              <div>
                <label htmlFor="enrollment_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('enrollment_id', { valueAsNumber: true })}
                  id="enrollment_id"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.enrollment_id && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isEditing || isLoading}
                  aria-invalid={errors.enrollment_id ? 'true' : 'false'}
                >
                  <option value="">Select Enrollment</option>
                  {enrollments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.code} - {e.name}
                    </option>
                  ))}
                </select>
                {errors.enrollment_id && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.enrollment_id.message}</p>
                )}
              </div>

              {/* Midterm Grade */}
              <div>
                <label htmlFor="midterm_grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Midterm Grade
                </label>
                <input
                  {...register('midterm_grade', { valueAsNumber: true })}
                  id="midterm_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0-100"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.midterm_grade && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.midterm_grade ? 'true' : 'false'}
                />
                {errors.midterm_grade && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.midterm_grade.message}</p>
                )}
              </div>

              {/* Final Grade */}
              <div>
                <label htmlFor="final_grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Final Grade
                </label>
                <input
                  {...register('final_grade', { valueAsNumber: true })}
                  id="final_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0-100"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.final_grade && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.final_grade ? 'true' : 'false'}
                />
                {errors.final_grade && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.final_grade.message}</p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  {...register('remarks')}
                  id="remarks"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isLoading}
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isLoading}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            <div id="modal-error" className="mt-4 hidden" role="alert" aria-live="polite"></div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  isLoading ? 'bg-red-500/50 cursor-wait' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : isEditing ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
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
            <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onConfirm();
                  onClose();
                }}
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  variant === 'danger'
                    ? (isLoading ? 'bg-red-500/50 cursor-wait' : 'bg-red-600 hover:bg-red-700')
                    : (isLoading ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:bg-primary-hover')
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {confirmText}...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GradesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const canManageGrades = ['ADMIN', 'REGISTRAR', 'INSTRUCTOR'].includes(user?.role ?? '');
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }>({
    search: '',
    status: undefined,
    sort: 'created_at',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Grade | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch enrollments for dropdown (only for non-students)
  const { data: enrollmentsData } = useQuery({
    queryKey: ['enrollments', 'list'],
    queryFn: () => enrollmentsApi.list({ per_page: 100, status: 'ENROLLED' }),
    select: (data) => data.data.map((e: Enrollment) => ({ 
      id: e.id, 
      name: `${e.student?.first_name} ${e.student?.last_name}`, 
      code: `${e.course_offering?.course?.course_code} - ${e.course_offering?.section}` 
    })),
    enabled: canManageGrades,
  });

  const enrollments = enrollmentsData || [];

  // For students, fetch their own grades using the student-specific endpoint
  // For others, use the general grades list with filters
  const { data: meData } = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => studentsApi.me(),
    enabled: isStudent,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: isStudent ? ['grades', 'student', meData?.data?.id] : ['grades', filters],
    queryFn: () => isStudent ? studentsApi.grades(meData!.data!.id) : gradesApi.list(filters),
    enabled: isStudent ? !!meData?.data?.id : true,
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: GradeFormValues) => gradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setModalOpen(false);
      setEditingGrade(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GradeFormValues> }) => gradesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setModalOpen(false);
      setEditingGrade(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => gradesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setDeleteConfirm(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (per_page: number) => {
    setFilters((prev) => ({ ...prev, per_page, page: 1 }));
  };

  const openCreateModal = () => {
    setEditingGrade(null);
    setModalOpen(true);
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setModalOpen(true);
  };

  const openDeleteConfirm = (grade: Grade) => {
    setDeleteConfirm(grade);
  };

  const handleSubmit = async (data: GradeFormValues) => {
    setGlobalError(null);
    const submitData = {
      ...data,
      midterm_grade: data.midterm_grade ?? null,
      final_grade: data.final_grade ?? null,
      remarks: data.remarks || null,
    };
    if (editingGrade) {
      await updateMutation.mutateAsync({ id: editingGrade.id, data: submitData });
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
      status: undefined,
      sort: 'created_at',
      page: 1,
      per_page: 20,
    });
  };

  const hasActiveFilters = filters.search || filters.status;

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          {canManageGrades && <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Grade
          </button>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Midterm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td className="px-4 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
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
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          {canManageGrades && <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Grade
          </button>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load grades</h3>
          <p className="text-gray-500 mb-4">{appError.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const grades = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-500 mt-1">Manage student grades</p>
        </div>
        {canManageGrades && <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Grade
        </button>}
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search grades"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px]"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Midterm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="w-12 h-12 text-gray-300" />
                      <p>No grades found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Add your first grade
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {grade.enrollment?.student?.first_name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{grade.enrollment?.student?.first_name} {grade.enrollment?.student?.last_name}</p>
                          <p className="text-sm text-gray-500">{grade.enrollment?.student?.student_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{grade.enrollment?.course_offering?.course?.course_code} - {grade.enrollment?.course_offering?.section}</p>
                        <p className="text-sm text-gray-500">{grade.enrollment?.course_offering?.course?.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{grade.midterm_grade !== null ? grade.midterm_grade : '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{grade.final_grade !== null ? grade.final_grade : '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={grade.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      {canManageGrades ? (
                        <ActionButtons
                          grade={grade}
                          onEdit={openEditModal}
                          onDelete={openDeleteConfirm}
                          deletingId={deleteMutation.variables as number | null}
                        />
                      ) : <span className="text-sm text-gray-500">View only</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {meta.from} to {meta.to} of {meta.total} results
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filters.per_page || 20}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  aria-label="Results per page"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                    let pageNum: number;
                    if (meta.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (meta.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (meta.current_page >= meta.last_page - 2) {
                      pageNum = meta.last_page - 4 + i;
                    } else {
                      pageNum = meta.current_page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                          meta.current_page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        )}
                        aria-label={`Page ${pageNum}`}
                        aria-current={meta.current_page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {canManageGrades && <GradeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGrade(null);
        }}
        onSubmit={handleSubmit}
        grade={editingGrade}
        isLoading={createMutation.isPending || updateMutation.isPending}
        enrollments={enrollments}
      />}

      {canManageGrades && <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Grade"
        message={`Are you sure you want to delete the grade for "${deleteConfirm?.enrollment?.student?.first_name} {deleteConfirm?.enrollment?.student?.last_name}" in "{deleteConfirm?.enrollment?.course_offering?.course?.code} - {deleteConfirm?.enrollment?.course_offering?.section}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />}
    </div>
  );
};
