// Student Dashboard Page
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import {
  BookOpen,
  GraduationCap,
  Award,
  ClipboardList,
  Calendar,
  TrendingUp,
  FileText,
  Star,
  CheckCircle,
  Target,
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

export const StudentDashboardPage: React.FC = () => {
  useAuth();

  const stats = [
    { title: 'Enrolled Courses', value: '5', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '15 units' },
    { title: 'Completed Credits', value: '78', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Of 120 required' },
    { title: 'Current GPA', value: '3.45', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: 'Dean\'s List' },
    { title: 'Pending Grades', value: '2', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Awaiting publication' },
    { title: 'Attendance Rate', value: '96%', icon: <Target className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Excellent' },
    { title: 'Completed Courses', value: '26', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: 'On track' },
  ];

  const quickActions = [
    { label: 'My Enrollments', path: '/enrollments', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'View and manage your course enrollments' },
    { label: 'My Grades', path: '/grades', icon: <Award className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600', description: 'View your grades and academic performance' },
    { label: 'Academic Record', path: '/academic-records', icon: <FileText className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600', description: 'View your complete academic transcript' },
    { label: 'My Profile', path: '/profile', icon: <Star className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', description: 'Manage your profile and settings' },
  ];

  // Current enrollments
  const currentEnrollments = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      section: 'A',
      units: 3,
      schedule: 'MWF 9:00-10:00 AM',
      room: 'Room 101',
      instructor: 'Dr. Smith',
      grade: 'A-',
      status: 'ENROLLED',
    },
    {
      id: 2,
      code: 'CS201',
      name: 'Data Structures',
      section: 'B',
      units: 3,
      schedule: 'TTH 10:00-11:30 AM',
      room: 'Room 205',
      instructor: 'Prof. Johnson',
      grade: 'B+',
      status: 'ENROLLED',
    },
    {
      id: 3,
      code: 'CS301',
      name: 'Database Systems',
      section: 'A',
      units: 3,
      schedule: 'MWF 11:00-12:00 PM',
      room: 'Lab 3',
      instructor: 'Dr. Williams',
      grade: 'A',
      status: 'ENROLLED',
    },
    {
      id: 4,
      code: 'MATH101',
      name: 'Calculus I',
      section: 'B',
      units: 4,
      schedule: 'MWF 10:00-11:00 AM',
      room: 'Room 201',
      instructor: 'Prof. Davis',
      grade: 'B+',
      status: 'ENROLLED',
    },
    {
      id: 5,
      code: 'ENG101',
      name: 'English Composition',
      section: 'A',
      units: 3,
      schedule: 'TTH 1:00-2:30 PM',
      room: 'Room 105',
      instructor: 'Prof. Wilson',
      grade: 'A-',
      status: 'ENROLLED',
    },
  ];

  // Grade history
  const gradeHistory = [
    { term: 'Fall 2024', course: 'CS101', grade: 'A-', units: 3, status: 'Completed' },
    { term: 'Fall 2024', course: 'CS201', grade: 'B+', units: 3, status: 'Completed' },
    { term: 'Fall 2024', course: 'MATH101', grade: 'B+', units: 4, status: 'Completed' },
    { term: 'Spring 2024', course: 'CS102', grade: 'A', units: 3, status: 'Completed' },
    { term: 'Spring 2024', course: 'ENG101', grade: 'A-', units: 3, status: 'Completed' },
    { term: 'Spring 2024', course: 'PHYS101', grade: 'A', units: 4, status: 'Completed' },
  ];

  // Upcoming assignments
  const upcomingAssignments = [
    { course: 'CS301', title: 'Database Design Project', due: '2024-12-15', type: 'Project', weight: '25%' },
    { course: 'MATH101', title: 'Final Exam', due: '2024-12-18', type: 'Exam', weight: '30%' },
    { course: 'ENG101', title: 'Research Paper', due: '2024-12-10', type: 'Paper', weight: '20%' },
    { course: 'CS101', title: 'Final Exam', due: '2024-12-20', type: 'Exam', weight: '25%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your academic overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium', 'bg-green-100 text-green-800')}>
            STUDENT
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

      {/* Current Enrollments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Current Enrollments
          </h3>
          <Link to="/enrollments" className="text-sm text-primary hover:text-primary-hover font-medium">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{enrollment.code}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{enrollment.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {enrollment.section}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{enrollment.units}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{enrollment.schedule}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{enrollment.instructor}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      enrollment.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                      enrollment.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      enrollment.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {enrollment.grade}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'DROPPED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {enrollment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade History */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Grade History
            </h3>
            <Link to="/grades" className="text-sm text-primary hover:text-primary-hover font-medium">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gradeHistory.map((grade) => (
                  <tr key={`${grade.term}-${grade.course}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{grade.term}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{grade.course}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        grade.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        grade.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{grade.units}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        grade.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {grade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Assignments & Exams
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div key={`${assignment.course}-${assignment.title}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">{assignment.type.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.course} • {assignment.type} • {assignment.weight}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{assignment.due}</p>
                  <p className="text-sm text-gray-500">Due</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Degree Progress
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-primary">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">78</p>
              <p className="text-sm text-gray-500">Credits Completed</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">120</p>
              <p className="text-sm text-gray-500">Credits Required</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">3.45</p>
              <p className="text-sm text-gray-500">Current GPA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};