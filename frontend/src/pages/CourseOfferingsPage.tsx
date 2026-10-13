// Course Offerings Page with Search, Filter, Sort, Pagination
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { offeringsApi, coursesApi, termsApi, usersApi } from '../api';
import type { CourseOffering, Course, AcademicTerm, User as UserType } from '../types/api';
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

// Schemas
const offeringSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  academic_term_id: z.number().min(1, 'Academic term is required'),
  instructor_id: z.number().min(1, 'Instructor is required'),
  section: z.string().min(1, 'Section is required'),
  schedule: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']),
});

type OfferingFormValues = z.infer<typeof offeringSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const ActionButtons: React.FC<{
  offering: CourseOffering;
  onEdit: (offering: CourseOffering) => void;
  onDelete: (offering: CourseOffering) => void;
  deletingId: number | null;
}> = ({ offering, onEdit, onDelete, deletingId }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Edit course offering">
      <button
        onClick={() => onEdit(offering)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
        aria-label="Edit course offering"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Delete course offering">
      <button
        onClick={() => onDelete(offering)}
        disabled={deletingId === offering.id}
        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors disabled:opacity-50"
        aria-label="Delete course offering"
      >
        {deletingId === offering.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </Tooltip>
  </div>
);

// Offering Modal
interface OfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferingFormValues) => Promise<void>;
  offering?: CourseOffering | null;
  isLoading: boolean;
  courses: { id: number; name: string; code: string }[];
  terms: { id: number; name: string; code: string }[];
  instructors: { id: number; name: string; email: string }[];
}

const OfferingModal: React.FC<OfferingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offering,
  isLoading,
  courses,
  terms,
  instructors,
}) => {
  const isEditing = !!offering;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferingFormValues>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      course_id: 0,
      academic_term_id: 0,
      instructor_id: 0,
      section: '',
      schedule: '',
      room: '',
      capacity: 30,
      status: 'OPEN' as const,
    },
  });

  useEffect(() => {
    if (isOpen && offering) {
      reset({
        course_id: offering.course_id,
        academic_term_id: offering.academic_term_id,
        instructor_id: offering.instructor_id,
        section: offering.section,
        schedule: offering.schedule || '',
        room: offering.room || '',
        capacity: offering.capacity,
        status: offering.status,
      });
    } else if (isOpen && !offering) {
      reset({
        course_id: 0,
        academic_term_id: 0,
        instructor_id: 0,
        section: '',
        schedule: '',
        room: '',
        capacity: 30,
        status: 'OPEN',
      });
    }
  }, [isOpen, offering, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Course Offering' : 'Create Course Offering'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course */}
              <div>
                <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('course_id', { valueAsNumber: true })}
                  id="course_id"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.course_id && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.course_id ? 'true' : 'false'}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.course_id.message}</p>
                )}
              </div>

              {/* Academic Term */}
              <div>
                <label htmlFor="academic_term_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Term <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('academic_term_id', { valueAsNumber: true })}
                  id="academic_term_id"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.academic_term_id && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.academic_term_id ? 'true' : 'false'}
                >
                  <option value="">Select Academic Term</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.name}
                    </option>
                  ))}
                </select>
                {errors.academic_term_id && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.academic_term_id.message}</p>
                )}
              </div>

              {/* Instructor */}
              <div>
                <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('instructor_id', { valueAsNumber: true })}
                  id="instructor_id"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.instructor_id && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.instructor_id ? 'true' : 'false'}
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.email})
                    </option>
                  ))}
                </select>
                {errors.instructor_id && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.instructor_id.message}</p>
                )}
              </div>

              {/* Section */}
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('section')}
                  id="section"
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.section && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.section ? 'true' : 'false'}
                />
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.section.message}</p>
                )}
              </div>

              {/* Schedule */}
              <div className="md:col-span-2">
                <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <textarea
                  {...register('schedule')}
                  id="schedule"
                  rows={2}
                  placeholder="e.g., MWF 9:00-10:00 AM, TTH 1:00-2:30 PM"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isLoading}
                />
              </div>

              {/* Room */}
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <input
                  {...register('room')}
                  id="room"
                  type="text"
                  placeholder="e.g., Room 101, Building A"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isLoading}
                />
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('capacity', { valueAsNumber: true })}
                  id="capacity"
                  type="number"
                  min="1"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                    errors.capacity && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  disabled={isLoading}
                  aria-invalid={errors.capacity ? 'true' : 'false'}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{errors.capacity.message}</p>
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
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
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

export const CourseOfferingsPage: React.FC = () => {
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
    sort: 'created_at',
    page: 1,
    per_page: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CourseOffering | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'list'],
    queryFn: () => coursesApi.list({ per_page: 100 }),
    select: (data) => data.data.map((c: Course) => ({ id: c.id, name: c.title, code: c.course_code })),
  });

  // Fetch academic terms for dropdown
  const { data: termsData } = useQuery({
    queryKey: ['terms', 'list'],
    queryFn: () => termsApi.list({ per_page: 100 }),
    select: (data) => data.data.map((t: AcademicTerm) => ({ id: t.id, name: `${t.academic_year} ${t.semester}`, code: t.academic_year })),
  });

  // Fetch instructors for dropdown (users with INSTRUCTOR role)
  const { data: instructorsData } = useQuery({
    queryKey: ['users', 'instructors'],
    queryFn: () => usersApi.list({ role: 'INSTRUCTOR', per_page: 100 }),
    select: (data) => data.data.map((u: UserType) => ({ id: u.id, name: u.name, email: u.email })),
  });

  const courses = coursesData || [];
  const terms = termsData || [];
  const instructors = instructorsData || [];

  // Fetch course offerings with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['course-offerings', filters],
    queryFn: () => offeringsApi.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: OfferingFormValues) => offeringsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-offerings'] });
      setModalOpen(false);
      setEditingOffering(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OfferingFormValues> }) => offeringsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-offerings'] });
      setModalOpen(false);
      setEditingOffering(null);
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => offeringsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-offerings'] });
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
    setEditingOffering(null);
    setModalOpen(true);
  };

  const openEditModal = (offering: CourseOffering) => {
    setEditingOffering(offering);
    setModalOpen(true);
  };

  const openDeleteConfirm = (offering: CourseOffering) => {
    setDeleteConfirm(offering);
  };

  const handleSubmit = async (data: OfferingFormValues) => {
    setGlobalError(null);
    const submitData = {
      ...data,
      schedule: data.schedule || null,
      room: data.room || null,
    };

    if (editingOffering) {
      await updateMutation.mutateAsync({ id: editingOffering.id, data: submitData });
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
          <h1 className="text-2xl font-bold text-gray-900">Course Offerings</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Offering
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
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
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
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
          <h1 className="text-2xl font-bold text-gray-900">Course Offerings</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Offering
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load course offerings</h3>
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

  const offerings = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Offerings</h1>
          <p className="text-gray-500 mt-1">Manage course offerings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Offering
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
              placeholder="Search by course, section, instructor..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search course offerings"
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
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offerings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                      <p>No course offerings found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Create your first offering
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                offerings.map((offering) => (
                  <tr key={offering.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{offering.course?.course_code}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{offering.course?.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{offering.academic_term?.academic_year}</p>
                        <p className="text-sm text-gray-500">{offering.academic_term?.semester}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {offering.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{offering.instructor?.name}</p>
                          <p className="text-sm text-gray-500">{offering.instructor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {offering.section}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={offering.schedule || ''}>
                        {offering.schedule || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{offering.room || '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{offering.capacity}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={offering.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ActionButtons
                        offering={offering}
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
      <OfferingModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingOffering(null);
        }}
        onSubmit={handleSubmit}
        offering={editingOffering}
        isLoading={createMutation.isPending || updateMutation.isPending}
        courses={courses}
        terms={terms}
        instructors={instructors}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Course Offering"
        message={`Are you sure you want to delete the course offering "${deleteConfirm?.course?.course_code} - ${deleteConfirm?.section}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};