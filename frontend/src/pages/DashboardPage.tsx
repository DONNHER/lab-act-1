// Dashboard Page
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Users, GraduationCap, BookOpen, Calendar, ClipboardList, Award, FileText, TrendingUp } from 'lucide-react';
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

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Role-specific stats
  const getStats = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { title: 'Total Students', value: '1,234', icon: <Users className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '+12% from last month' },
          { title: 'Active Programs', value: '12', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: '+2 new' },
          { title: 'Courses', value: '89', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: '+5 this term' },
          { title: 'Active Terms', value: '2', icon: <Calendar className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600', trend: 'Current: Fall 2024' },
        ];
      case 'REGISTRAR':
        return [
          { title: 'Total Students', value: '1,234', icon: <Users className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '+12% from last month' },
          { title: 'Pending Enrollments', value: '23', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Requires review' },
          { title: 'Active Programs', value: '12', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: '+2 new' },
          { title: 'Current Term', value: 'Fall 2024', icon: <Calendar className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600', trend: 'Open for enrollment' },
        ];
      case 'INSTRUCTOR':
        return [
          { title: 'My Courses', value: '4', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '2 sections each' },
          { title: 'Total Students', value: '156', icon: <Users className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Across all sections' },
          { title: 'Pending Grades', value: '18', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Due this week' },
          { title: 'Course Offerings', value: '8', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: 'Active this term' },
        ];
      case 'STUDENT':
        return [
          { title: 'Enrolled Courses', value: '5', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', trend: '15 units' },
          { title: 'Completed Credits', value: '78', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-green-100 text-green-600', trend: 'Of 120 required' },
          { title: 'Current GPA', value: '3.45', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', trend: 'Dean\'s List' },
          { title: 'Pending Grades', value: '2', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', trend: 'Awaiting publication' },
        ];
      default:
        return [];
    }
  };

  const stats = getStats();

  const quickActions = [
    { label: 'View Students', path: '/students', icon: Users, roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR'] },
    { label: 'Manage Programs', path: '/programs', icon: GraduationCap, roles: ['ADMIN', 'REGISTRAR'] },
    { label: 'Course Offerings', path: '/course-offerings', icon: ClipboardList, roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR'] },
    { label: 'Enrollments', path: '/enrollments', icon: ClipboardList, roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT'] },
    { label: 'Grades', path: '/grades', icon: Award, roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT'] },
    { label: 'Academic Record', path: '/academic-records', icon: FileText, roles: ['ADMIN', 'REGISTRAR', 'STUDENT'] },
  ];

  const filteredActions = quickActions.filter((action) => action.roles.includes(user?.role || ''));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}! Here's an overview of your {user?.role?.toLowerCase()} portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getRoleColor(user?.role || ''))}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>Recent activity will appear here once you start using the system.</p>
        </div>
      </div>
    </div>
  );
};

// Helper function for role colors
function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    REGISTRAR: 'bg-blue-100 text-blue-800',
    INSTRUCTOR: 'bg-green-100 text-green-800',
    STUDENT: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}