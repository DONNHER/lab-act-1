// Main App Component with Routing
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts';
import { AuthLayout, MainLayout } from './layouts';
import { LoginPage } from './pages';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RegistrarDashboardPage } from './pages/RegistrarDashboardPage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CoursesPage } from './pages/CoursesPage';
import { AcademicTermsPage } from './pages/AcademicTermsPage';
import { CourseOfferingsPage } from './pages/CourseOfferingsPage';
import { AcademicRecordsPage } from './pages/AcademicRecordsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProspectusPage } from './pages/ProspectusPage';
import { UsersPage } from './pages/UsersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { AdminEnrollmentsPage } from './pages/admin/AdminEnrollmentsPage';
import { AdminGradesPage } from './pages/admin/AdminGradesPage';
import { RegistrarEnrollmentsPage } from './pages/registrar/RegistrarEnrollmentsPage';
import { RegistrarGradesPage } from './pages/registrar/RegistrarGradesPage';
import { InstructorEnrollmentsPage } from './pages/instructor/InstructorEnrollmentsPage';
import { InstructorGradesPage } from './pages/instructor/InstructorGradesPage';
import { StudentEnrollmentsPage } from './pages/student/StudentEnrollmentsPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentAcademicRecordsPage } from './pages/student/StudentAcademicRecordsPage';
import { StudentStudentsPage } from './pages/student/StudentStudentsPage';
import { SettingsPage } from './pages/SettingsPage';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

// Need to import useAuth
import { useAuth } from './contexts';

// Role-specific Dashboard Wrapper
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboardPage />;
    case 'REGISTRAR':
      return <RegistrarDashboardPage />;
    case 'INSTRUCTOR':
      return <InstructorDashboardPage />;
    case 'STUDENT':
      return <StudentDashboardPage />;
    default:
      return <DashboardPage />;
  }
};

const RoleEnrollmentsPage: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN': return <AdminEnrollmentsPage />;
    case 'REGISTRAR': return <RegistrarEnrollmentsPage />;
    case 'INSTRUCTOR': return <InstructorEnrollmentsPage />;
    case 'STUDENT': return <StudentEnrollmentsPage />;
    default: return <ForbiddenPage />;
  }
};

const RoleGradesPage: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN': return <AdminGradesPage />;
    case 'REGISTRAR': return <RegistrarGradesPage />;
    case 'INSTRUCTOR': return <InstructorGradesPage />;
    case 'STUDENT': return <StudentGradesPage />;
    default: return <ForbiddenPage />;
  }
};

const RoleAcademicRecordsPage: React.FC = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentAcademicRecordsPage /> : <AcademicRecordsPage />;
};

const RoleProfilePage: React.FC = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentStudentsPage /> : <ProfilePage />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthLayout />}>
              <Route index element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Role-specific dashboard routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registrar/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['REGISTRAR']}>
                    <RegistrarDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                    <InstructorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR', 'INSTRUCTOR']}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/programs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR']}>
                    <ProgramsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR']}>
                    <CoursesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academic-terms"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR']}>
                    <AcademicTermsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course-offerings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR', 'INSTRUCTOR']}>
                    <CourseOfferingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrollments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']}>
                    <RoleEnrollmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']}>
                    <RoleGradesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academic-records"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'REGISTRAR', 'STUDENT']}>
                    <RoleAcademicRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prospectus"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <ProspectusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <RoleProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Error Pages */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
