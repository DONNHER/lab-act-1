// Profile Page
import React from 'react';
import { useAuth } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Edit2, LogOut, Settings } from 'lucide-react';
import { cn, formatDate } from '../utils';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2', getRoleColor(user?.role || ''))}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-4 h-4" />
            Change Password
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
            <User className="w-4 h-4" />
            Deactivate Account
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    REGISTRAR: 'bg-blue-100 text-blue-800',
    INSTRUCTOR: 'bg-green-100 text-green-800',
    STUDENT: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}