// ============================================================================
// LERNAL LMS - MAIN APPLICATION ROUTER
// Seamlessly unites Public, Student, Parent, and Admin experiences
// Optimized with React.lazy code-splitting and Suspense for Vercel Edge performance
// ============================================================================

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Code-split dynamic page imports for optimal bundle size & fast FCP on Vercel
const HomePage = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const CourseCatalogPage = lazy(() => import('./pages/public/CourseCatalogPage').then(m => ({ default: m.CourseCatalogPage })));
const CourseDetailsPage = lazy(() => import('./pages/public/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));
const RecordedCoursesPage = lazy(() => import('./pages/public/RecordedCoursesPage').then(m => ({ default: m.RecordedCoursesPage })));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

const StudentDashboardPage = lazy(() => import('./pages/student/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const CoursePlayerPage = lazy(() => import('./pages/student/CoursePlayerPage').then(m => ({ default: m.CoursePlayerPage })));
const QuizTakePage = lazy(() => import('./pages/student/QuizTakePage').then(m => ({ default: m.QuizTakePage })));

const ParentDashboardPage = lazy(() => import('./pages/parent/ParentDashboardPage').then(m => ({ default: m.ParentDashboardPage })));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminLeadsCenterPage = lazy(() => import('./pages/admin/AdminLeadsCenterPage').then(m => ({ default: m.AdminLeadsCenterPage })));
const AdminFinancePage = lazy(() => import('./pages/admin/AdminFinancePage').then(m => ({ default: m.AdminFinancePage })));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage').then(m => ({ default: m.AdminCoursesPage })));
const AdminTestingPage = lazy(() => import('./pages/admin/AdminTestingPage').then(m => ({ default: m.AdminTestingPage })));
const AdminRostersPage = lazy(() => import('./pages/admin/AdminRostersPage').then(m => ({ default: m.AdminRostersPage })));

// Branded loading spinner for asynchronous route chunks
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status" aria-label="Loading page">
    <div className="w-12 h-12 border-4 border-[#00A9D6]/20 border-t-[#00A9D6] rounded-full animate-spin"></div>
    <p className="text-[#8DDFFF] text-sm font-medium tracking-wide">Loading Lernal...</p>
  </div>
);

// Public Shell wrapper with Navbar and Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#00212D]">
    <Navbar />
    <main className="flex-1">
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

// Auth route trigger for direct /login, /signup, and /register URLs
const AuthModalRouteHandler: React.FC<{ tab: 'login' | 'register' }> = ({ tab }) => {
  const { openAuthModal } = useAuth();
  useEffect(() => {
    openAuthModal(tab);
  }, [tab, openAuthModal]);

  return (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public & Student / Parent Routes with Brand Navbar & Footer */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/login"
              element={<AuthModalRouteHandler tab="login" />}
            />
            <Route
              path="/signup"
              element={<AuthModalRouteHandler tab="register" />}
            />
            <Route
              path="/register"
              element={<AuthModalRouteHandler tab="register" />}
            />
            <Route
              path="/courses"
              element={
                <PublicLayout>
                  <CourseCatalogPage />
                </PublicLayout>
              }
            />
            <Route
              path="/courses/:slug"
              element={
                <PublicLayout>
                  <CourseDetailsPage />
                </PublicLayout>
              }
            />
            <Route
              path="/recorded"
              element={
                <PublicLayout>
                  <RecordedCoursesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicLayout>
                  <ResetPasswordPage />
                </PublicLayout>
              }
            />

            {/* Student Hub (Protected: student, admin) */}
            <Route
              path="/student/dashboard"
              element={
                <PublicLayout>
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                </PublicLayout>
              }
            />
            <Route
              path="/student/courses/:courseId/play"
              element={
                <PublicLayout>
                  <ProtectedRoute allowedRoles={['student', 'admin', 'instructor']}>
                    <CoursePlayerPage />
                  </ProtectedRoute>
                </PublicLayout>
              }
            />
            <Route
              path="/student/tests/:testId"
              element={
                <PublicLayout>
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <QuizTakePage />
                  </ProtectedRoute>
                </PublicLayout>
              }
            />

            {/* Parent Portal (Protected: parent, admin) */}
            <Route
              path="/parent/dashboard"
              element={
                <PublicLayout>
                  <ProtectedRoute allowedRoles={['parent', 'admin']}>
                    <ParentDashboardPage />
                  </ProtectedRoute>
                </PublicLayout>
              }
            />

            {/* Admin Command Center (Dedicated Layout, Protected: admin only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="leads" element={<AdminLeadsCenterPage />} />
              <Route path="finance" element={<AdminFinancePage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="testing" element={<AdminTestingPage />} />
              <Route path="rosters" element={<AdminRostersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
