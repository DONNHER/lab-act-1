// Student Students Page - Read-only view of own student record
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../api';
import {
  User,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { getStatusColor } from '../../utils';
import { AppError } from '../../utils/errors';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {status}
  </span>
);

export const StudentStudentsPage: React.FC = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch student's own record
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', 'student', 'me'],
    queryFn: () => studentsApi.me(),
    placeholderData: (previousData) => previousData,
  });

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Student Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your student record...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    AppError.fromApiError(error);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Student Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load student record</h3>
          <p className="text-gray-500 mb-4">Failed to load your student record. Please try again.</p>
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

  const student = data?.data;

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Student Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No student record found</h3>
          <p className="text-gray-500 mb-4">Your user account is not linked to a student record. Please contact the registrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Student Record</h1>
          <p className="text-gray-500 mt-1">View your student information</p>
        </div>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Student Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">
                {student.first_name?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
              <p className="text-gray-500">{student.student_number}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={student.status} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Student Number</dt>
                    <dd className="font-medium text-gray-900">{student.student_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Full Name</dt>
                    <dd className="font-medium text-gray-900">{student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {student.email || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {student.phone || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Birth Date</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {student.birth_date || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {student.address || '—'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Academic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Academic Information
              </h3>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Program</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      {student.program?.code} - {student.program?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Year Level</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Year {student.year_level}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="font-medium text-gray-900">
                      <StatusBadge status={student.status} />
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* System Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.92-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.92 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.92 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.92 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                System Information
              </h3>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Created At</dt>
                    <dd className="font-medium text-gray-900">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Updated At</dt>
                    <dd className="font-medium text-gray-900">{student.updated_at ? new Date(student.updated_at).toLocaleDateString() : '—'}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStudentsPage;