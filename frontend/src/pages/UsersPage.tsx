// Users Page with Search, Filter, Sort, Pagination (Modern Dashboard Style)
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { usersApi, authApi, setAuthToken } from '../api';
import type { User } from '../types/api';
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
  UserPlus,
} from 'lucide-react';
import { Tooltip } from '../components';
import { cn, getStatusColor, getInitials } from '../utils';
import { AppError } from '../utils/errors';
import { Button } from '../components/ui/Button';

// Schemas
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type UserFormValues = z.infer<typeof userSchema>;

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    REGISTRAR: 'bg-blue-100 text-blue-700',
    INSTRUCTOR: 'bg-emerald-100 text-emerald-700',
    STUDENT: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleColors[role] || 'bg-gray-100 text-gray-700')}>
      {role}
    </span>
  );
};

interface ActionButtonsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  onImpersonate: (user: User) => void;
  deletingId: number | null;
  impersonatingId: number | null;
  isAdmin: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  user, 
  onEdit, 
  onDelete, 
  onView, 
  onImpersonate,
  deletingId, 
  impersonatingId,
  isAdmin 
}) => (
  <div className="flex items-center gap-1">
    <Tooltip content="View user">
      <button
        onClick={() => onView(user)}
        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        aria-label="View user"
      >
        <Eye className="w-4 h-4" />
      </button>
    </Tooltip>
    <Tooltip content="Edit user">
      <button
        onClick={() => onEdit(user)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Edit user"
      >
        <Edit className="w-4 h-4" />
      </button>
    </Tooltip>
    {isAdmin && user.id !== 1 && ( // Prevent deleting the first admin user
      <Tooltip content="Delete user">
        <button
          onClick={() => onDelete(user)}
          disabled={deletingId === user.id}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </Tooltip>
    )}
    {isAdmin && user.id !== 1 && ( // Prevent impersonating the first admin user and yourself
      <Tooltip content="Impersonate user">
        <button
          onClick={() => onImpersonate(user)}
          disabled={impersonatingId === user.id}
          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Impersonate user"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </Tooltip>
    )}
  </div>
);

// User Avatar Component
const UserAvatar: React.FC<{ user: User; size?: number }> = ({ user, size = 36 }) => {
  const initials = getInitials(user.name);
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
  ];
  const colorIndex = user.id % colors.length;
  
  return (
    <div className={cn('flex items-center justify-center rounded-full font-medium text-white', colors[colorIndex], `w-${size} h-${size}`)}>
      {initials}
    </div>
  );
};

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = currentUser?.role === 'ADMIN';

  // State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', { search, roleFilter, statusFilter, sortBy, sortOrder, page, perPage }],
    queryFn: () => usersApi.list({ search, role: roleFilter || undefined, status: statusFilter || undefined, sort: sortBy, page, per_page: perPage }),
    placeholderData: (previousData) => previousData,
  });

  // Handle pagination from API response
  const users = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.last_page || 1;
  const totalUsers = meta?.total || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setEditingUser(null);
      setModalError(null);
    },
    onError: (error: AppError) => {
      setModalError(error.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormValues> }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setEditingUser(null);
      setModalError(null);
    },
    onError: (error: AppError) => {
      setModalError(error.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingId(null);
    },
    onError: (error: AppError) => {
      alert(error.message || 'Failed to delete user');
    },
  });

  // Impersonation mutation
  const [impersonatingId, setImpersonatingId] = useState<number | null>(null);

  const impersonateMutation = useMutation({
    mutationFn: (userId: number) => authApi.impersonate(userId),
    onSuccess: (response) => {
      // Store the new token and redirect
      // Response is ApiResponse<LoginResponse> = { data: LoginResponse, links?, meta? }
      const loginResponse = response.data;
      if (loginResponse?.token) {
        setAuthToken(loginResponse.token);
        // Reload the page to apply the new authentication state
        window.location.reload();
      }
    },
    onError: (error: AppError) => {
      alert(error.message || 'Failed to impersonate user');
      setImpersonatingId(null);
    },
    onSettled: () => {
      setImpersonatingId(null);
    },
  });

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      status: 'ACTIVE',
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role,
      status: user.status,
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      setDeletingId(user.id);
      deleteMutation.mutate(user.id);
    }
  };

  const handleImpersonate = (user: User) => {
    if (window.confirm(`Are you sure you want to impersonate "${user.name}"? You will be logged in as this user.`)) {
      setImpersonatingId(user.id);
      impersonateMutation.mutate(user.id);
    }
  };

  const onSubmit = (data: UserFormValues) => {
    setModalError(null);
    const submitData = { ...data };
    // Remove empty password for updates
    if (editingUser && !submitData.password) {
      delete submitData.password;
    }
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon: React.FC<{ field: string }> = ({ field }) => {
    if (sortBy !== field) return <span className="text-slate-300">⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Failed to load users</h3>
        <p className="text-gray-500 mt-1">{(error as AppError).message || 'Please try again later'}</p>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and their roles</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="REGISTRAR">Registrar</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Student</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Email <SortIcon field="email" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Role <SortIcon field="role" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Created <SortIcon field="created_at" />
                  </button>
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No users found</p>
                    {isAdmin && (
                      <Button onClick={handleOpenCreateModal} className="mt-4" variant="outline">
                        Add your first user
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size={36} />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          user={user}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onView={handleView}
                          onImpersonate={handleImpersonate}
                          deletingId={deletingId}
                          impersonatingId={impersonatingId}
                          isAdmin={isAdmin}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : ''}
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder={editingUser ? '••••••••' : 'Min 8 characters'}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  {...register('role')}
                  id="role"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.role && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="REGISTRAR">Registrar</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="STUDENT">Student</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  id="status"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                    errors.status && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewingUser(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button onClick={() => setViewingUser(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center">
                <UserAvatar user={viewingUser} size={64} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{viewingUser.name}</h3>
                <p className="text-gray-500 mt-1">{viewingUser.email}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <RoleBadge role={viewingUser.role} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={viewingUser.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-medium text-gray-900">{viewingUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">
                    {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => { setViewingUser(null); handleEdit(viewingUser); }}>
                  Edit
                </Button>
                <Button onClick={() => setViewingUser(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;