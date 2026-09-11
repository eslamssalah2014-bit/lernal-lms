// ============================================================================
// ADMIN COMMAND CENTER & OVERVIEW ROUTES
// High-level KPIs, activity feeds, rosters, and operational control
// ============================================================================

import { Router, Response } from 'express';
import { db } from '../data/mockDatabase.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/dashboard - Complete operational overview
router.get('/dashboard', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const totalStudents = db.students.length;
  const activeEnrollments = db.enrollments.filter((e) => e.status === 'active');
  const totalCourses = db.courses.length;
  const recordedCourses = db.courses.filter((c) => c.course_type === 'recorded').length;
  const liveCourses = db.courses.filter((c) => c.course_type === 'live').length;
  const totalLeads = db.leads.length;
  const newLeads = db.leads.filter((l) => l.status === 'new').length;
  const convertedLeads = db.leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

  const totalRevenue = db.transactions
    .filter((t) => t.payment_status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  // Recent 5 leads
  const recentLeads = db.leads.slice(0, 5).map((l) => {
    const course = l.course_id ? db.courses.find((c) => c.id === l.course_id) : null;
    return {
      ...l,
      course_title: course ? course.title : 'General Platform',
    };
  });

  // Recent 5 transactions
  const recentTransactions = db.transactions.slice(0, 5).map((t) => {
    const course = db.courses.find((c) => c.id === t.course_id);
    const parent = t.parent_id ? db.parents.find((p) => p.id === t.parent_id) : null;
    const parentProfile = parent ? db.profiles.find((p) => p.id === parent.profile_id) : null;
    return {
      ...t,
      course_title: course ? course.title : 'Course Enrollment',
      parent_name: parentProfile ? parentProfile.full_name : 'Direct Enrollment',
    };
  });

  // Recent 5 enrollments
  const recentEnrollments = db.enrollments.slice(0, 5).map((e) => {
    const course = db.courses.find((c) => c.id === e.course_id);
    const student = db.students.find((s) => s.id === e.student_id);
    const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : null;
    return {
      ...e,
      course_title: course ? course.title : 'Course',
      student_name: studentProfile ? studentProfile.full_name : 'Student',
    };
  });

  res.json({
    success: true,
    metrics: {
      total_students: totalStudents,
      active_students: activeEnrollments.length,
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
});

// GET /api/admin/rosters - Complete lists of Students, Parents, Instructors
router.get('/rosters', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const students = db.students.map((s) => {
    const profile = db.profiles.find((p) => p.id === s.profile_id);
    const enrollments = db.enrollments.filter((e) => e.student_id === s.id);
    return {
      id: s.id,
      name: profile ? profile.full_name : 'Student',
      email: profile ? profile.email : '',
      grade_level: s.grade_level,
      school_name: s.school_name,
      xp_points: s.xp_points,
      badges_count: s.badges_count,
      enrolled_courses_count: enrollments.length,
    };
  });

  const parents = db.parents.map((par) => {
    const profile = db.profiles.find((p) => p.id === par.profile_id);
    const children = db.students.filter((s) => s.parent_id === par.id);
    return {
      id: par.id,
      name: profile ? profile.full_name : 'Parent',
      email: profile ? profile.email : '',
      phone: profile ? profile.phone : '',
      emergency_contact: par.emergency_contact,
      children_count: children.length,
    };
  });

  const instructors = db.instructors.map((ins) => {
    const profile = db.profiles.find((p) => p.id === ins.profile_id);
    return {
      id: ins.id,
      name: profile ? profile.full_name : 'Instructor',
      email: profile ? profile.email : '',
      title: ins.title,
      rating: ins.rating,
      specialties: ins.specialties,
      total_students: ins.total_students,
    };
  });

  res.json({
    success: true,
    students,
    parents,
    instructors,
  });
});

export default router;
