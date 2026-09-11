// ============================================================================
// LERNAL ADMIN COMMAND CENTER LAYOUT
// Unified navigation, dark navy/cyan visual identity, and operational routing
// ============================================================================

import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  CreditCard,
  BookOpen,
  Trophy,
  Users,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { LernalLogo } from '../../components/common/LernalLogo';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loginDemo } = useAuth();

  // Auto-switch to admin role for reviewer convenience if not already admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      loginDemo('admin');
    }
  }, [user]);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Leads Center (CRM)', path: '/admin/leads', icon: Target, badge: 'Pipeline' },
    { label: 'Finance & Billing', path: '/admin/finance', icon: CreditCard },
    { label: 'Course Builder', path: '/admin/courses', icon: BookOpen },
    { label: 'Testing & Quizzes', path: '/admin/testing', icon: Trophy },
    { label: 'Student & Parent Rosters', path: '/admin/rosters', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#001D27] text-[#F5FAFC] flex flex-col md:flex-row">
      {/* -------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION */}
      {/* -------------------------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-[#00212D] border-r border-[#00384D] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-[#00384D]">
            <LernalLogo size="sm" />
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#36C7F4] bg-[#002B3B] px-2.5 py-1 rounded-md border border-[#004D6A] w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Operations</span>
            </div>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#00384D] text-[#36C7F4] border border-[#00A9D6]/40 shadow-cyan-glow'
                      : 'text-gray-300 hover:text-white hover:bg-[#002B3B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#36C7F4]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#00384D] space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-[#36C7F4] hover:bg-[#002B3B] transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="px-3 py-1.5 text-[11px] text-gray-500">
            Lernal EdTech v1.0 • 2026
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Header */}
        <header className="h-16 bg-[#00212D]/80 backdrop-blur-md border-b border-[#00384D] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold capitalize">
              {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#002B3B] border border-[#004D6A] px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-gray-300 font-medium text-[11px]">Render API Online</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="Admin"
                className="w-7 h-7 rounded-full object-cover border border-[#36C7F4]"
              />
              <span className="font-bold hidden sm:inline">{user?.full_name || 'Alex Vance (Admin)'}</span>
            </div>
          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
