// ============================================================================
// LERNAL PARENT MONITORING DASHBOARD
// Multi-child progress tracking, test scores, invoices, and advisor messaging
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Trophy,
  CreditCard,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  FileText,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LeadCaptureModal } from '../../components/common/LeadCaptureModal';

export const ParentDashboardPage: React.FC = () => {
  const { user, loginDemo } = useAuth();
  const [data, setData] = useState<any>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'parent') {
      loginDemo('parent').then(() => fetchParentData());
    } else {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getParentDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load parent dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Loading parent portal...</p>
      </div>
    );
  }

  const { parent, summary, children, transactions } = data;
  const activeChild = children[selectedChildIndex] || children[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome Header */}
      <div className="bg-[#002837] border border-[#004D6A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#36C7F4] uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Parent Supervision & Clarity Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Hello, {parent.name} 👋
          </h1>
          <p className="text-xs text-gray-300">
            Monitoring learning progress and billing receipts for {children.length} registered learner(s).
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4">
          <div className="bg-[#00212D] border border-[#004D6A] rounded-2xl p-4 text-center min-w-[100px]">
            <div className="text-xl font-bold text-white">{summary.total_children}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Children</div>
          </div>
          <div className="bg-[#00212D] border border-[#004D6A] rounded-2xl p-4 text-center min-w-[100px]">
            <div className="text-xl font-bold text-[#36C7F4]">{summary.total_enrolled_courses}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Courses</div>
          </div>
          <div className="bg-[#00212D] border border-[#004D6A] rounded-2xl p-4 text-center min-w-[100px]">
            <div className="text-xl font-bold text-emerald-400">${summary.total_spent}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">Total Tuition</div>
          </div>
        </div>
      </div>

      {/* Children Selector Tabs */}
      {children.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#00384D] pb-3 overflow-x-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
              Select Child:
            </span>
            {children.map((child: any, idx: number) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedChildIndex === idx
                    ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
                    : 'bg-[#002B3B] text-gray-300 border border-[#004D6A] hover:bg-[#00384D]'
                }`}
              >
                <img
                  src={child.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={child.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{child.name}</span>
                <span className="text-[10px] opacity-80">({child.grade_level})</span>
              </button>
            ))}
          </div>

          {/* Active Child Overview Card */}
          {activeChild && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Enrolled Courses & Progress (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-6 shadow-card-soft">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#36C7F4]" />
                      <span>{activeChild.name}'s Enrolled Programs</span>
                    </h3>
                    <span className="text-xs text-[#36C7F4] font-bold">
                      {activeChild.enrolled_courses.length} Active Courses
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activeChild.enrolled_courses.map((course: any) => (
                      <div
                        key={course.course_id}
                        className="bg-[#00212D] border border-[#00384D] rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={course.course_thumbnail}
                              alt={course.course_title}
                              className="w-16 h-12 rounded-xl object-cover border border-[#004D6A]"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-white leading-tight">
                                {course.course_title}
                              </h4>
                              <div className="text-[11px] text-gray-400 mt-1">
                                Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            {course.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Curriculum Progress</span>
                            <span className="font-bold text-[#36C7F4]">
                              {course.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-[#002B3B] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] h-full rounded-full"
                              style={{ width: `${course.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test & Assessment History */}
                <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Quiz & Assessment Results</span>
                  </h3>

                  {activeChild.test_results.length === 0 ? (
                    <p className="text-xs text-gray-400">No test attempts recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {activeChild.test_results.map((tr: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#00212D] border border-[#00384D] text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-white">{tr.test_title}</div>
                            <div className="text-[11px] text-gray-400">
                              Completed: {new Date(tr.completed_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-base font-extrabold text-[#36C7F4]">
                              {tr.percentage}%
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tr.passed
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {tr.passed ? 'PASSED' : 'RETRY'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Invoices & Advisor Support (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Tuition Invoices Card */}
                <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
                  <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#36C7F4]" />
                    <span>Invoices & Tuition Receipts</span>
                  </h3>

                  <div className="space-y-3">
                    {transactions.map((t: any) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-[#00212D] border border-[#00384D] text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-white">{t.reference_no}</span>
                          <span className="text-emerald-400">${t.amount} {t.currency}</span>
                        </div>
                        <div className="text-[11px] text-gray-300 truncate">{t.course_title}</div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#00384D]">
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                          <span className="uppercase font-bold text-[#36C7F4]">{t.payment_status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Advisor CTA Card */}
                <div className="bg-gradient-to-br from-[#002837] to-[#00384D] border border-[#00A9D6]/40 rounded-3xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A9D6]/20 text-[#36C7F4] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-display">
                    Have Questions About {activeChild.name}'s Progress?
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Schedule a 15-minute consultation with our Head of Student Success to discuss advanced tracks.
                  </p>
                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full py-2.5 bg-[#00A9D6] hover:bg-[#36C7F4] text-white font-bold rounded-xl text-xs transition-all shadow-cyan-glow"
                  >
                    Request Mentor Consultation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lead Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
    </div>
  );
};
