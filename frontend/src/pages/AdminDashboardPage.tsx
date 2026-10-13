// Admin Dashboard Page
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
  Settings,
  UserPlus,
  AlertTriangle,
  BarChart2,
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

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: <Users className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '+12% from last month' },
    { title: 'Active Programs', value: '12', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: '+2 new' },
    { title: 'Courses', value: '89', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: '+5 this term' },
    { title: 'Active Terms', value: '2', icon: <Calendar className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600', trend: 'Current: Fall 2024' },
    { title: 'Instructors', value: '45', icon: <UserPlus className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-600', trend: '+3 this term' },
    { title: 'Pending Approvals', value: '7', icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-red-100 text-red-600', trend: 'Needs attention' },
  ];

  const quickActions = [
    { label: 'Manage Students', path: '/students', icon: <Users className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'View, add, edit, and manage student records' },
    { label: 'Manage Programs', path: '/programs', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-green-100 text-green-600', description: 'Create and manage academic programs' },
    { label: 'Manage Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', description: 'Create and manage course catalog' },
    { label: 'Academic Terms', path: '/academic-terms', icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600', description: 'Manage academic terms and semesters' },
    { label: 'Course Offerings', path: '/course-offerings', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600', description: 'Manage course offerings and sections' },
    { label: 'Enrollments', path: '/enrollments', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600', description: 'Manage student enrollments' },
    { label: 'Grades', path: '/grades', icon: <Award className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600', description: 'Manage and review grades' },
    { label: 'User Management', path: '/users', icon: <Settings className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600', description: 'Manage system users and roles' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}! System administration overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            ADMIN
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

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            System Overview
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">System Health</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">API Response Time</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Database Status</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users (24h)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">+</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New student enrolled</p>
                <p className="text-sm text-gray-500">John Doe enrolled in CS101</p>
              </div>
              <span className="text-sm text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium">✓</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Grade published</p>
                <p className="text-sm text-gray-500">CS101 midterm grades published</p>
              </div>
              <span className="text-sm text-gray-400">15 min ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-medium">!</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Pending approval</p>
                <p className="text-sm text-gray-500">5 enrollment requests pending</p>
              </div>
              <span className="text-sm text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};