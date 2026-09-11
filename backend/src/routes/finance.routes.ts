// ============================================================================
// FINANCE MODULE ROUTES
// Revenue analytics, transaction ledger, status distribution, and refunds
// ============================================================================

import { Router, Response } from 'express';
import { db, Transaction } from '../data/mockDatabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/finance/dashboard - High level financial KPIs & chart data
router.get('/dashboard', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const transactions = db.transactions;

  const totalRevenue = transactions
    .filter((t) => t.payment_status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingPayments = transactions
    .filter((t) => t.payment_status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const refundedAmount = transactions
    .filter((t) => t.payment_status === 'refunded')
    .reduce((acc, t) => acc + (t.refund_amount || t.amount), 0);

  const completedCount = transactions.filter((t) => t.payment_status === 'paid').length;
  const pendingCount = transactions.filter((t) => t.payment_status === 'pending').length;
  const refundedCount = transactions.filter((t) => t.payment_status === 'refunded').length;

  // Revenue by Course breakdown
  const revenueByCourse: Record<string, { course_title: string; total: number; count: number }> = {};
  for (const t of transactions) {
    if (t.payment_status === 'paid') {
      const course = db.courses.find((c) => c.id === t.course_id);
      const title = course ? course.title : 'General Course';
      if (!revenueByCourse[t.course_id]) {
        revenueByCourse[t.course_id] = { course_title: title, total: 0, count: 0 };
      }
      revenueByCourse[t.course_id].total += t.amount;
      revenueByCourse[t.course_id].count += 1;
    }
  }

  // Monthly Revenue projection (Jan 2026 - Mar 2026)
  const monthlyRevenue = [
    { month: 'Jan 2026', revenue: 1240, transactions: 8 },
    { month: 'Feb 2026', revenue: 3820, transactions: 24 },
    { month: 'Mar 2026', revenue: 4950, transactions: 31 },
  ];

  // Payment status distribution
  const statusDistribution = [
    { status: 'Paid', count: completedCount, color: '#10B981' },
    { status: 'Pending', count: pendingCount, color: '#F59E0B' },
    { status: 'Refunded', count: refundedCount, color: '#EF4444' },
  ];

  res.json({
    success: true,
    kpis: {
      total_revenue: totalRevenue,
      pending_payments: pendingPayments,
      refunded_amount: refundedAmount,
      total_transactions: transactions.length,
      completed_count: completedCount,
    },
    revenue_by_course: Object.values(revenueByCourse),
    monthly_revenue: monthlyRevenue,
    status_distribution: statusDistribution,
  });
});

// GET /api/finance/transactions - Detailed filterable transaction ledger
router.get('/transactions', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, course_id, search, sort = 'desc' } = req.query;

  let list = [...db.transactions];

  if (status && status !== 'all') {
    list = list.filter((t) => t.payment_status === status);
  }

  if (course_id) {
    list = list.filter((t) => t.course_id === course_id);
  }

  const enriched = list.map((t) => {
    const course = db.courses.find((c) => c.id === t.course_id);
    const student = t.student_id ? db.students.find((s) => s.id === t.student_id) : null;
    const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : null;
    const parent = t.parent_id ? db.parents.find((p) => p.id === t.parent_id) : null;
    const parentProfile = parent ? db.profiles.find((p) => p.id === parent.profile_id) : null;

    return {
      ...t,
      course_title: course ? course.title : 'Unknown Course',
      student_name: studentProfile ? studentProfile.full_name : 'Guest Learner',
      parent_name: parentProfile ? parentProfile.full_name : 'Direct Enrollment',
      parent_email: parentProfile ? parentProfile.email : '',
    };
  });

  if (search) {
    const q = (search as string).toLowerCase();
    const filtered = enriched.filter(
      (item) =>
        item.reference_no.toLowerCase().includes(q) ||
        item.course_title.toLowerCase().includes(q) ||
        item.student_name.toLowerCase().includes(q) ||
        item.parent_name.toLowerCase().includes(q)
    );
    return res.json({ success: true, count: filtered.length, transactions: filtered });
  }

  res.json({ success: true, count: enriched.length, transactions: enriched });
});

// POST /api/finance/transactions/:id/refund - Process refund
router.post('/transactions/:id/refund', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason, amount } = req.body;

  const txn = db.transactions.find((t) => t.id === id || t.reference_no === id);
  if (!txn) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (txn.payment_status === 'refunded') {
    return res.status(400).json({ error: 'Transaction has already been refunded' });
  }

  const refundAmt = amount ? Number(amount) : txn.amount;
  txn.payment_status = 'refunded';
  txn.refund_amount = refundAmt;
  txn.refund_reason = reason || 'Admin requested refund';
  txn.notes = `Refund processed on ${new Date().toISOString().split('T')[0]} by ${req.user!.full_name}`;

  res.json({
    success: true,
    message: `Refund of $${refundAmt.toFixed(2)} processed successfully for ${txn.reference_no}.`,
    transaction: txn,
  });
});

export default router;
