// ============================================================================
// RESET PASSWORD PAGE (SUPABASE AUTH)
// Handles inbound recovery tokens and allows users to set a new password
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LernalLogo } from '../../components/common/LernalLogo';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
        openAuthModal('login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Your recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#00212D] border border-[#004D6A] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-6">
          <LernalLogo size="md" />
          <h1 className="text-xl font-bold text-white mt-4">Create New Password</h1>
          <p className="text-xs text-gray-400 mt-1">
            Choose a strong, secure password for your Lernal LMS account.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs text-rose-200 bg-rose-950/50 border border-rose-800/60 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center bg-emerald-950/40 border border-emerald-800/60 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h2 className="text-sm font-bold text-white mb-1">Password Updated!</h2>
            <p className="text-xs text-emerald-200">
              Your password has been successfully saved. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                New Password
              </label>
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

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#001720] border border-[#003B4F] focus:border-[#36C7F4] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] text-[#00212D] font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
