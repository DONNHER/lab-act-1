// Academic Records Page - View student academic records (Modern Dashboard Style)
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { studentsApi } from '../api';
import { useAuth } from '../contexts';
import type { Student } from '../types/api';
import {
  Search,
  Loader2,
  AlertCircle,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  X,
} from 'lucide-react';
import { cn, getStatusColor } from '../utils';
import { AppError } from '../utils/errors';
import { Button } from '../components/ui/Button';

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(status))}>
    {status}
  </span>
);

// Grade Badge Component
const GradeBadge: React.FC<{ grade: number | string | null }> = ({ grade }) => {
  const numericGrade = grade !== null && grade !== undefined ? Number(grade) : null;
  const isValidGrade = numericGrade !== null && !isNaN(numericGrade);
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      isValidGrade && numericGrade >= 75 ? 'bg-emerald-100 text-emerald-800' :
      isValidGrade && numericGrade >= 60 ? 'bg-amber-100 text-amber-800' :
      isValidGrade ? 'bg-rose-100 text-rose-800' :
      'bg-slate-100 text-slate-600'
    )}>
      {isValidGrade ? numericGrade.toFixed(2) : '—'}
    </span>
  );
};

// Student Selector Component
interface StudentSelectorProps {
  students: { id: number; name: string; student_number: string }[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isLoading: boolean;
  studentsApi: typeof studentsApi;
}

const StudentSelector: React.FC<StudentSelectorProps> = ({ students, selectedId, onSelect, isLoading, studentsApi }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected student for display
  const selectedStudent = students.find(s => s.id === selectedId);

  // Fetch student details if selectedId is provided but not in students list
  const { data: fetchedStudent } = useQuery({
    queryKey: ['student', selectedId],
    queryFn: () => studentsApi.get(selectedId!),
    enabled: !!selectedId && !selectedStudent,
    select: (data) => ({
      id: data.data.id,
      name: `${data.data.first_name} ${data.data.last_name}`,
      student_number: data.data.student_number,
      user_id: data.data.user_id,
    }),
  });

  // Use fetched student if selected student not in list
  const displayStudent = selectedStudent || fetchedStudent;

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.student_number.toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredStudents.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredStudents[highlightedIndex]) {
          onSelect(filteredStudents[highlightedIndex].id);
          setSearchQuery('');
          setShowDropdown(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleFocus = () => {
    if (students.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Select a student
  const handleStudentClick = (studentId: number) => {
    onSelect(studentId);
    setSearchQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  // Display value in input
  const displayValue = displayStudent 
    ? `${displayStudent.student_number} - ${displayStudent.name}`
    : '';

  return (
    <div className="relative w-full sm:w-96 md:w-[380px] lg:w-[420px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onClick={() => setShowDropdown(true)}
          disabled={isLoading}
          placeholder="Search by student ID or name..."
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white transition-all duration-150"
          aria-label="Search student"
          aria-autocomplete="list"
          aria-controls="student-dropdown"
          aria-expanded={showDropdown}
          readOnly={!!selectedStudent}
        />
        {selectedStudent && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showDropdown && !selectedStudent && (
        <div
          ref={dropdownRef}
          id="student-dropdown"
          className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {filteredStudents.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              No students found
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <button
                key={student.id}
                type="button"
                onClick={() => handleStudentClick(student.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-2.5 text-left text-sm ${
                  index === highlightedIndex
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-900 hover:bg-slate-50'
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <div className="font-medium">{student.student_number}</div>
                <div className="text-slate-500">{student.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const AcademicRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [displayedStudentId, setDisplayedStudentId] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize selectedStudentId from URL query parameter
  useEffect(() => {
    const studentIdParam = searchParams.get('student_id');
    if (studentIdParam) {
      const studentId = parseInt(studentIdParam, 10);
      if (!isNaN(studentId)) {
        setSelectedStudentId(studentId);
        setDisplayedStudentId(studentId);
      }
    }
  }, [searchParams]);

  // Update URL when selectedStudentId changes
  const handleStudentSelect = (id: number | null) => {
    setSelectedStudentId(id);
    setGlobalError(null);
    
    if (id) {
      setSearchParams({ student_id: id.toString() });
      setDisplayedStudentId(id); // Update displayed student when a new one is selected
    } else {
      setSearchParams({});
      // Don't clear displayedStudentId - keep showing the last loaded record
    }
  };

  const clearSelection = () => {
    setSelectedStudentId(null);
    setGlobalError(null);
    setSearchParams({});
    // Don't clear displayedStudentId - keep showing the last loaded record
  };

  // Fetch students for selector (only for non-student roles)
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['students', 'list'],
    queryFn: () => studentsApi.list({ per_page: 100, status: 'ACTIVE' }),
    select: (data) => data.data.map((s: Student) => ({ 
      id: s.id, 
      name: `${s.first_name} ${s.last_name}`, 
      student_number: s.student_number,
      user_id: s.user_id
    })),
    enabled: !isStudent, // Only fetch students list for non-student roles
  });

  const students = studentsData || [];

  // For students, use the new /students/me endpoint to get their own record
  const { data: meData, isLoading: meLoading, error: meError } = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => studentsApi.me(),
    enabled: isStudent, // Only fetch for students
  });

  // For students, automatically use their student record from /me endpoint
  // For other roles, use the displayed student ID (persists after clearing selection)
  const targetStudentId = isStudent 
    ? meData?.data?.id || null
    : displayedStudentId;

  // Fetch academic record for the target student
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-record', targetStudentId],
    queryFn: () => studentsApi.academicRecord(targetStudentId!),
    enabled: !!targetStudentId,
  });

  // Loading state for student selector (non-student roles)
  if (studentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <StudentSelector students={[]} selectedId={null} onSelect={() => {}} isLoading={true} studentsApi={studentsApi} />
        </div>
      </div>
    );
  }

  // Loading state for student's own record (me endpoint)
  if (isStudent && meLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your academic record...</p>
        </div>
      </div>
    );
  }

  // Loading state for academic record (must come before error states)
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        {!isStudent && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 max-w-3xl mx-auto">
            <StudentSelector 
              students={students} 
              selectedId={selectedStudentId} 
              onSelect={handleStudentSelect} 
              isLoading={false}
              studentsApi={studentsApi}
            />
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading academic record...</p>
        </div>
      </div>
    );
  }

  // Error state for student's own record (me endpoint)
  if (isStudent && meError && !meData) {
    const appError = AppError.fromApiError(meError);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load your academic record</h3>
          <p className="text-slate-500 mb-4">{appError.message}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Error state for academic record (non-student roles)
  if (error && !data && !isStudent) {
    const appError = AppError.fromApiError(error);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 max-w-3xl mx-auto">
          <StudentSelector students={students} selectedId={selectedStudentId} onSelect={handleStudentSelect} isLoading={false} studentsApi={studentsApi} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load academic record</h3>
          <p className="text-slate-500 mb-4">{appError.message}</p>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Error state for students list (non-student roles)
  if (studentsError && !studentsData && !isStudent) {
    const appError = AppError.fromApiError(studentsError);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load students list</h3>
          <p className="text-slate-500 mb-4">{appError.message}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const record = data?.data;
  const student = record?.student;

  // For students, if we don't have a student record linked to their user account
  if (isStudent && !targetStudentId && !meLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
          <p className="text-slate-500 mt-1">View student academic records</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Student Record Found</h3>
          <p className="text-slate-500 mb-4">Your user account is not linked to a student record. Please contact the registrar.</p>
        </div>
      </div>
    );
  }

  // Fallback for when targetStudentId is set but no student data is available (e.g., API error, 403, etc.)
  if (targetStudentId && !student && !isLoading && !error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">View student academic records</p>
          </div>
          {!isStudent && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <StudentSelector 
                students={students} 
                selectedId={selectedStudentId} 
                onSelect={handleStudentSelect} 
                isLoading={false}
                studentsApi={studentsApi}
              />
              {selectedStudentId && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to Load Academic Record</h3>
          <p className="text-slate-500 mb-4">
            Could not load the academic record for the selected student. This may be due to insufficient permissions or the student record not existing.
          </p>
          {!isStudent && (
            <Button variant="primary" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Academic Records</h1>
          <p className="text-sm text-slate-500 mt-1">View student academic records</p>
        </div>
        {!isStudent && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <StudentSelector 
              students={students} 
              selectedId={selectedStudentId} 
              onSelect={handleStudentSelect} 
              isLoading={false}
              studentsApi={studentsApi}
            />
            {selectedStudentId && (
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear Selection
              </Button>
            )}
          </div>
        )}
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

      {/* Student Selector (when no student record displayed and not a student) */}
      {!isStudent && !targetStudentId && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Student</h3>
          <p className="text-slate-500 mb-6">Choose a student from the dropdown above to view their academic record.</p>
          <div className="max-w-md mx-auto">
            <StudentSelector 
              students={students} 
              selectedId={null} 
              onSelect={handleStudentSelect} 
              isLoading={false}
              studentsApi={studentsApi}
            />
          </div>
        </div>
      )}

      {/* Academic Record Display */}
      {targetStudentId && student && (
        <div className="space-y-6">
          {/* Student Info Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-2xl font-bold">
                    {student.first_name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{student.first_name} {student.last_name}</h2>
                  <p className="text-slate-500">{student.student_number}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(student.status))}>
                      {student.status}
                    </span>
                    <span>{student.program?.code} - {student.program?.name}</span>
                    <span>Year {student.year_level}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Current GPA</p>
                <p className="text-3xl font-bold text-primary-600">{record?.summary?.gpa?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Units</p>
                  <p className="text-2xl font-bold text-slate-900">{record?.summary?.total_units || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Completed Units</p>
                  <p className="text-2xl font-bold text-slate-900">{record?.summary?.completed_units || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Remaining Units</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(record?.summary?.total_units || 0) - (record?.summary?.completed_units || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Enrollment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Term</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Units</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Midterm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Final</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enrollment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record?.enrollments?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-slate-300" />
                          <p className="text-slate-500">No enrollment records found for this student.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    record?.enrollments?.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">{enrollment.course_offering?.academic_term?.academic_year}</p>
                          <p className="text-sm text-slate-500 capitalize">{enrollment.course_offering?.academic_term?.semester}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">{enrollment.course_offering?.course?.course_code}</p>
                          <p className="text-sm text-slate-500 truncate max-w-xs">{enrollment.course_offering?.course?.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            {enrollment.course_offering?.section}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">{enrollment.course_offering?.course?.units}</p>
                        </td>
                        <td className="px-4 py-4">
                          <GradeBadge grade={enrollment.grade?.midterm_grade ?? null} />
                        </td>
                        <td className="px-4 py-4">
                          <GradeBadge grade={enrollment.grade?.final_grade ?? null} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={enrollment.grade?.status || 'DRAFT'} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={enrollment.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for academic record */}
      {selectedStudentId && isLoading && !record && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading academic record...</p>
        </div>
      )}
    </div>
  );
};