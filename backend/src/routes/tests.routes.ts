// ============================================================================
// TESTING & QUIZ MODULE ROUTES
// Interactive test taking, automated grading, score certification, and admin quiz builder
// ============================================================================

import { Router, Response } from 'express';
import { db, Test, TestQuestion, TestAttempt } from '../data/mockDatabase.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/tests - List tests (by course_id or all for admin)
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { course_id } = req.query;

  let list = db.tests;
  if (course_id) {
    list = list.filter((t) => t.course_id === course_id);
  }

  const sanitized = list.map((t) => {
    const course = db.courses.find((c) => c.id === t.course_id);
    return {
      id: t.id,
      course_id: t.course_id,
      course_title: course ? course.title : 'Course Test',
      title: t.title,
      description: t.description,
      passing_score: t.passing_score,
      time_limit_minutes: t.time_limit_minutes,
      max_attempts: t.max_attempts,
      total_questions: t.questions.length,
    };
  });

  res.json({ success: true, tests: sanitized });
});

// GET /api/tests/:id - Get test for taking (strips correct answer booleans for security)
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const test = db.tests.find((t) => t.id === id);

  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }

  const course = db.courses.find((c) => c.id === test.course_id);

  // Check if current student has attempts
  let studentAttempts: TestAttempt[] = [];
  if (req.user && req.user.role === 'student') {
    const student = db.students.find((s) => s.profile_id === req.user!.id);
    if (student) {
      studentAttempts = db.testAttempts.filter((a) => a.test_id === id && a.student_id === student.id);
    }
  }

  // Security: Never reveal is_correct to the client during test taking
  const safeQuestions = test.questions.map((q, idx) => ({
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    points: q.points,
    order_index: idx + 1,
    answers: q.answers.map((a) => ({
      id: a.id,
      answer_text: a.answer_text,
      order_index: a.order_index,
    })),
  }));

  res.json({
    success: true,
    test: {
      id: test.id,
      course_id: test.course_id,
      course_title: course ? course.title : 'Course',
      title: test.title,
      description: test.description,
      passing_score: test.passing_score,
      time_limit_minutes: test.time_limit_minutes,
      max_attempts: test.max_attempts,
      total_questions: safeQuestions.length,
      questions: safeQuestions,
      user_attempts_count: studentAttempts.length,
      previous_best: studentAttempts.length
        ? Math.max(...studentAttempts.map((a) => a.score))
        : null,
    },
  });
});

// POST /api/tests/:id/submit - Submit test answers & auto-grade
router.post('/:id/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { answers } = req.body; // Record of question_id -> answer_id or answer_ids

  const test = db.tests.find((t) => t.id === id);
  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }

  // Find student
  let student = db.students.find((s) => s.profile_id === req.user!.id);
  if (!student) {
    // If admin or test user taking quiz, create a temporary student context
    student = db.students[0];
  }

  // Check attempt limit
  const pastAttempts = db.testAttempts.filter((a) => a.test_id === id && a.student_id === student!.id);
  if (pastAttempts.length >= test.max_attempts && req.user!.role !== 'admin') {
    return res.status(403).json({
      error: `Maximum attempts limit (${test.max_attempts}) reached for this test.`,
    });
  }

  // Auto-grade submission
  let totalScore = 0;
  let maxScore = 0;
  const gradedQuestions: any[] = [];

  for (const q of test.questions) {
    maxScore += q.points;
    const studentAnswerId = answers ? answers[q.id] : null;
    const correctAnswer = q.answers.find((a) => a.is_correct);

    const isCorrect = studentAnswerId === correctAnswer?.id;
    if (isCorrect) {
      totalScore += q.points;
    }

    gradedQuestions.push({
      question_id: q.id,
      question_text: q.question_text,
      student_answer: studentAnswerId,
      correct_answer: correctAnswer?.id,
      explanation: q.explanation,
      is_correct: isCorrect,
      points_awarded: isCorrect ? q.points : 0,
      points_possible: q.points,
    });
  }

  const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0;
  const passed = percentage >= test.passing_score;

  const attemptRecord: TestAttempt = {
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    test_id: id,
    student_id: student.id,
    attempt_number: pastAttempts.length + 1,
    score: totalScore,
    max_score: maxScore,
    percentage,
    passed,
    started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    completed_at: new Date().toISOString(),
    answers_summary: answers || {},
  };

  db.testAttempts.push(attemptRecord);

  // Award XP and achievements if passed
  if (passed) {
    student.xp_points += 200;
    // Check if achievement can be awarded
    const hasBadge = db.achievements.some(
      (a) => a.student_id === student!.id && a.title.includes(test.title)
    );
    if (!hasBadge) {
      db.achievements.push({
        id: `ach-${Date.now()}`,
        student_id: student.id,
        title: `${test.title} Conqueror`,
        description: `Passed with flying colors (${percentage}%)!`,
        badge_icon: 'Trophy',
        earned_at: new Date().toISOString(),
      });
      student.badges_count += 1;
    }
  }

  res.json({
    success: true,
    result: {
      attempt_id: attemptRecord.id,
      attempt_number: attemptRecord.attempt_number,
      score: totalScore,
      max_score: maxScore,
      percentage,
      passed,
      passing_score: test.passing_score,
      earned_xp: passed ? 200 : 50,
      feedback: passed
        ? '🌟 Fantastic Job! You mastered this challenge with high honors!'
        : 'Keep going! Review the concepts and give it another shot to earn your star badge.',
      breakdown: gradedQuestions,
    },
  });
});

export default router;
