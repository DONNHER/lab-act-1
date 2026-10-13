// Courses Page with Search, Filter, Sort, Pagination (Modern Dashboard Style)
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { coursesApi } from '../api';
import type { Course } from '../types/api';
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
  BookOpen,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor } from '../utils';
import { AppError } from '../utils/errors';
import { Button } from '../components/ui/Button';

// Schemas
const courseSchema = z.object({
  course_code: z.string().min(1, 'Course code is required').max(20, 'Code must be 20 characters or less'),
  title: z.string().min(1, 'Course title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().nullable().optional(),
  units: z.number().min(1, 'Units must be at least 1').max(6, 'Units cannot exceed 6'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type CourseFormValues = z.infer<typeof courseSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const ActionButtons: React.FC<{
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  deletingId: number | null;
}> = ({ course, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Edit course">
      <button
        onClick={() => onEdit(course)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Edit course"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Delete course">
      <button
        onClick={() => onDelete(course)}
        disabled={deletingId === course.id}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
        aria-label="Delete course"
      >
        {deletingId === course.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Course Modal
interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormValues) => Promise<void>;
  course?: Course | null;
  isLoading: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  course,
  isLoading,
}) => {
  const isEditing = !!course;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_code: '',
      title: '',
      description: '',
      units: 3,
      status: 'ACTIVE' as const,
    },
  });

  React.useEffect(() => {
    if (isOpen && course) {
      reset({
        course_code: course.course_code,
        title: course.title,
        description: course.description || '',
        units: course.units,
        status: course.status,
      });
    } else if (isOpen && !course) {
      reset({
        course_code: '',
        title: '',
        description: '',
        units: 3,
        status: 'ACTIVE',
      });
    }
  }, [isOpen, course, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Course' : 'Create Course'}
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
            <div className="space-y-4">
              {/* Course Code */}
              <div>
                <label htmlFor="course_code" className="block text-sm font-medium text-slate-700 mb-1">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('course_code')}
                  id="course_code"
                  type="text"
                  maxLength={20}
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.course_code && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isEditing || isLoading}
                  aria-invalid={errors.course_code ? 'true' : 'false'}
                />
                {errors.course_code && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.course_code.message}</p>
                )}
              </div>

              {/* Course Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('title')}
                  id="title"
                  type="text"
                  maxLength={100}
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.title && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.title ? 'true' : 'false'}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={isLoading}
                />
              </div>

              {/* Units */}
              <div>
                <label htmlFor="units" className="block text-sm font-medium text-slate-700 mb-1">
                  Units <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('units', { valueAsNumber: true })}
                  id="units"
                  type="number"
                  min="1"
                  max="6"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.units && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.units ? 'true' : 'false'}
                />
                {errors.units && (
                  <p className="mt-1 text-sm text-rose-600" role="alert">{errors.units.message}</p>
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
                </select>
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

export const CoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }>({
    search: '',
    status: undefined,
    sort: 'course_code',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch courses with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseFormValues) => coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setModalOpen(false);
      setEditingCourse(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CourseFormValues> }) => coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setModalOpen(false);
      setEditingCourse(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
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
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const openDeleteConfirm = (course: Course) => {
    setDeleteConfirm(course);
  };

  const handleSubmit = async (data: CourseFormValues) => {
    setGlobalError(null);
    if (editingCourse) {
      await updateMutation.mutateAsync({ id: editingCourse.id, data });
    } else {
      await createMutation.mutateAsync(data);
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
      sort: 'course_code',
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
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
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
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load courses</h3>
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

  const courses = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">Manage courses</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
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
              placeholder="Search by code or title..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search courses"
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                      <p>No courses found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Create your first course
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {course.course_code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{course.title}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {course.units} unit{course.units !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={course.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ActionButtons
                        course={course}
                        onEdit={openEditModal}
                        onDelete={openDeleteConfirm}
                        deletingId={deleteMutation.variables as number | null}
                      />
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
      <CourseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmit}
        course={editingCourse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete the course "${deleteConfirm?.course_code} - ${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};