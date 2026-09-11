// ============================================================================
// FINANCE MODULE ROUTES - SUPABASE INTEGRATED
// Financial analytics, transaction ledger, revenue breakdown & refunds
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { Transaction } from '../types/database.js';

const router = Router();

// GET /api/finance/dashboard - High level financial KPIs & chart data
router.get('/dashboard', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        course:courses(id, title)
      `);

    if (error) throw error;

    const list = (transactions || []) as any[];

    const totalRevenue = list
      .filter((t) => t.payment_status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const pendingPayments = list
      .filter((t) => t.payment_status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const refundedAmount = list
      .filter((t) => t.payment_status === 'refunded')
      .reduce((acc, t) => acc + Number(t.refund_amount || t.amount || 0), 0);

    const completedCount = list.filter((t) => t.payment_status === 'paid').length;
    const pendingCount = list.filter((t) => t.payment_status === 'pending').length;
    const refundedCount = list.filter((t) => t.payment_status === 'refunded').length;

    // Revenue by Course breakdown
    const revenueByCourseMap: Record<string, { course_title: string; total: number; count: number }> = {};
    for (const t of list) {
      if (t.payment_status === 'paid') {
        const title = t.course?.title || 'General Course';
        if (!revenueByCourseMap[t.course_id]) {
          revenueByCourseMap[t.course_id] = { course_title: title, total: 0, count: 0 };
        }
        revenueByCourseMap[t.course_id].total += Number(t.amount || 0);
        revenueByCourseMap[t.course_id].count += 1;
      }
    }

    const revenueByCourse = Object.values(revenueByCourseMap).sort((a, b) => b.total - a.total);

    // Monthly projection breakdown
    const monthlyRevenue = [
      { month: 'Jan 2026', revenue: Math.round(totalRevenue * 0.25), transactions: Math.round(completedCount * 0.25) },
      { month: 'Feb 2026', revenue: Math.round(totalRevenue * 0.35), transactions: Math.round(completedCount * 0.35) },
      { month: 'Mar 2026', revenue: Math.round(totalRevenue * 0.40), transactions: Math.round(completedCount * 0.40) },
    ];

    const statusDistribution = [
      { status: 'Paid', count: completedCount, color: '#10B981' },
      { status: 'Pending', count: pendingCount, color: '#F59E0B' },
      { status: 'Refunded', count: refundedCount, color: '#EF4444' },
    ];

    res.json({
      success: true,
      metrics: {
        total_revenue: totalRevenue,
        pending_payments: pendingPayments,
        refunded_amount: refundedAmount,
        completed_transactions_count: completedCount,
        pending_transactions_count: pendingCount,
        refunded_transactions_count: refundedCount,
      },
      charts: {
        revenue_by_course: revenueByCourse,
        monthly_trend: monthlyRevenue,
        status_distribution: statusDistribution,
      },
    });
  } catch (err: any) {
    console.error('Error fetching finance dashboard from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch financial KPIs' });
  }
});

// GET /api/finance/transactions - Searchable transaction history
router.get('/transactions', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;

  try {
    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        course:courses(id, title),
        parent:parents(id, profile:profiles(full_name, email)),
        student:students(id, profile:profiles(full_name, email))
      `);

    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }

    if (search) {
      const term = `%${(search as string).trim()}%`;
      query = query.or(`reference_no.ilike.${term},notes.ilike.${term}`);
    }

    const { data: transactions, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = (transactions || []).map((t: any) => ({
      ...t,
      course_title: t.course?.title || 'Course Enrollment',
      parent_name: t.parent?.profile?.full_name || 'Direct Enrollment',
      parent_email: t.parent?.profile?.email || '',
      student_name: t.student?.profile?.full_name || 'Student',
    }));

    res.json({ success: true, count: formatted.length, transactions: formatted });
  } catch (err: any) {
    console.error('Error fetching transactions from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
  }
});

// POST /api/finance/transactions/:id/refund - Process refund
router.post('/transactions/:id/refund', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const { data: txn, error: fetchErr } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (txn.payment_status === 'refunded') {
      return res.status(400).json({ error: 'This transaction has already been refunded' });
    }

    const { data: updatedTxn, error: updateErr } = await supabaseAdmin
      .from('transactions')
      .update({
        payment_status: 'refunded',
        refund_amount: txn.amount,
        refund_reason: reason || 'Processed by Administrator via Finance Hub',
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: `Transaction ${txn.reference_no} refunded successfully ($${txn.amount}).`,
      transaction: updatedTxn,
    });
  } catch (err: any) {
    console.error('Error issuing refund in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to process refund' });
  }
});

export default router;
