// Student Academic Records Page - Read-only view of own academic record
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../api';
import { useAuth } from '../../contexts';
import {
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Award,
  BookOpen as BookOpenIcon,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { cn, getStatusColor } from '../../utils';
import { AppError } from '../../utils/errors';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {status}
  </span>
);

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

const SEMESTER_LABELS: Record<string | number, string> = {
  1: 'First Semester',
  2: 'Second Semester',
  3: 'Summer',
  '1st': 'First Semester',
  '2nd': 'Second Semester',
  'Summer': 'Summer',
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: 'Core', color: 'bg-blue-100 text-blue-800' },
  major: { label: 'Major', color: 'bg-purple-100 text-purple-800' },
  elective: { label: 'Elective', color: 'bg-green-100 text-green-800' },
  ge: { label: 'Gen Ed', color: 'bg-gray-100 text-gray-800' },
  pe: { label: 'PE', color: 'bg-pink-100 text-pink-800' },
  nstp: { label: 'NSTP', color: 'bg-orange-100 text-orange-800' },
};

const STATUS_COLORS: Record<string, string> = {
  enrolled: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  dropped: 'bg-red-100 text-red-800',
  failed: 'bg-rose-100 text-rose-800',
  pending: 'bg-amber-100 text-amber-800',
};

export const StudentAcademicRecordsPage: React.FC = () => {
  const { user: _user } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Fetch student's own academic record
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-record', 'student', 'me'],
    queryFn: async () => {
      // First get the current student, then fetch their academic record
      const studentResponse = await studentsApi.me();
      return studentsApi.academicRecord(studentResponse.data.id);
    },
    placeholderData: (previousData) => previousData,
  });

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Academic Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your academic record...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">My Academic Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load academic record</h3>
          <p className="text-gray-500 mb-4">{appError.message || 'Failed to load your academic record. Please try again.'}</p>
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

  const record = data?.data;

  if (!record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Academic Record</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No academic record found</h3>
          <p className="text-gray-500 mb-4">Your academic record is not available yet.</p>
        </div>
      </div>
    );
  }

  const student = record.student;
  const enrollments = record.enrollments || [];
  const summary = record.summary || { total_units: 0, completed_units: 0, gpa: null };

  // Group enrollments by year and semester
  const groupedEnrollments = enrollments.reduce((acc, enrollment) => {
    const term = enrollment.course_offering?.academic_term;
    if (!term) return acc;
    const year = parseInt(term.academic_year?.split('-')[0] || '1');
    const semester = term.semester;
    const key = `${year}-${semester}`;
    if (!acc[key]) {
      acc[key] = {
        year,
        semester,
        academic_year: term.academic_year,
        enrollments: [],
      };
    }
    acc[key].enrollments.push(enrollment);
    return acc;
  }, {} as Record<string, { year: number; semester: string | number; academic_year: string; enrollments: typeof enrollments }>);

  const sortedTerms = Object.entries(groupedEnrollments).sort((a, b) => {
    if (a[1].year !== b[1].year) return a[1].year - b[1].year;
    const semOrder: Record<string, number> = { '1': 1, '2': 2, '3': 3, '1st': 1, '2nd': 2, 'Summer': 3 };
    return (semOrder[String(a[1].semester)] || 0) - (semOrder[String(b[1].semester)] || 0);
  });

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev.size === 0 ? sortedTerms.map(([, t]) => t.year) : prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const semesterMatches = (sem: string | number, filterSem: number | 'all') => {
    if (filterSem === 'all') return true;
    const semStr = String(sem).toLowerCase();
    if (filterSem === 1) return semStr === '1' || semStr === '1st' || semStr.includes('first');
    if (filterSem === 2) return semStr === '2' || semStr === '2nd' || semStr.includes('second');
    if (filterSem === 3) return semStr === '3' || semStr === 'summer';
    return false;
  };

  const visibleTerms = sortedTerms.map(([termKey, termData]) => {
    const filteredEnrollments = termData.enrollments.filter(e => {
      if (filterYear !== 'all') {
        // Filter by academic term year (calendar year)
        if (termData.year !== filterYear) return false;
      }
      if (!semesterMatches(termData.semester, filterSemester)) return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const courseCode = e.course_offering?.course?.course_code?.toLowerCase() || '';
        const courseTitle = e.course_offering?.course?.title?.toLowerCase() || '';
        if (!courseCode.includes(search) && !courseTitle.includes(search)) return false;
      }
      return true;
    });

    return { termKey, termData, filteredEnrollments };
  }).filter(t => t.filteredEnrollments.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            My Academic Record
          </h1>
          <p className="text-gray-500 mt-1">View your complete academic record</p>
        </div>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Student Info Header */}
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
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <StatusBadge status={student.status} />
                <span>{student.program?.code} - {student.program?.name}</span>
                <span>Year {student.year_level}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-bold text-primary">{summary.gpa?.toFixed(2) || '0.00'}</div>
              <p className="text-sm text-gray-500">Current GPA</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-200">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_units || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Units</p>
                <p className="text-2xl font-bold text-emerald-600">{summary.completed_units || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining Units</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary.total_units || 0) - (summary.completed_units || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[100px]"
              >
                <option value="all">All Years</option>
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[100px]"
              >
                <option value="all">All Semesters</option>
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
                <option value={3}>Summer</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Record by Term */}
      <div className="space-y-4">
        {visibleTerms.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollment records found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          visibleTerms.map(({ termKey, termData, filteredEnrollments }) => {
            const totalUnits = filteredEnrollments.reduce((sum, e) => sum + (e.course_offering?.course?.units || 0), 0);
            const isExpanded = expandedYears.size === 0 || expandedYears.has(termData.year);

            return (
              <div key={termKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Year/Semester Header */}
                <button
                  onClick={() => toggleYear(termData.year)}
                  className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl font-bold">{termData.year}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Year {termData.year} - {SEMESTER_LABELS[termData.semester] || termData.semester}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {filteredEnrollments.length} courses • {totalUnits} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      filteredEnrollments.some(e => e.status === 'ENROLLED') ? 'bg-green-100 text-green-800' :
                      filteredEnrollments.every(e => e.status === 'COMPLETED') ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {filteredEnrollments.some(e => e.status === 'ENROLLED') ? 'In Progress' : filteredEnrollments.every(e => e.status === 'COMPLETED') ? 'Completed' : 'Pending'}
                    </span>
                    <span className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </button>

                {/* Courses List */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {filteredEnrollments.map((enrollment) => {
                      const finalGrade = enrollment.grade?.final_grade ?? null;
                      const courseStatus = finalGrade !== null && finalGrade >= 75
                        ? 'completed'
                        : finalGrade !== null && finalGrade < 75
                        ? 'failed'
                        : enrollment.status === 'ENROLLED'
                        ? 'enrolled'
                        : enrollment.status === 'DROPPED'
                        ? 'dropped'
                        : 'pending';

                      const rawCategory = enrollment.course_offering?.course?.course_code?.charAt(0)?.toLowerCase() || 'core';
                      // Use first letter of course code as a simple category fallback
                      const categoryKey = rawCategory === 'c' ? 'core' : rawCategory === 'm' ? 'major' : rawCategory === 'e' ? 'elective' : rawCategory === 'g' ? 'ge' : rawCategory === 'p' ? 'pe' : rawCategory === 'n' ? 'nstp' : 'core';
                      const category = CATEGORY_LABELS[categoryKey] || { label: 'Core', color: 'bg-blue-100 text-blue-800' };

                      return (
                        <div key={enrollment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Status Icon */}
                              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', STATUS_COLORS[courseStatus] || STATUS_COLORS.pending)}>
                                {courseStatus === 'completed' && <Award className="w-5 h-5 text-blue-600" />}
                                {courseStatus === 'enrolled' && <BookOpen className="w-5 h-5 text-green-600" />}
                                {courseStatus === 'dropped' && <AlertCircle className="w-5 h-5 text-red-600" />}
                                {courseStatus === 'failed' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                                {courseStatus === 'pending' && <BookOpen className="w-5 h-5 text-amber-600" />}
                              </div>

                              {/* Course Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-semibold text-gray-900">
                                    {enrollment.course_offering?.course?.course_code}
                                  </span>
                                  <span className="text-gray-700 font-medium">
                                    {enrollment.course_offering?.course?.title}
                                  </span>
                                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', category.color)}>
                                    {category.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {enrollment.course_offering?.course?.units} units
                                  </span>
                                </div>
                              </div>

                              {/* Grade & Status Badges */}
                              <div className="flex items-center gap-3 sm:ml-4">
                                {finalGrade !== null && (
                                  <GradeBadge grade={finalGrade} />
                                )}
                                <span className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize', STATUS_COLORS[courseStatus] || STATUS_COLORS.pending)}>
                                  {courseStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAcademicRecordsPage;