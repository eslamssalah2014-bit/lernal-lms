// ============================================================================
// STUDENT DASHBOARD & LEARNING HUB ROUTES
// Kid-friendly learning tracking, enrollments, XP rewards, and lesson completion
// ============================================================================

import { Router, Response } from 'express';
import { db } from '../data/mockDatabase.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', authenticate, (req: AuthenticatedRequest, res: Response) => {
  // Find or fallback student
  let student = db.students.find((s) => s.profile_id === req.user!.id);
  if (!student) {
    student = db.students[0];
  }

  // Get enrolled courses with progress
  const enrollments = db.enrollments.filter(
    (e) => e.student_id === student!.id && e.status === 'active'
  );

  const myCourses = enrollments.map((e) => {
    const course = db.courses.find((c) => c.id === e.course_id);
    const modules = db.modules.filter((m) => m.course_id === e.course_id);
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedProgress = db.studentProgress.filter(
      (p) => p.student_id === student!.id && p.course_id === e.course_id && p.is_completed
    );

    return {
      enrollment_id: e.id,
      course_id: e.course_id,
      course_title: course ? course.title : 'Course',
      course_slug: course ? course.slug : '',
      course_type: course ? course.course_type : 'recorded',
      thumbnail_url: course ? course.thumbnail_url : '',
      progress_percentage: e.progress_percentage,
      total_lessons: totalLessons,
      completed_lessons: completedProgress.length,
      last_accessed_at: e.last_accessed_at,
    };
  });

  // Calculate overall stats
  const totalCompletedLessons = db.studentProgress.filter(
    (p) => p.student_id === student!.id && p.is_completed
  ).length;

  const achievements = db.achievements.filter((a) => a.student_id === student!.id);
  const testAttempts = db.testAttempts.filter((a) => a.student_id === student!.id);

  res.json({
    success: true,
    student: {
      id: student.id,
      name: req.user!.full_name,
      avatar_url: req.user!.avatar_url,
      grade_level: student.grade_level,
      xp_points: student.xp_points,
      badges_count: student.badges_count,
      streak_days: 5,
    },
    stats: {
      enrolled_courses: myCourses.length,
      completed_lessons: totalCompletedLessons,
      tests_passed: testAttempts.filter((a) => a.passed).length,
      total_xp: student.xp_points,
    },
    continue_learning: myCourses[0] || null,
    enrolled_courses: myCourses,
    achievements,
  });
});

// POST /api/student/enroll
router.post('/enroll', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  const course = db.courses.find((c) => c.id === course_id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Find or create student
  let student = db.students.find((s) => s.profile_id === req.user!.id);
  if (!student) {
    student = {
      id: `stu-${Date.now()}`,
      profile_id: req.user!.id,
      date_of_birth: '2016-01-01',
      grade_level: '4th Grade',
      school_name: 'Discovery Academy',
      interests: [course.title],
      xp_points: 100,
      badges_count: 0,
    };
    db.students.push(student);
  }

  // Check if already enrolled
  const existing = db.enrollments.find(
    (e) => e.student_id === student!.id && e.course_id === course.id
  );
  if (existing) {
    return res.json({
      success: true,
      message: 'Already enrolled in this course!',
      enrollment: existing,
    });
  }

  // Create enrollment
  const enrollment = {
    id: `enr-${Date.now()}`,
    student_id: student.id,
    course_id: course.id,
    status: 'active' as const,
    progress_percentage: 0.0,
    enrolled_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
  };
  db.enrollments.push(enrollment);

  // Record transaction
  const txn = {
    id: `txn-${Date.now()}`,
    reference_no: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    student_id: student.id,
    course_id: course.id,
    amount: course.price,
    currency: course.currency,
    payment_method: 'Simulated Card Payment',
    payment_status: 'paid' as const,
    notes: 'Direct enrollment checkout',
    created_at: new Date().toISOString(),
  };
  db.transactions.push(txn);

  res.status(201).json({
    success: true,
    message: `Enrolled successfully in ${course.title}!`,
    enrollment,
    transaction: txn,
  });
});

// POST /api/student/lessons/:lessonId/progress - Mark lesson completed or update watch time
router.post('/lessons/:lessonId/progress', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { lessonId } = req.params;
  const { is_completed = true, watch_time_seconds = 60 } = req.body;

  let student = db.students.find((s) => s.profile_id === req.user!.id);
  if (!student) {
    student = db.students[0];
  }

  // Find lesson & course
  let targetLesson: any = null;
  for (const m of db.modules) {
    const l = m.lessons.find((item) => item.id === lessonId);
    if (l) {
      targetLesson = l;
      break;
    }
  }

  if (!targetLesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Upsert progress
  let record = db.studentProgress.find(
    (p) => p.student_id === student!.id && p.lesson_id === lessonId
  );

  const wasCompleted = record?.is_completed;

  if (record) {
    record.is_completed = Boolean(is_completed);
    record.watch_time_seconds = Math.max(record.watch_time_seconds, Number(watch_time_seconds));
    record.last_watched_at = new Date().toISOString();
  } else {
    record = {
      id: `prog-${Date.now()}`,
      student_id: student.id,
      lesson_id: lessonId,
      course_id: targetLesson.course_id,
      is_completed: Boolean(is_completed),
      watch_time_seconds: Number(watch_time_seconds),
      last_watched_at: new Date().toISOString(),
    };
    db.studentProgress.push(record);
  }

  // If newly completed, award 50 XP
  if (!wasCompleted && record.is_completed) {
    student.xp_points += 50;
  }

  // Recalculate course enrollment progress %
  const courseModules = db.modules.filter((m) => m.course_id === targetLesson.course_id);
  const allLessonIds = courseModules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedCount = db.studentProgress.filter(
    (p) => p.student_id === student!.id && allLessonIds.includes(p.lesson_id) && p.is_completed
  ).length;

  const total = allLessonIds.length || 1;
  const percentage = Number(((completedCount / total) * 100).toFixed(1));

  const enrollment = db.enrollments.find(
    (e) => e.student_id === student!.id && e.course_id === targetLesson.course_id
  );
  if (enrollment) {
    enrollment.progress_percentage = percentage;
    enrollment.last_accessed_at = new Date().toISOString();
    if (percentage >= 100) {
      enrollment.status = 'completed';
    }
  }

  res.json({
    success: true,
    progress: record,
    course_progress: {
      percentage,
      completed_lessons: completedCount,
      total_lessons: total,
    },
    awarded_xp: !wasCompleted && record.is_completed ? 50 : 0,
    current_xp: student.xp_points,
  });
});

export default router;
