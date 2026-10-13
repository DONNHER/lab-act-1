// Registrar Dashboard Page
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Award,
  FileText,
  Search,
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

export const RegistrarDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: <Users className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '+12% from last month' },
    { title: 'Active Programs', value: '12', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: '+2 new' },
    { title: 'Active Courses', value: '89', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: '+5 this term' },
    { title: 'Current Term', value: 'Fall 2024', icon: <Calendar className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600', trend: 'Open for enrollment' },
    { title: 'Pending Enrollments', value: '23', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Requires review' },
    { title: 'Pending Grades', value: '18', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Due this week' },
  ];

  const quickActions = [
    { label: 'Manage Students', path: '/students', icon: <Users className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'View, add, edit, and manage student records' },
    { label: 'Manage Programs', path: '/programs', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-green-100 text-green-600', description: 'Create and manage academic programs' },
    { label: 'Manage Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', description: 'Create and manage course catalog' },
    { label: 'Academic Terms', path: '/academic-terms', icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600', description: 'Manage academic terms and semesters' },
    { label: 'Course Offerings', path: '/course-offerings', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600', description: 'Manage course offerings and sections' },
    { label: 'Enrollments', path: '/enrollments', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600', description: 'Manage student enrollments' },
    { label: 'Grades', path: '/grades', icon: <Award className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600', description: 'Manage and review grades' },
    { label: 'Academic Records', path: '/academic-records', icon: <FileText className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600', description: 'View and manage academic records' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registrar Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}! Student and academic management portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium', 'bg-blue-100 text-blue-800')}>
            REGISTRAR
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

      {/* Student Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Student Overview
            </h3>
            <Link to="/students" className="text-sm text-primary hover:text-primary-hover font-medium">
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">JD</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">John Doe</p>
                          <p className="text-sm text-gray-500">2024-00001</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">BS Computer Science</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Year 3</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">ACTIVE</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-sm font-medium">JS</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Jane Smith</p>
                          <p className="text-sm text-gray-500">2024-00002</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">BS Information Technology</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Year 2</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">ACTIVE</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z" /></svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enrollment Deadline - Fall 2024</p>
                  <p className="text-sm text-gray-500">Last day to enroll for Fall semester</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">3 days left</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Grade Submission Deadline</p>
                  <p className="text-sm text-gray-500">Final grades due for Fall 2024</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">7 days left</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Graduation Application Deadline</p>
                  <p className="text-sm text-gray-500">Spring 2025 graduation applications</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">30 days left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};