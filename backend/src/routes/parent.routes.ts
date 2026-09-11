// ============================================================================
// PARENT PORTAL ROUTES
// Multi-child monitoring, module progress reports, test scores & invoice billing
// ============================================================================

import { Router, Response } from 'express';
import { db } from '../data/mockDatabase.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/parent/dashboard
router.get('/dashboard', authenticate, (req: AuthenticatedRequest, res: Response) => {
  // Find or fallback parent
  let parent = db.parents.find((p) => p.profile_id === req.user!.id);
  if (!parent) {
    parent = db.parents[0];
  }

  // Children belonging strictly to this parent
  const children = db.students.filter((s) => s.parent_id === parent!.id);

  const childrenData = children.map((child) => {
    const profile = db.profiles.find((p) => p.id === child.profile_id);
    const enrollments = db.enrollments.filter((e) => e.student_id === child.id);

    const enrolledCourses = enrollments.map((e) => {
      const course = db.courses.find((c) => c.id === e.course_id);
      return {
        course_id: e.course_id,
        course_title: course ? course.title : 'Course',
        course_thumbnail: course ? course.thumbnail_url : '',
        progress_percentage: e.progress_percentage,
        status: e.status,
        enrolled_at: e.enrolled_at,
        last_accessed_at: e.last_accessed_at,
      };
    });

    const attempts = db.testAttempts.filter((a) => a.student_id === child.id);
    const testResults = attempts.map((a) => {
      const test = db.tests.find((t) => t.id === a.test_id);
      return {
        test_id: a.test_id,
        test_title: test ? test.title : 'Assessment',
        score: a.score,
        max_score: a.max_score,
        percentage: a.percentage,
        passed: a.passed,
        completed_at: a.completed_at,
      };
    });

    return {
      id: child.id,
      name: profile ? profile.full_name : 'Child',
      avatar_url: profile ? profile.avatar_url : '',
      grade_level: child.grade_level,
      school_name: child.school_name,
      xp_points: child.xp_points,
      badges_count: child.badges_count,
      enrolled_courses: enrolledCourses,
      test_results: testResults,
    };
  });

  // Parent's invoices & transactions
  const transactions = db.transactions
    .filter((t) => t.parent_id === parent!.id)
    .map((t) => {
      const course = db.courses.find((c) => c.id === t.course_id);
      return {
        ...t,
        course_title: course ? course.title : 'Course Enrollment',
      };
    });

  const totalSpent = transactions
    .filter((t) => t.payment_status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  res.json({
    success: true,
    parent: {
      id: parent.id,
      name: req.user!.full_name,
      email: req.user!.email,
      emergency_contact: parent.emergency_contact,
      billing_address: parent.billing_address,
    },
    summary: {
      total_children: children.length,
      total_enrolled_courses: childrenData.reduce((acc, c) => acc + c.enrolled_courses.length, 0),
      total_spent: totalSpent,
    },
    children: childrenData,
    transactions,
  });
});

export default router;
