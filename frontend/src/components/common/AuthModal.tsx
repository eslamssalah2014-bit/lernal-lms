// ============================================================================
// AUTHENTICATION MODAL (SUPABASE POWERED)
// Unified modal for Login, Sign Up (Student, Parent, Instructor) & Password Reset
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth, AuthModalTab } from '../../context/AuthContext';
import { LernalLogo } from './LernalLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    register,
    resetPassword,
    loginDemo,
  } = useAuth();

  const [tab, setTab] = useState<AuthModalTab>(authModalTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'instructor'>('student');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setTab(authModalTab);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalTab, isAuthModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else if (tab === 'register') {
        await register({
          email,
          password,
          full_name: fullName,
          role: selectedRole,
          phone,
        });
      } else if (tab === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Check your email! Password reset instructions have been sent.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00141C]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#00212D] border border-[#004D6A] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00A9D6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#8DDFFF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#002D3D] transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-6">
            <LernalLogo size="md" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#36C7F4]">
              Supabase Auth & PostgreSQL
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 mb-6 bg-[#001720] border border-[#003B4F] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-[#003B4F] text-[#8DDFFF] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-[#003B4F] text-[#8DDFFF] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs text-rose-200 bg-rose-950/50 border border-rose-800/60 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs text-emerald-200 bg-emerald-950/50 border border-emerald-800/60 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                {/* Role Selector Pill Box */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Select Your Persona
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedRole === 'student'
                          ? 'bg-[#003B4F] border-[#36C7F4] text-[#8DDFFF]'
                          : 'bg-[#002633] border-[#003B4F] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 mb-1 text-amber-400" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('parent')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedRole === 'parent'
                          ? 'bg-[#003B4F] border-[#36C7F4] text-[#8DDFFF]'
                          : 'bg-[#002633] border-[#003B4F] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Users className="w-4 h-4 mb-1 text-emerald-400" />
                      <span>Parent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('instructor')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedRole === 'instructor'
                          ? 'bg-[#003B4F] border-[#36C7F4] text-[#8DDFFF]'
                          : 'bg-[#002633] border-[#003B4F] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mb-1 text-purple-400" />
                      <span>Instructor</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Leo Wright"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#001720] border border-[#003B4F] focus:border-[#36C7F4] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#001720] border border-[#003B4F] focus:border-[#36C7F4] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#001720] border border-[#003B4F] focus:border-[#36C7F4] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password field (not needed for forgot password) */}
            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-300">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-[#36C7F4] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#001720] border border-[#003B4F] focus:border-[#36C7F4] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] hover:from-[#0095bd] hover:to-[#22b7e6] text-[#00212D] font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tab === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : tab === 'register' ? (
                <>
                  <span>Join Lernal LMS</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <Mail className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Footer */}
          <div className="mt-6 pt-5 border-t border-[#003B4F]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                1-Click Reviewer Personas
              </span>
              <span className="text-[10px] text-[#36C7F4]">Fast Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginDemo('admin')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#001A24] hover:bg-[#002B3B] border border-[#003B4F] text-[11px] text-gray-300 hover:text-white transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span className="truncate">Admin (Director)</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('student')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#001A24] hover:bg-[#002B3B] border border-[#003B4F] text-[11px] text-gray-300 hover:text-white transition-colors text-left"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Student (Leo)</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('parent')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#001A24] hover:bg-[#002B3B] border border-[#003B4F] text-[11px] text-gray-300 hover:text-white transition-colors text-left"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">Parent (Eleanor)</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('instructor')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#001A24] hover:bg-[#002B3B] border border-[#003B4F] text-[11px] text-gray-300 hover:text-white transition-colors text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">Instructor (Marcus)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
