// Programs Page with Search, Filter, Sort, Pagination
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { programsApi } from '../api';
import type { Program } from '../types/api';
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
  GraduationCap,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor } from '../utils';
import { AppError } from '../utils/errors';

// Schemas
const programSchema = z.object({
  code: z.string().min(1, 'Program code is required').max(20, 'Code must be 20 characters or less'),
  name: z.string().min(1, 'Program name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type ProgramFormValues = z.infer<typeof programSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const ActionButtons: React.FC<{
  program: Program;
  onEdit: (program: Program) => void;
  onDelete: (program: Program) => void;
  deletingId: number | null;
}> = ({ program, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Edit program">
      <button
        onClick={() => onEdit(program)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
        aria-label="Edit program"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Delete program">
      <button
        onClick={() => onDelete(program)}
        disabled={deletingId === program.id}
        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors disabled:opacity-50"
        aria-label="Delete program"
      >
        {deletingId === program.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Program Modal
interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProgramFormValues) => Promise<void>;
  program?: Program | null;
  isLoading: boolean;
}

const ProgramModal: React.FC<ProgramModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  program,
  isLoading,
}) => {
  const isEditing = !!program;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      status: 'ACTIVE' as const,
    },
  });

  React.useEffect(() => {
    if (isOpen && program) {
      reset({
        code: program.code,
        name: program.name,
        description: program.description || '',
        status: program.status,
      });
    } else if (isOpen && !program) {
      reset({
        code: '',
        name: '',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [isOpen, program, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Program' : 'Create Program'}
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
              {/* Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Program Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('code')}
                  id="code"
                  type="text"
                  maxLength={20}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.code && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isEditing || isLoading}
                  aria-invalid={errors.code ? 'true' : 'false'}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.code.message}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  maxLength={100}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
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
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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

export const ProgramsPage: React.FC = () => {
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
    sort: 'name',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch programs with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['programs', filters],
    queryFn: () => programsApi.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ProgramFormValues) => programsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setModalOpen(false);
      setEditingProgram(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProgramFormValues> }) => programsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setModalOpen(false);
      setEditingProgram(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => programsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
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
    setEditingProgram(null);
    setModalOpen(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setModalOpen(true);
  };

  const openDeleteConfirm = (program: Program) => {
    setDeleteConfirm(program);
  };

  const handleSubmit = async (data: ProgramFormValues) => {
    setGlobalError(null);
    if (editingProgram) {
      await updateMutation.mutateAsync({ id: editingProgram.id, data });
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
      sort: 'name',
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
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
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
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load programs</h3>
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

  const programs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 mt-1">Manage academic programs</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Program
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
              placeholder="Search by code or name..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search programs"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className="w-12 h-12 text-gray-300" />
                      <p>No programs found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Create your first program
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {program.code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{program.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={program.description || ''}>
                        {program.description || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={program.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ActionButtons
                        program={program}
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
      <ProgramModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProgram(null);
        }}
        onSubmit={handleSubmit}
        program={editingProgram}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete the program "${deleteConfirm?.code} - ${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};