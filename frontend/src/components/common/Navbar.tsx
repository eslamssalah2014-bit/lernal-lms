// ============================================================================
// LERNAL TOP NAVIGATION BAR
// Responsive, kid-friendly, with 1-click role switcher for instant evaluation
// ============================================================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  User,
  ShieldCheck,
  GraduationCap,
  Users,
  Menu,
  X,
  ChevronDown,
  LogOut,
  HelpCircle,
  Compass,
  Video,
} from 'lucide-react';
import { LernalLogo } from './LernalLogo';
import { useAuth } from '../../context/AuthContext';
import { LeadCaptureModal } from './LeadCaptureModal';

export const Navbar: React.FC = () => {
  const { user, role, loginDemo, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (targetRole: string) => {
    setIsRoleDropdownOpen(false);
    if (targetRole === 'guest') {
      logout();
    } else {
      await loginDemo(targetRole);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#00212D]/90 backdrop-blur-md border-b border-[#003B4F]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <LernalLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-[#36C7F4] bg-[#002D3D]'
                  : 'text-gray-300 hover:text-white hover:bg-[#002D3D]/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/courses"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/courses')
                  ? 'text-[#36C7F4] bg-[#002D3D]'
                  : 'text-gray-300 hover:text-white hover:bg-[#002D3D]/50'
              }`}
            >
              <Compass className="w-4 h-4 text-[#00A9D6]" />
              <span>All Courses</span>
            </Link>

            <Link
              to="/recorded"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/recorded')
                  ? 'text-[#36C7F4] bg-[#002D3D]'
                  : 'text-gray-300 hover:text-white hover:bg-[#002D3D]/50'
              }`}
            >
              <Video className="w-4 h-4 text-[#36C7F4]" />
              <span>Recorded Tracks</span>
            </Link>

            {/* Role-Specific Portal Links */}
            {role === 'student' && (
              <Link
                to="/student/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#8DDFFF] bg-[#003B4F] border border-[#00A9D6]/40 hover:bg-[#004D6A] transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-[#36C7F4]" />
                <span>My Learning Hub</span>
              </Link>
            )}

            {role === 'parent' && (
              <Link
                to="/parent/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#8DDFFF] bg-[#003B4F] border border-[#00A9D6]/40 hover:bg-[#004D6A] transition-colors"
              >
                <Users className="w-4 h-4 text-[#36C7F4]" />
                <span>Parent Portal</span>
              </Link>
            )}

            {role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#36C7F4] bg-[#003B4F] border border-[#36C7F4]/50 shadow-cyan-glow hover:bg-[#004D6A] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Command</span>
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Ask an Advisor Button */}
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#36C7F4] hover:text-white bg-[#002B3B] hover:bg-[#003B4F] border border-[#004D6A] rounded-xl transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask Advisor</span>
            </button>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#002D3D] hover:bg-[#003B4F] border border-[#004D6A] rounded-2xl text-xs font-semibold text-gray-200 transition-all"
                title="Switch demo persona for testing"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00A9D6] to-[#8DDFFF] text-[#00212D] flex items-center justify-center font-bold text-xs">
                  {role === 'admin' ? 'A' : role === 'student' ? 'S' : role === 'parent' ? 'P' : 'G'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-[10px] uppercase tracking-wider text-[#36C7F4] font-bold">
                    Demo Role
                  </div>
                  <div className="leading-tight capitalize">{user ? user.full_name.split(' ')[0] : 'Guest'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Role Switcher Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#002B3B] border border-[#004D6A] rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-[#003B4F] mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#36C7F4]">
                      Fast Role Switcher
                    </span>
                    <p className="text-[11px] text-gray-400">Click any persona to test the platform:</p>
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      role === 'admin' ? 'bg-[#003B4F] text-[#36C7F4] font-bold' : 'text-gray-300 hover:bg-[#00212D]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#36C7F4]" />
                    <div>
                      <div>Alex Vance (Admin)</div>
                      <div className="text-[10px] text-gray-400">CRM, Finance, Courses</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      role === 'student' ? 'bg-[#003B4F] text-[#36C7F4] font-bold' : 'text-gray-300 hover:bg-[#00212D]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <div>
                      <div>Leo Wright (Student - Age 10)</div>
                      <div className="text-[10px] text-gray-400">Video player, Tests, XP</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('parent')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      role === 'parent' ? 'bg-[#003B4F] text-[#36C7F4] font-bold' : 'text-gray-300 hover:bg-[#00212D]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div>Eleanor Wright (Parent)</div>
                      <div className="text-[10px] text-gray-400">Child Progress & Billing</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('instructor')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      role === 'instructor' ? 'bg-[#003B4F] text-[#36C7F4] font-bold' : 'text-gray-300 hover:bg-[#00212D]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <div>Dr. Marcus (Instructor)</div>
                      <div className="text-[10px] text-gray-400">Curriculum & Cohorts</div>
                    </div>
                  </button>

                  <div className="border-t border-[#003B4F] mt-1 pt-1">
                    <button
                      onClick={() => handleRoleSwitch('guest')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-rose-300 hover:bg-[#00212D] rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out (Public Guest View)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-xl hover:bg-[#002D3D]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#00212D] border-b border-[#003B4F] px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:bg-[#002D3D]"
            >
              Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:bg-[#002D3D]"
            >
              All Courses
            </Link>
            <Link
              to="/recorded"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:bg-[#002D3D]"
            >
              Recorded Tracks
            </Link>

            {role === 'student' && (
              <Link
                to="/student/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#36C7F4] bg-[#003B4F]"
              >
                My Learning Hub
              </Link>
            )}

            {role === 'parent' && (
              <Link
                to="/parent/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#36C7F4] bg-[#003B4F]"
              >
                Parent Portal
              </Link>
            )}

            {role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#36C7F4] bg-[#003B4F]"
              >
                Admin Command Center
              </Link>
            )}

            <div className="pt-3 border-t border-[#003B4F]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLeadModalOpen(true);
                }}
                className="w-full py-3 bg-[#00A9D6] text-white font-bold rounded-xl text-sm shadow-cyan-glow"
              >
                Ask Educational Advisor
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
    </>
  );
};
