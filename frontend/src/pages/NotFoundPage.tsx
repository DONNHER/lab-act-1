// Not Found Page (404)
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertTriangle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Page Not Found</h2>
          <p className="text-gray-500 mt-3">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
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
          <Link
            to="/students"
            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Students
          </Link>
        </div>
      </div>
    </div>
  );
};