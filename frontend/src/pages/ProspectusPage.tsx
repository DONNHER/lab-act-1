// Prospectus Page - Student Curriculum View with Enrollments
import { useState, useEffect } from 'react';
import { studentsApi, enrollmentsApi } from '../api';
import type { Enrollment, Student } from '../types/api';
import {
  BookOpen,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  LayoutDashboard,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '../utils/errors';

interface CurriculumCourse {
  id: string;
  courseCode: string;
  title: string;
  units: number;
  yearLevel: number;
  semester: number; // 1 = First Semester, 2 = Second Semester, 3 = Summer
  prerequisites?: string[];
  category: 'core' | 'major' | 'elective' | 'ge' | 'pe' | 'nstp';
}

interface YearSemesterGroup {
  year: number;
  semester: number;
  label: string;
  courses: CurriculumCourse[];
}

const BSIT_CURRICULUM: CurriculumCourse[] = [
  // Year 1, First Semester
  { id: '1', courseCode: 'CS101', title: 'Introduction to Computer Science', units: 3, yearLevel: 1, semester: 1, category: 'core' },
  { id: '2', courseCode: 'MATH101', title: 'College Algebra', units: 3, yearLevel: 1, semester: 1, category: 'ge' },
  { id: '3', courseCode: 'ENG101', title: 'English Composition', units: 3, yearLevel: 1, semester: 1, category: 'ge' },
  { id: '4', courseCode: 'FIL101', title: 'Komunikasyon sa Akademikong Filipino', units: 3, yearLevel: 1, semester: 1, category: 'ge' },
  { id: '5', courseCode: 'PE101', title: 'Physical Fitness', units: 2, yearLevel: 1, semester: 1, category: 'pe' },
  { id: '6', courseCode: 'NSTP101', title: 'National Service Training Program 1', units: 3, yearLevel: 1, semester: 1, category: 'nstp' },
  { id: '7', courseCode: 'ITE101', title: 'Introduction to Information Technology', units: 3, yearLevel: 1, semester: 1, category: 'major' },

  // Year 1, Second Semester
  { id: '8', courseCode: 'CS102', title: 'Programming Fundamentals', units: 3, yearLevel: 1, semester: 2, prerequisites: ['CS101'], category: 'core' },
  { id: '9', courseCode: 'MATH102', title: 'Plane Trigonometry', units: 3, yearLevel: 1, semester: 2, category: 'ge' },
  { id: '10', courseCode: 'ENG102', title: 'Speech Communication', units: 3, yearLevel: 1, semester: 2, category: 'ge' },
  { id: '11', courseCode: 'FIL102', title: "Pagbasa at Pagsulat sa Iba't Ibang Disiplina", units: 3, yearLevel: 1, semester: 2, category: 'ge' },
  { id: '12', courseCode: 'PE102', title: 'Rhythmic Activities', units: 2, yearLevel: 1, semester: 2, category: 'pe' },
  { id: '13', courseCode: 'NSTP102', title: 'National Service Training Program 2', units: 3, yearLevel: 1, semester: 2, category: 'nstp' },
  { id: '14', courseCode: 'ITE102', title: 'Computer Programming 1', units: 3, yearLevel: 1, semester: 2, prerequisites: ['CS101'], category: 'major' },

  // Year 2, First Semester
  { id: '15', courseCode: 'CS201', title: 'Data Structures and Algorithms', units: 3, yearLevel: 2, semester: 1, prerequisites: ['CS102'], category: 'core' },
  { id: '16', courseCode: 'MATH201', title: 'Calculus I', units: 4, yearLevel: 2, semester: 1, category: 'ge' },
  { id: '17', courseCode: 'PHYS201', title: 'Physics for IT', units: 3, yearLevel: 2, semester: 1, category: 'ge' },
  { id: '18', courseCode: 'ITE201', title: 'Object-Oriented Programming', units: 3, yearLevel: 2, semester: 1, prerequisites: ['ITE102'], category: 'major' },
  { id: '19', courseCode: 'ITE202', title: 'Discrete Mathematics', units: 3, yearLevel: 2, semester: 1, category: 'major' },
  { id: '20', courseCode: 'PE201', title: 'Individual/Dual Sports', units: 2, yearLevel: 2, semester: 1, category: 'pe' },

  // Year 2, Second Semester
  { id: '21', courseCode: 'CS202', title: 'Database Systems', units: 3, yearLevel: 2, semester: 2, prerequisites: ['CS201'], category: 'core' },
  { id: '22', courseCode: 'MATH202', title: 'Calculus II', units: 4, yearLevel: 2, semester: 2, category: 'ge' },
  { id: '23', courseCode: 'ITE203', title: 'Data Communications and Networking 1', units: 3, yearLevel: 2, semester: 2, category: 'major' },
  { id: '24', courseCode: 'ITE204', title: 'Web Systems and Technologies', units: 3, yearLevel: 2, semester: 2, prerequisites: ['ITE201'], category: 'major' },
  { id: '25', courseCode: 'ITE205', title: 'Information Management', units: 3, yearLevel: 2, semester: 2, category: 'major' },
  { id: '26', courseCode: 'PE202', title: 'Team Sports', units: 2, yearLevel: 2, semester: 2, category: 'pe' },

  // Year 3, First Semester
  { id: '27', courseCode: 'CS301', title: 'Operating Systems', units: 3, yearLevel: 3, semester: 1, prerequisites: ['CS201'], category: 'core' },
  { id: '28', courseCode: 'CS302', title: 'Software Engineering', units: 3, yearLevel: 3, semester: 1, prerequisites: ['CS202'], category: 'core' },
  { id: '29', courseCode: 'ITE301', title: 'Data Communications and Networking 2', units: 3, yearLevel: 3, semester: 1, prerequisites: ['ITE203'], category: 'major' },
  { id: '30', courseCode: 'ITE302', title: 'System Analysis and Design', units: 3, yearLevel: 3, semester: 1, prerequisites: ['ITE204'], category: 'major' },
  { id: '31', courseCode: 'ITE303', title: 'Human Computer Interaction', units: 3, yearLevel: 3, semester: 1, category: 'major' },
  { id: '32', courseCode: 'ELEC301', title: 'Professional Elective 1', units: 3, yearLevel: 3, semester: 1, category: 'elective' },

  // Year 3, Second Semester
  { id: '33', courseCode: 'CS303', title: 'Computer Architecture', units: 3, yearLevel: 3, semester: 2, prerequisites: ['CS301'], category: 'core' },
  { id: '34', courseCode: 'CS304', title: 'Application Development', units: 3, yearLevel: 3, semester: 2, prerequisites: ['CS302'], category: 'core' },
  { id: '35', courseCode: 'ITE304', title: 'Information Assurance and Security', units: 3, yearLevel: 3, semester: 2, category: 'major' },
  { id: '36', courseCode: 'ITE305', title: 'Mobile Application Development', units: 3, yearLevel: 3, semester: 2, prerequisites: ['ITE302'], category: 'major' },
  { id: '37', courseCode: 'ITE306', title: 'IT Project Management', units: 3, yearLevel: 3, semester: 2, category: 'major' },
  { id: '38', courseCode: 'ELEC302', title: 'Professional Elective 2', units: 3, yearLevel: 3, semester: 2, category: 'elective' },

  // Year 4, First Semester
  { id: '39', courseCode: 'CS401', title: 'Capstone Project 1', units: 3, yearLevel: 4, semester: 1, prerequisites: ['CS304', 'ITE306'], category: 'core' },
  { id: '40', courseCode: 'CS402', title: 'Social and Professional Issues', units: 3, yearLevel: 4, semester: 1, category: 'core' },
  { id: '41', courseCode: 'ITE401', title: 'Cloud Computing', units: 3, yearLevel: 4, semester: 1, category: 'major' },
  { id: '42', courseCode: 'ITE402', title: 'Data Analytics', units: 3, yearLevel: 4, semester: 1, category: 'major' },
  { id: '43', courseCode: 'ELEC401', title: 'Professional Elective 3', units: 3, yearLevel: 4, semester: 1, category: 'elective' },
  { id: '44', courseCode: 'ELEC402', title: 'Professional Elective 4', units: 3, yearLevel: 4, semester: 1, category: 'elective' },

  // Year 4, Second Semester
  { id: '45', courseCode: 'CS403', title: 'Capstone Project 2', units: 3, yearLevel: 4, semester: 2, prerequisites: ['CS401'], category: 'core' },
  { id: '46', courseCode: 'CS404', title: 'Practicum/Internship', units: 6, yearLevel: 4, semester: 2, category: 'core' },
  { id: '47', courseCode: 'ITE403', title: 'Emerging Technologies', units: 3, yearLevel: 4, semester: 2, category: 'major' },
  { id: '48', courseCode: 'ELEC403', title: 'Professional Elective 5', units: 3, yearLevel: 4, semester: 2, category: 'elective' },
];

const SEMESTER_LABELS: Record<number, string> = {
  1: 'First Semester',
  2: 'Second Semester',
  3: 'Summer',
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: 'Core', color: 'bg-blue-100 text-blue-800' },
  major: { label: 'Major', color: 'bg-purple-100 text-purple-800' },
  elective: { label: 'Elective', color: 'bg-green-100 text-green-800' },
  ge: { label: 'Gen Ed', color: 'bg-gray-100 text-gray-800' },
  pe: { label: 'PE', color: 'bg-pink-100 text-pink-800' },
  nstp: { label: 'NSTP', color: 'bg-orange-100 text-orange-800' },
};

const STATUS_COLORS = {
  enrolled: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  available: 'bg-gray-100 text-gray-600',
  locked: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export function ProspectusPage() {
  const queryClient = useQueryClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'curriculum' | 'enrollments'>('curriculum');
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => enrollmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      // Refetch enrollments
      if (student?.id) {
        studentsApi.enrollments(student.id).then(res => setEnrollments(res.data || []));
      }
    },
    onError: (error) => {
      const appError = AppError.fromApiError(error);
      setGlobalError(appError.message);
    },
  });

  // Fetch student data and enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentRes = await studentsApi.me();
        setStudent(studentRes.data);
        
        if (studentRes.data?.id) {
          const enrollmentsRes = await studentsApi.enrollments(studentRes.data.id);
          setEnrollments(enrollmentsRes.data || []);
        }
      } catch (err) {
        setError('Failed to load prospectus data');
        console.error('Error fetching prospectus data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get enrolled course codes
  const enrolledCourseCodes = new Set(
    enrollments
      .filter(e => e.course_offering && e.course_offering.course && e.course_offering.course.course_code)
      .map(e => e.course_offering!.course!.course_code)
  );

  // Get completed course codes (from grades)
  const completedCourseCodes = new Set(
    enrollments
      .filter(e => e.grade && e.grade.final_grade !== null && e.grade.final_grade >= 75 && e.course_offering && e.course_offering.course && e.course_offering.course.course_code) // Assuming 75 is passing
      .map(e => e.course_offering!.course!.course_code)
  );

  // Group curriculum by year and semester
  const groupedCurriculum: YearSemesterGroup[] = [];
  const years = [...new Set(BSIT_CURRICULUM.map(c => c.yearLevel))].sort((a, b) => a - b);
  
  years.forEach(year => {
    const semesters = [...new Set(BSIT_CURRICULUM.filter(c => c.yearLevel === year).map(c => c.semester))].sort((a, b) => a - b);
    semesters.forEach(semester => {
      const courses = BSIT_CURRICULUM
        .filter(c => c.yearLevel === year && c.semester === semester)
        .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
      
      if (courses.length > 0) {
        groupedCurriculum.push({
          year,
          semester,
          label: `Year ${year} - ${SEMESTER_LABELS[semester]}`,
          courses,
        });
      }
    });
  });

  // Determine course status
  const getCourseStatus = (course: CurriculumCourse) => {
    const courseCode = course.courseCode;
    
    if (completedCourseCodes.has(courseCode)) {
      return { status: 'completed', label: 'Completed' };
    }
    if (enrolledCourseCodes.has(courseCode)) {
      return { status: 'enrolled', label: 'Enrolled' };
    }
    
    // Check if prerequisites are met
    const prerequisitesMet = course.prerequisites?.every(prereq => 
      completedCourseCodes.has(prereq) || enrolledCourseCodes.has(prereq)
    ) ?? true;
    
    // Check if course is for current or past year/semester
    const studentYear = student?.year_level || 1;
    const isCurrentOrPast = course.yearLevel < studentYear || 
      (course.yearLevel === studentYear && course.semester <= 2); // Simplified
    
    if (!prerequisitesMet) {
      return { status: 'locked', label: 'Prerequisites not met' };
    }
    if (isCurrentOrPast) {
      return { status: 'available', label: 'Available' };
    }
    return { status: 'pending', label: 'Future Course' };
  };

  // Filter curriculum
  const filteredCurriculum = groupedCurriculum.filter(group => {
    if (filterYear !== 'all' && group.year !== filterYear) return false;
    if (filterSemester !== 'all' && group.semester !== filterSemester) return false;
    return true;
  }).map(group => ({
    ...group,
    courses: group.courses.filter(course => {
      if (searchQuery && !course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      const courseStatus = getCourseStatus(course);
      if (filterStatus !== 'all' && courseStatus.status !== filterStatus) return false;
      return true;
    }),
  })).filter(group => group.courses.length > 0);

  // Calculate progress
  const totalCourses = BSIT_CURRICULUM.length;
  const completedCount = BSIT_CURRICULUM.filter(c => completedCourseCodes.has(c.courseCode)).length;
  const enrolledCount = BSIT_CURRICULUM.filter(c => enrolledCourseCodes.has(c.courseCode)).length;
  const progressPercent = totalCourses > 0 ? Math.round(((completedCount + enrolledCount) / totalCourses) * 100) : 0;

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Unable to load prospectus</h3>
        <p className="text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Program Prospectus
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {student?.program?.name || 'BS Information Technology'} Curriculum - 
            Year {student?.year_level || 1} Student
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Prospectus tabs">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'curriculum'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Curriculum
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'enrollments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            My Enrollments
          </button>
        </nav>
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

      {/* Progress Summary */}
      {activeTab === 'curriculum' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{progressPercent}%</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {completedCount} completed, {enrolledCount} enrolled of {totalCourses} total courses
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Completed Courses</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{completedCount}</p>
          <p className="text-sm text-gray-500 mt-1">Out of {totalCourses} total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Currently Enrolled</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{enrolledCount}</p>
          <p className="text-sm text-gray-500 mt-1">Active this term</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Semesters</option>
            <option value={1}>First Semester</option>
            <option value={2}>Second Semester</option>
            <option value={3}>Summer</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="enrolled">Enrolled</option>
            <option value="available">Available</option>
            <option value="locked">Locked</option>
            <option value="pending">Future</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Legend</p>
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'completed', label: 'Completed' },
            { status: 'enrolled', label: 'Currently Enrolled' },
            { status: 'available', label: 'Available to Enroll' },
            { status: 'locked', label: 'Prerequisites Not Met' },
            { status: 'pending', label: 'Future Course' },
          ].map(item => (
            <span key={item.status} className="flex items-center gap-2 text-sm text-gray-700">
              <span className={cn('w-3 h-3 rounded', STATUS_COLORS[item.status as keyof typeof STATUS_COLORS])} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-4">
        {filteredCurriculum.map(group => (
          <div key={`${group.year}-${group.semester}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Year/Semester Header */}
            <button
              onClick={() => toggleYear(group.year)}
              className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                  group.year === 1 ? 'bg-blue-100 text-blue-700' :
                  group.year === 2 ? 'bg-green-100 text-green-700' :
                  group.year === 3 ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                )}>
                  {group.year}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.label}</h3>
                  <p className="text-sm text-gray-500">
                    {group.courses.length} courses • {group.courses.reduce((sum, c) => sum + c.units, 0)} units
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  group.courses.some(c => getCourseStatus(c).status === 'enrolled') ? 'bg-green-100 text-green-800' :
                  group.courses.every(c => getCourseStatus(c).status === 'completed') ? 'bg-blue-100 text-blue-800' :
                  group.courses.some(c => getCourseStatus(c).status === 'available') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {group.courses.some(c => getCourseStatus(c).status === 'enrolled') ? 'In Progress' :
                   group.courses.every(c => getCourseStatus(c).status === 'completed') ? 'Completed' :
                   group.courses.some(c => getCourseStatus(c).status === 'available') ? 'Available' : 'Pending'}
                </span>
                <span className="text-gray-400">
                  {expandedYears.has(group.year) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </span>
              </div>
            </button>

            {/* Courses List */}
            {expandedYears.has(group.year) && (
              <div className="divide-y divide-gray-100">
                {group.courses.map(course => {
                  const courseStatus = getCourseStatus(course);
                  const category = CATEGORY_LABELS[course.category];
                  
                  return (
                    <div key={course.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Status Indicator */}
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            STATUS_COLORS[courseStatus.status as keyof typeof STATUS_COLORS]
                          )}>
                            {courseStatus.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                            {courseStatus.status === 'enrolled' && <BookOpen className="w-5 h-5" />}
                            {courseStatus.status === 'available' && <GraduationCap className="w-5 h-5" />}
                            {courseStatus.status === 'locked' && <AlertCircle className="w-5 h-5" />}
                            {courseStatus.status === 'pending' && <Clock className="w-5 h-5" />}
                          </div>
                          
                          {/* Course Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-semibold text-gray-900">{course.courseCode}</span>
                              <span className="text-gray-700">{course.title}</span>
                              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', category.color)}>
                                {category.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {course.units} units
                              </span>
                              {course.prerequisites && course.prerequisites.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Prereq: {course.prerequisites.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 sm:ml-4">
                          <span className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                            STATUS_COLORS[courseStatus.status as keyof typeof STATUS_COLORS]
                          )}>
                            {courseStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {filteredCurriculum.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Enrollments Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Enrollments</h2>
              <p className="text-gray-500 mt-1">View and manage your current enrollments</p>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="w-12 h-12 text-gray-300" />
                          <p>No enrollments found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{enrollment.course_offering?.course?.course_code}</p>
                            <p className="text-sm text-gray-500">{enrollment.course_offering?.course?.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{enrollment.course_offering?.section}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{enrollment.enrollment_date}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            enrollment.status === 'ENROLLED' && 'bg-green-100 text-green-800',
                            enrollment.status === 'DROPPED' && 'bg-red-100 text-red-800',
                            enrollment.status === 'COMPLETED' && 'bg-blue-100 text-blue-800'
                          )}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(enrollment.id)}
                              disabled={deleteMutation.isPending && deleteMutation.variables === enrollment.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              aria-label="Drop enrollment"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === enrollment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
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
    </div>
    );
}

export default ProspectusPage;