// Student Programs Page - Read-only view of programs
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { programsApi } from '../../api';
import { useAuth } from '../../contexts';
import type { Program } from '../../types/api';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import { getStatusColor } from '../../utils';
import { AppError } from '../../utils/errors';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {status}
  </span>
);

export const StudentProgramsPage: React.FC = () => {
  const { user: _user } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());

  // Fetch programs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['programs', 'student', 'list'],
    queryFn: () => programsApi.list({ per_page: 100 }),
    placeholderData: (previousData) => previousData,
  });

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading programs...</p>
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
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load programs</h3>
          <p className="text-gray-500 mb-4">{appError.message || 'Failed to load programs. Please try again.'}</p>
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

  const programs: Program[] = data?.data || [];

  // Filter programs
  const filteredPrograms = programs.filter((program) => {
    if (filterStatus !== 'all' && program.status !== filterStatus) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const code = program.code?.toLowerCase() || '';
      const name = program.name?.toLowerCase() || '';
      const description = program.description?.toLowerCase() || '';
      if (!code.includes(search) && !name.includes(search) && !description.includes(search)) {
        return false;
      }
    }
    return true;
  });

  const toggleProgram = (id: number) => {
    setExpandedPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 mt-1">View available academic programs</p>
        </div>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-red-500 hover:text-red-700" aria-label="Close error">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              aria-label="Search programs"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px] text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-500 mb-4">No programs match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPrograms.map((program) => (
                    <React.Fragment key={program.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <code className="text-sm font-mono text-gray-900">{program.code}</code>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{program.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-500 truncate max-w-xs">{program.description || '—'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={program.status} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => toggleProgram(program.id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            aria-label="View details"
                          >
                            {expandedPrograms.has(program.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedPrograms.has(program.id) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg border border-gray-200">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600">{program.description || 'No description provided'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                                <dl className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Code</dt>
                                    <dd className="font-mono font-medium text-gray-900">{program.code}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd><StatusBadge status={program.status} /></dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Created</dt>
                                    <dd className="text-gray-900">
                                      {program.created_at ? new Date(program.created_at).toLocaleDateString() : '—'}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Updated</dt>
                                    <dd className="text-gray-900">
                                      {program.updated_at ? new Date(program.updated_at).toLocaleDateString() : '—'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgramsPage;