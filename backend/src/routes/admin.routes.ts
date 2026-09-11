// ============================================================================
// ADMIN COMMAND CENTER & OVERVIEW ROUTES - SUPABASE INTEGRATED
// High-level operational metrics, activity feeds, and user rosters
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/dashboard - Operational overview metrics & activity feeds
router.get('/dashboard', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      studentsRes,
      enrollmentsRes,
      coursesRes,
      leadsRes,
      transactionsRes,
    ] = await Promise.all([
      supabaseAdmin.from('students').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('enrollments').select('*, course:courses(title), student:students(profile:profiles(full_name))').order('enrolled_at', { ascending: false }).limit(5),
      supabaseAdmin.from('courses').select('id, course_type'),
      supabaseAdmin.from('leads').select('*, course:courses(title)').order('created_at', { ascending: false }),
      supabaseAdmin.from('transactions').select('*, course:courses(title), parent:parents(profile:profiles(full_name))').order('created_at', { ascending: false }),
    ]);

    const totalStudents = studentsRes.count || 0;
    const courses = coursesRes.data || [];
    const totalCourses = courses.length;
    const recordedCourses = courses.filter((c) => c.course_type === 'recorded').length;
    const liveCourses = courses.filter((c) => c.course_type === 'live').length;

    const leads = leadsRes.data || [];
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    const transactions = transactionsRes.data || [];
    const totalRevenue = transactions
      .filter((t) => t.payment_status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const activeEnrollmentsCount = enrollmentsRes.data?.filter((e) => e.status === 'active').length || 0;

    // Recent 5 leads
    const recentLeads = leads.slice(0, 5).map((l: any) => ({
      ...l,
      course_title: l.course?.title || 'General Platform',
    }));

    // Recent 5 transactions
    const recentTransactions = transactions.slice(0, 5).map((t: any) => ({
      ...t,
      course_title: t.course?.title || 'Course Enrollment',
      parent_name: t.parent?.profile?.full_name || 'Direct Enrollment',
    }));

    // Recent 5 enrollments
    const recentEnrollments = (enrollmentsRes.data || []).map((e: any) => ({
      ...e,
      course_title: e.course?.title || 'Course',
      student_name: e.student?.profile?.full_name || 'Student',
    }));

    res.json({
      success: true,
      metrics: {
        total_students: totalStudents,
        active_students: activeEnrollmentsCount,
        total_courses: totalCourses,
        recorded_courses: recordedCourses,
        live_courses: liveCourses,
        total_leads: totalLeads,
        new_leads: newLeads,
        conversion_rate: conversionRate,
        total_revenue: totalRevenue,
      },
      recent_leads: recentLeads,
      recent_transactions: recentTransactions,
      recent_enrollments: recentEnrollments,
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch admin dashboard' });
  }
});

// GET /api/admin/rosters - Complete lists of Students, Parents, Instructors
router.get('/rosters', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [studentsRes, parentsRes, instructorsRes] = await Promise.all([
      supabaseAdmin
        .from('students')
        .select(`
          *,
          profile:profiles(*),
          parent:parents(id, profile:profiles(full_name, email))
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('parents')
        .select(`
          *,
          profile:profiles(*),
          children:students(id, grade_level, profile:profiles(full_name))
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('instructors')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false }),
    ]);

    res.json({
      success: true,
      students: studentsRes.data || [],
      parents: parentsRes.data || [],
      instructors: instructorsRes.data || [],
    });
  } catch (err: any) {
    console.error('Error fetching rosters from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch rosters' });
  }
});

export default router;
