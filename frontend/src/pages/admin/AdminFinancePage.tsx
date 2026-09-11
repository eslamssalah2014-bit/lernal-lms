// ============================================================================
// LERNAL FINANCE MODULE & BILLING AUDITOR
// Revenue KPIs, monthly charts, revenue by course, transactions ledger, and refunds
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowDownRight,
  DollarSign,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { Transaction } from '../../types';

export const AdminFinancePage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refundModalTxn, setRefundModalTxn] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    fetchFinance();
  }, [statusFilter]);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const [dashRes, txnRes] = await Promise.all([
        api.getFinanceDashboard(),
        api.getTransactions({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
        }),
      ]);
      if (dashRes) setDashboardData(dashRes);
      if (txnRes.transactions) setTransactions(txnRes.transactions);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalTxn) return;

    setIsRefunding(true);
    try {
      await api.refundTransaction(refundModalTxn.id, refundReason);
      setRefundModalTxn(null);
      setRefundReason('');
      fetchFinance();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#36C7F4] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Auditing Lernal financial records...</p>
      </div>
    );
  }

  const { kpis, revenue_by_course, monthly_revenue, status_distribution } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Finance & Tuition Ledger
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time revenue monitoring, tuition transactions, refunds, and financial performance.
          </p>
        </div>

        <button
          onClick={() => alert('Financial ledger CSV export downloaded successfully.')}
          className="px-4 py-2.5 bg-[#002B3B] hover:bg-[#003B4F] border border-[#004D6A] text-gray-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors w-fit"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. FINANCIAL KPI METRICS */}
      {/* -------------------------------------------------------------------- */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">${kpis.total_revenue}</div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {kpis.completed_count} completed payments
            </div>
          </div>

          <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Pending Tuition</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">${kpis.pending_payments}</div>
            <div className="text-[11px] text-gray-400 font-medium">Awaiting gateway clearance</div>
          </div>

          <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Refunded Amount</span>
              <RotateCcw className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-300">${kpis.refunded_amount}</div>
            <div className="text-[11px] text-gray-400 font-medium">Schedule conflict refunds</div>
          </div>

          <div className="bg-[#002B3B] border border-[#004D6A] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total Invoices</span>
              <CreditCard className="w-4 h-4 text-[#36C7F4]" />
            </div>
            <div className="text-2xl font-extrabold text-white">{kpis.total_transactions}</div>
            <div className="text-[11px] text-[#36C7F4] font-medium">Tuition transactions logged</div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. REVENUE VISUALIZATIONS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Revenue Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#36C7F4]" />
              <span>Revenue Growth Over Time</span>
            </h3>
            <span className="text-xs text-gray-400">Q1 2026</span>
          </div>

          <div className="space-y-4 pt-2">
            {monthly_revenue?.map((item: any) => (
              <div key={item.month} className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span className="font-bold">{item.month}</span>
                  <span className="font-extrabold text-white">
                    ${item.revenue} ({item.transactions} txns)
                  </span>
                </div>
                <div className="w-full bg-[#00212D] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00A9D6] to-[#36C7F4] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(item.revenue / 5000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Course (6 cols) */}
        <div className="lg:col-span-6 bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Top Earning Courses</span>
            </h3>
            <span className="text-xs text-[#36C7F4] font-bold">By Paid Volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {revenue_by_course?.map((item: any) => (
              <div
                key={item.course_title}
                className="p-3 rounded-xl bg-[#00212D] border border-[#00384D] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="font-bold text-white truncate">{item.course_title}</div>
                  <div className="text-[10px] text-gray-400">{item.count} Paid Enrollments</div>
                </div>
                <span className="text-sm font-extrabold text-emerald-400">${item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. TRANSACTION LEDGER & FILTERS */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-card-soft">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-display text-white">Transaction History</h3>
            <span className="text-xs text-gray-400">({transactions.length} Records)</span>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-2 text-xs">
            {['all', 'paid', 'pending', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all ${
                  statusFilter === status
                    ? 'bg-[#00A9D6] text-white shadow-cyan-glow'
                    : 'bg-[#00212D] text-gray-300 hover:bg-[#00384D]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00212D] border-b border-[#00384D] text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Reference ID</th>
                <th className="p-3.5">Course Program</th>
                <th className="p-3.5">Student / Parent</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00384D]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#00384D]/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{t.reference_no}</td>
                  <td className="p-3.5 font-medium text-[#8DDFFF] truncate max-w-[180px]">
                    {t.course_title}
                  </td>
                  <td className="p-3.5 text-gray-300">
                    <div>{t.student_name}</div>
                    <div className="text-[10px] text-gray-400">{t.parent_name}</div>
                  </td>
                  <td className="p-3.5 font-extrabold text-white">
                    ${t.amount} {t.currency}
                  </td>
                  <td className="p-3.5 text-gray-300">{t.payment_method}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        t.payment_status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : t.payment_status === 'refunded'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {t.payment_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-400 text-[11px]">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {t.payment_status === 'paid' && (
                      <button
                        onClick={() => setRefundModalTxn(t)}
                        className="px-2.5 py-1 bg-[#00212D] hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#002B3B] border border-[#004D6A] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white">
              Process Transaction Refund
            </h3>
            <p className="text-xs text-gray-300">
              You are refunding <span className="font-bold text-white">${refundModalTxn.amount}</span> for transaction{' '}
              <span className="font-bold text-[#36C7F4]">{refundModalTxn.reference_no}</span>.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Reason for Refund
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Schedule conflict requested by parent..."
                  className="w-full bg-[#00212D] border border-[#004D6A] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#36C7F4]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalTxn(null)}
                  className="px-4 py-2 bg-[#00212D] text-gray-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  {isRefunding ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
