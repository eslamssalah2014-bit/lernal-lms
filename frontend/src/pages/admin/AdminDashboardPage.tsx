// ============================================================================
// LERNAL ADMIN DASHBOARD (OPERATIONAL OVERVIEW)
// Executive KPI cards, recent CRM leads, revenue audit, and recent enrollments
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Target,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminDashboard().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Aggregating Lernal operations metrics...</p>
      </div>
    );
  }

  const { metrics, recent_leads, recent_transactions, recent_enrollments } = data;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Operations Overview
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Real-time metrics across Lernal's student body, leads pipeline, and financial ledger.
        </p>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. EXECUTIVE KPI METRICS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">${metrics.total_revenue}</div>
          <div className="text-[11px] text-emerald-400 font-medium">All completed transactions</div>
        </div>

        {/* Total Students */}
        <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Active Learners</span>
            <Users className="w-4 h-4 text-[#36C7F4]" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.total_students}</div>
          <div className="text-[11px] text-[#8DDFFF] font-medium">{metrics.active_students} course enrollments</div>
        </div>

        {/* Total Courses */}
        <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Published Programs</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.total_courses}</div>
          <div className="text-[11px] text-gray-400">
            {metrics.recorded_courses} Recorded • {metrics.live_courses} Live
          </div>
        </div>

        {/* Leads & Conversion Rate */}
        <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>CRM Pipeline</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{metrics.total_leads}</span>
            <span className="text-xs text-[#36C7F4] font-bold">({metrics.conversion_rate}% Conv.)</span>
          </div>
          <div className="text-[11px] text-rose-300 font-medium">{metrics.new_leads} awaiting contact</div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. RECENT CRM LEADS & RECENT TRANSACTIONS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Inquiries (7 cols) */}
        <div className="lg:col-span-7 bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              <span>Recent Inquiries & Prospects</span>
            </h3>
            <Link to="/admin/leads" className="text-xs font-bold text-[#36C7F4] hover:underline flex items-center gap-1">
              <span>Leads CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_leads.map((l: any) => (
              <div
                key={l.id}
                className="p-3.5 rounded-2xl bg-[#00212D] border border-[#00384D] flex items-center justify-between text-xs hover:border-[#00A9D6]/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{l.parent_name}</span>
                    <span className="text-[10px] text-gray-400 font-normal">for {l.child_name}</span>
                  </div>
                  <div className="text-[11px] text-[#36C7F4] truncate max-w-xs">{l.course_title}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      l.status === 'new'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : l.status === 'converted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {l.status}
                  </span>
                  <Link
                    to="/admin/leads"
                    className="p-1 rounded-lg bg-[#00384D] text-gray-300 hover:text-white"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions (5 cols) */}
        <div className="lg:col-span-5 bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Recent Transactions</span>
            </h3>
            <Link to="/admin/finance" className="text-xs font-bold text-[#36C7F4] hover:underline flex items-center gap-1">
              <span>Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_transactions.map((t: any) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-[#00212D] border border-[#00384D] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{t.reference_no}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{t.course_title}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-400">${t.amount}</div>
                  <div className="text-[10px] text-[#36C7F4] uppercase font-semibold">{t.payment_status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. RECENT COURSE ENROLLMENTS */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
        <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#36C7F4]" />
          <span>Recent Student Enrollments</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recent_enrollments.map((e: any) => (
            <div key={e.id} className="p-3.5 rounded-2xl bg-[#00212D] border border-[#00384D] space-y-2 text-xs">
              <div className="font-bold text-white truncate">{e.student_name}</div>
              <div className="text-[11px] text-[#36C7F4] truncate">{e.course_title}</div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#00384D]">
                <span>Progress: {e.progress_percentage}%</span>
                <span className="text-emerald-400 font-bold uppercase">{e.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
