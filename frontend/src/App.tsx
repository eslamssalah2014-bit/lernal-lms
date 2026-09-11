// ============================================================================
// LERNAL LMS - MAIN APPLICATION ROUTER
// Seamlessly unites Public, Student, Parent, and Admin experiences
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CourseCatalogPage } from './pages/public/CourseCatalogPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { RecordedCoursesPage } from './pages/public/RecordedCoursesPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { QuizTakePage } from './pages/student/QuizTakePage';

// Parent Pages
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLeadsCenterPage } from './pages/admin/AdminLeadsCenterPage';
import { AdminFinancePage } from './pages/admin/AdminFinancePage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminTestingPage } from './pages/admin/AdminTestingPage';
import { AdminRostersPage } from './pages/admin/AdminRostersPage';

// Public Shell wrapper with Navbar and Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#00212D]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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

          {/* Student Hub */}
          <Route
            path="/student/dashboard"
            element={
              <PublicLayout>
                <StudentDashboardPage />
              </PublicLayout>
            }
          />
          <Route
            path="/student/courses/:courseId/play"
            element={
              <PublicLayout>
                <CoursePlayerPage />
              </PublicLayout>
            }
          />
          <Route
            path="/student/tests/:testId"
            element={
              <PublicLayout>
                <QuizTakePage />
              </PublicLayout>
            }
          />

          {/* Parent Portal */}
          <Route
            path="/parent/dashboard"
            element={
              <PublicLayout>
                <ParentDashboardPage />
              </PublicLayout>
            }
          />

          {/* Admin Command Center (Dedicated Layout) */}
          <Route path="/admin" element={<AdminLayout />}>
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
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
