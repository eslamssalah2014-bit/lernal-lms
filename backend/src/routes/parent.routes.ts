// ============================================================================
// PARENT PORTAL ROUTES - SUPABASE INTEGRATED
// Multi-child monitoring, module progress reports, test scores & invoice billing
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/parent/dashboard
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Resolve parent entity
    let parent: any = null;
    const { data: parRecord } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('profile_id', req.user!.id)
      .maybeSingle();

    if (parRecord) {
      parent = parRecord;
    } else {
      const { data: defaultPar } = await supabaseAdmin.from('parents').select('*').limit(1).single();
      parent = defaultPar;
    }

    if (!parent) {
      return res.status(404).json({ error: 'Parent record not found' });
    }

    // 2. Fetch children belonging strictly to this parent
    const { data: children, error: childrenErr } = await supabaseAdmin
      .from('students')
      .select(`
        *,
        profile:profiles(full_name, email, avatar_url),
        enrollments:enrollments(
          *,
          course:courses(id, title, thumbnail_url)
        ),
        test_attempts:test_attempts(
          *,
          test:tests(id, title)
        )
      `)
      .eq('parent_id', parent.id);

    if (childrenErr) throw childrenErr;

    const childrenData = (children || []).map((child: any) => {
      const enrolledCourses = (child.enrollments || []).map((e: any) => ({
        course_id: e.course_id,
        course_title: e.course?.title || 'Course',
        course_thumbnail: e.course?.thumbnail_url || '',
        progress_percentage: Number(e.progress_percentage || 0),
        status: e.status,
        enrolled_at: e.enrolled_at,
        last_accessed_at: e.last_accessed_at,
      }));

      const testResults = (child.test_attempts || []).map((a: any) => ({
        test_id: a.test_id,
        test_title: a.test?.title || 'Assessment',
        score: a.score,
        max_score: a.max_score,
        percentage: Number(a.percentage || 0),
        passed: a.passed,
        completed_at: a.completed_at,
      }));

      return {
        id: child.id,
        name: child.profile?.full_name || 'Child',
        avatar_url: child.profile?.avatar_url || '',
        grade_level: child.grade_level,
        school_name: child.school_name,
        xp_points: child.xp_points,
        badges_count: child.badges_count,
        enrolled_courses: enrolledCourses,
        test_results: testResults,
      };
    });

    // 3. Fetch parent's invoices & transactions
    const { data: transactions, error: txnErr } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        course:courses(id, title)
      `)
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false });

    if (txnErr) throw txnErr;

    const formattedTransactions = (transactions || []).map((t: any) => ({
      ...t,
      course_title: t.course?.title || 'Course Enrollment',
    }));

    const totalSpent = formattedTransactions
      .filter((t: any) => t.payment_status === 'paid')
      .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

    res.json({
      success: true,
      parent: {
        id: parent.id,
        name: req.user!.full_name,
        email: req.user!.email,
        phone: req.user!.phone,
        emergency_contact: parent.emergency_contact,
        billing_address: parent.billing_address,
      },
      metrics: {
        children_count: childrenData.length,
        total_spent: totalSpent,
        active_courses: childrenData.reduce((acc: number, c: any) => acc + c.enrolled_courses.length, 0),
      },
      children: childrenData,
      transactions: formattedTransactions,
    });
  } catch (err: any) {
    console.error('Error fetching parent dashboard from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch parent dashboard' });
  }
});

export default router;
