// Forbidden Page (403)
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Lock className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Access Denied</h2>
          <p className="text-gray-500 mt-3">
            You don't have permission to access this page. Your role ({user?.role?.toLowerCase() || 'guest'}) 
            doesn't have the required privileges for this resource.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};