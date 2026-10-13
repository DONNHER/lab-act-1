// Instructor Dashboard Page
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import {
  BookOpen,
  Users,
  Award,
  ClipboardList,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Eye,
  Star,
  BookMarked,
} from 'lucide-react';
import { cn } from '../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, path, icon, color, description }) => (
  <Link
    to={path}
    className={cn(
      'flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors',
      'group'
    )}
  >
    <div className={cn('p-3 rounded-lg', color)}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{label}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
    <span className="text-gray-400 group-hover:text-primary transition-colors">→</span>
  </Link>
);

export const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'My Courses', value: '4', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '2 sections each' },
    { title: 'Total Students', value: '156', icon: <Users className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Across all sections' },
    { title: 'Pending Grades', value: '18', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Due this week' },
    { title: 'Course Offerings', value: '8', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: 'Active this term' },
    { title: 'Avg Grade', value: '87%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Above average' },
    { title: 'Completion Rate', value: '92%', icon: <Star className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Above target' },
  ];

  const quickActions = [
    { label: 'My Course Offerings', path: '/course-offerings', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'Manage your course offerings and sections' },
    { label: 'My Students', path: '/students', icon: <Users className="w-5 h-5" />, color: 'bg-green-100 text-green-600', description: 'View students enrolled in your courses' },
    { label: 'Enter Grades', path: '/grades', icon: <Award className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600', description: 'Enter and manage student grades' },
    { label: 'Course Offerings', path: '/course-offerings', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', description: 'View all course offerings' },
  ];

  // Sample course offerings data
  const myCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      section: 'A',
      students: 45,
      schedule: 'MWF 9:00-10:00',
      room: 'Room 101',
      pendingGrades: 5,
    },
    {
      id: 2,
      code: 'CS201',
      name: 'Data Structures',
      section: 'B',
      students: 32,
      schedule: 'TTH 10:00-11:30',
      room: 'Room 205',
      pendingGrades: 12,
    },
    {
      id: 3,
      code: 'CS301',
      name: 'Database Systems',
      section: 'A',
      students: 28,
      schedule: 'MWF 11:00-12:00',
      room: 'Lab 3',
      pendingGrades: 8,
    },
    {
      id: 4,
      code: 'CS401',
      name: 'Software Engineering',
      section: 'B',
      students: 22,
      schedule: 'TTH 13:00-14:30',
      room: 'Room 301',
      pendingGrades: 3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}! Manage your courses and students.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium', 'bg-green-100 text-green-800')}>
            INSTRUCTOR
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-primary" />
            My Courses
          </h3>
          <Link to="/course-offerings" className="text-sm text-primary hover:text-primary-hover font-medium">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Grades</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{course.code}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{course.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {course.section}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{course.students}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{course.schedule}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{course.room}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      course.pendingGrades > 10 ? 'bg-red-100 text-red-800' :
                      course.pendingGrades > 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      {course.pendingGrades} pending
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/course-offerings/${course.id}`}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="View"
                        aria-label="View course"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/grades?offering=${course.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Enter Grades"
                        aria-label="Enter Grades"
                      >
                        <Award className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/enrollments?offering=${course.id}`}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="View Enrollments"
                        aria-label="View Enrollments"
                      >
                        <Users className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Grade Submission Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS201 - Data Structures (Section B)</p>
              <p className="text-sm text-gray-500">Midterm grades due in 2 days</p>
            </div>
            <Link
              to="/grades?offering=2"
              className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Enter Grades
            </Link>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS401 - Software Engineering (Section B)</p>
              <p className="text-sm text-gray-500">Final grades due in 5 days</p>
            </div>
            <Link
              to="/grades?offering=4"
              className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Enter Grades
            </Link>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS101 - Intro to CS (Section A)</p>
              <p className="text-sm text-gray-500">All grades submitted ✓</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Complete</span>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          This Week's Schedule
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">MON</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">CS101 - Section A</p>
              <p className="text-sm text-gray-500">9:00 AM - 10:00 AM | Room 101</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Lecture</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">TUE</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">CS201 - Section B</p>
              <p className="text-sm text-gray-500">10:00 AM - 11:30 AM | Room 205</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Lecture</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">WED</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">CS301 - Section A</p>
              <p className="text-sm text-gray-500">11:00 AM - 12:00 PM | Lab 3</p>
            </div>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Lab</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">THU</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">CS401 - Section B</p>
              <p className="text-sm text-gray-500">1:00 PM - 2:30 PM | Room 301</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Lecture</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">FRI</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">CS101 - Section A (Lab)</p>
              <p className="text-sm text-gray-500">2:00 PM - 4:00 PM | Lab 3</p>
            </div>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Lab</span>
          </div>
        </div>
      </div>
    </div>
  );
};