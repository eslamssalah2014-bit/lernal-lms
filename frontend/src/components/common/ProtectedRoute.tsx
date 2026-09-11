// ============================================================================
// PROTECTED ROUTE COMPONENT (RBAC GUARD)
// Ensures users are authenticated and possess the required role permissions
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldAlert, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'instructor' | 'student' | 'parent'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isLoading, openAuthModal, loginDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#00A9D6]/20 border-t-[#00A9D6] rounded-full animate-spin" />
        <p className="text-xs text-[#8DDFFF]">Verifying authorization...</p>
      </div>
    );
  }

  // 1. Unauthenticated prompt
  if (!user || role === 'guest') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#00212D] border border-[#004D6A] rounded-3xl text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#003B4F] border border-[#36C7F4]/30 flex items-center justify-center text-[#36C7F4]">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-xs text-gray-400 mb-6">
          This portal requires an authenticated Lernal LMS account to access customized learning or management tools.
        </p>

        <button
          onClick={() => openAuthModal('login')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all mb-4"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Register with Supabase</span>
        </button>

        <div className="pt-4 border-t border-[#003B4F]">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-2">
            Or Test Instantly With A Demo Persona
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => loginDemo('student')}
              className="px-3 py-1.5 bg-[#002B3B] hover:bg-[#003B4F] border border-[#004D6A] rounded-lg text-xs text-amber-300 transition-colors"
            >
              Student
            </button>
            <button
              onClick={() => loginDemo('parent')}
              className="px-3 py-1.5 bg-[#002B3B] hover:bg-[#003B4F] border border-[#004D6A] rounded-lg text-xs text-emerald-300 transition-colors"
            >
              Parent
            </button>
            <button
              onClick={() => loginDemo('admin')}
              className="px-3 py-1.5 bg-[#002B3B] hover:bg-[#003B4F] border border-[#004D6A] rounded-lg text-xs text-[#36C7F4] transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role unauthorized prompt
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#00212D] border border-amber-500/30 rounded-3xl text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
        <p className="text-xs text-gray-400 mb-6">
          Your current account role is <span className="text-[#36C7F4] font-semibold capitalize">{user.role}</span>.
          This section is restricted to: <span className="font-semibold text-gray-200">{allowedRoles.join(', ')}</span>.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-[#003B4F] hover:bg-[#004D6A] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
