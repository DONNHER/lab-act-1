// Academic Terms Page with Search, Filter, Sort, Pagination
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { termsApi } from '../api';
import type { AcademicTerm } from '../types/api';
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
  Calendar,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor } from '../utils';
import { AppError } from '../utils/errors';

// Schemas
const termSchema = z.object({
  academic_year: z.string().min(1, 'Academic year is required').max(20, 'Year must be 20 characters or less'),
  semester: z.enum(['1st', '2nd', 'Summer']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['PLANNED', 'OPEN', 'CLOSED']),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after start date',
  path: ['end_date'],
});

type TermFormValues = z.infer<typeof termSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const ActionButtons: React.FC<{
  term: AcademicTerm;
  onEdit: (term: AcademicTerm) => void;
  onDelete: (term: AcademicTerm) => void;
  deletingId: number | null;
}> = ({ term, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Edit academic term">
      <button
        onClick={() => onEdit(term)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
        aria-label="Edit academic term"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Delete academic term">
      <button
        onClick={() => onDelete(term)}
        disabled={deletingId === term.id}
        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors disabled:opacity-50"
        aria-label="Delete academic term"
      >
        {deletingId === term.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Term Modal
interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TermFormValues) => Promise<void>;
  term?: AcademicTerm | null;
  isLoading: boolean;
}

const TermModal: React.FC<TermModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  term,
  isLoading,
}) => {
  const isEditing = !!term;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      academic_year: '',
      semester: '1st' as const,
      start_date: '',
      end_date: '',
      status: 'PLANNED' as const,
    },
  });

  React.useEffect(() => {
    if (isOpen && term) {
      reset({
        academic_year: term.academic_year,
        semester: term.semester,
        start_date: term.start_date,
        end_date: term.end_date,
        status: term.status,
      });
    } else if (isOpen && !term) {
      reset({
        academic_year: '',
        semester: '1st',
        start_date: '',
        end_date: '',
        status: 'PLANNED',
      });
    }
  }, [isOpen, term, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Academic Term' : 'Create Academic Term'}
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
              {/* Academic Year */}
              <div>
                <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('academic_year')}
                  id="academic_year"
                  type="text"
                  maxLength={20}
                  placeholder="e.g., 2024-2025"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.academic_year && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isEditing || isLoading}
                  aria-invalid={errors.academic_year ? 'true' : 'false'}
                />
                {errors.academic_year && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.academic_year.message}</p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('semester')}
                  id="semester"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.semester && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.semester ? 'true' : 'false'}
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.semester.message}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('start_date')}
                  id="start_date"
                  type="date"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.start_date && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.start_date ? 'true' : 'false'}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.start_date.message}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('end_date')}
                  id="end_date"
                  type="date"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.end_date && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.end_date ? 'true' : 'false'}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.end_date.message}</p>
                )}
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
                  <option value="PLANNED">Planned</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
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
                  isLoading ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:bg-primary-hover'
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

export const AcademicTermsPage: React.FC = () => {
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
    sort: 'academic_year',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AcademicTerm | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch terms with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-terms', filters],
    queryFn: () => termsApi.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TermFormValues) => termsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      setModalOpen(false);
      setEditingTerm(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TermFormValues> }) => termsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
      setModalOpen(false);
      setEditingTerm(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => termsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
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
    setEditingTerm(null);
    setModalOpen(true);
  };

  const openEditModal = (term: AcademicTerm) => {
    setEditingTerm(term);
    setModalOpen(true);
  };

  const openDeleteConfirm = (term: AcademicTerm) => {
    setDeleteConfirm(term);
  };

  const handleSubmit = async (data: TermFormValues) => {
    setGlobalError(null);
    if (editingTerm) {
      await updateMutation.mutateAsync({ id: editingTerm.id, data });
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
      sort: 'academic_year',
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
          <h1 className="text-2xl font-bold text-gray-900">Academic Terms</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Term
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
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
          <h1 className="text-2xl font-bold text-gray-900">Academic Terms</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Term
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load academic terms</h3>
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

  const terms = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Terms</h1>
          <p className="text-gray-500 mt-1">Manage academic terms and semesters</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Term
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
              placeholder="Search by academic year..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search academic terms"
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
              <option value="PLANNED">Planned</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {terms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-12 h-12 text-gray-300" />
                      <p>No academic terms found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Create your first term
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                terms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{term.academic_year}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {term.semester}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{term.start_date}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{term.end_date}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={term.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ActionButtons
                        term={term}
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
      <TermModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTerm(null);
        }}
        onSubmit={handleSubmit}
        term={editingTerm}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Academic Term"
        message={`Are you sure you want to delete the academic term "${deleteConfirm?.academic_year} - {deleteConfirm?.semester}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};