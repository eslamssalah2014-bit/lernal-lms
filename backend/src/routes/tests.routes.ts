// ============================================================================
// TESTING & QUIZ MODULE ROUTES - SUPABASE INTEGRATED
// Interactive test taking, grading, score certification, and attempt audits
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/tests - List tests (optionally filtered by course_id)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { course_id } = req.query;

  try {
    let query = supabaseAdmin
      .from('tests')
      .select(`
        *,
        course:courses(id, title),
        questions:test_questions(id)
      `)
      .eq('is_active', true);

    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    const { data: tests, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;

    const formatted = (tests || []).map((t: any) => ({
      id: t.id,
      course_id: t.course_id,
      course_title: t.course?.title || 'Course Test',
      title: t.title,
      description: t.description,
      passing_score: t.passing_score,
      time_limit_minutes: t.time_limit_minutes,
      max_attempts: t.max_attempts,
      total_questions: t.questions?.length || 0,
    }));

    res.json({ success: true, tests: formatted });
  } catch (err: any) {
    console.error('Error fetching tests from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch tests' });
  }
});

// GET /api/tests/:id - Get test for taking (strips is_correct answer flag for security)
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data: test, error: testErr } = await supabaseAdmin
      .from('tests')
      .select(`
        *,
        course:courses(id, title),
        questions:test_questions(
          id,
          question_text,
          question_type,
          points,
          order_index,
          answers:test_answers(id, answer_text, order_index)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (testErr) throw testErr;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check existing attempts for current student
    let studentAttempts: any[] = [];
    if (req.user && req.user.role === 'student') {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('profile_id', req.user.id)
        .maybeSingle();

      if (stu) {
        const { data: attempts } = await supabaseAdmin
          .from('test_attempts')
          .select('*')
          .eq('test_id', id)
          .eq('student_id', stu.id)
          .order('attempt_number', { ascending: false });

        studentAttempts = attempts || [];
      }
    }

    // Sort questions and answers by order_index
    const safeQuestions = (test.questions || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order_index: q.order_index,
        answers: (q.answers || []).sort((a: any, b: any) => a.order_index - b.order_index),
      }));

    res.json({
      success: true,
      test: {
        id: test.id,
        course_id: test.course_id,
        course_title: test.course?.title || 'Course',
        title: test.title,
        description: test.description,
        passing_score: test.passing_score,
        time_limit_minutes: test.time_limit_minutes,
        max_attempts: test.max_attempts,
        questions: safeQuestions,
      },
      previous_attempts: studentAttempts,
      remaining_attempts: Math.max(0, test.max_attempts - studentAttempts.length),
    });
  } catch (err: any) {
    console.error('Error fetching test details from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch test' });
  }
});

// POST /api/tests/:id/submit - Grade and store attempt results
router.post('/:id/submit', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { answers = {} } = req.body; // Map of question_id -> answer_id

  try {
    // 1. Fetch test with all questions and answers (including is_correct)
    const { data: test, error: testErr } = await supabaseAdmin
      .from('tests')
      .select(`
        *,
        questions:test_questions(
          id,
          points,
          answers:test_answers(id, is_correct)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (testErr || !test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // 2. Resolve student
    let studentId: string;
    if (req.user) {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('id, xp_points')
        .eq('profile_id', req.user.id)
        .maybeSingle();

      if (stu) {
        studentId = stu.id;
      } else {
        const { data: firstStu } = await supabaseAdmin.from('students').select('id').limit(1).single();
        studentId = firstStu?.id || '55555555-0000-0000-0000-000000000001';
      }
    } else {
      const { data: firstStu } = await supabaseAdmin.from('students').select('id').limit(1).single();
      studentId = firstStu?.id || '55555555-0000-0000-0000-000000000001';
    }

    // 3. Automated grading
    let earnedPoints = 0;
    let maxPoints = 0;
    const questionResults: any[] = [];

    for (const q of (test.questions || [])) {
      maxPoints += Number(q.points || 10);
      const chosenAnswerId = answers[q.id];
      const correctAnswer = (q.answers || []).find((a: any) => a.is_correct);
      const isCorrect = Boolean(chosenAnswerId && correctAnswer && chosenAnswerId === correctAnswer.id);

      const awarded = isCorrect ? Number(q.points || 10) : 0;
      earnedPoints += awarded;

      questionResults.push({
        question_id: q.id,
        chosen_answer_id: chosenAnswerId || null,
        is_correct: isCorrect,
        points_awarded: awarded,
      });
    }

    const percentage = maxPoints > 0 ? Number(((earnedPoints / maxPoints) * 100).toFixed(2)) : 0;
    const passed = percentage >= test.passing_score;

    // Get attempt count
    const { count } = await supabaseAdmin
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('test_id', id)
      .eq('student_id', studentId);

    const attemptNumber = (count || 0) + 1;

    // 4. Save attempt to Supabase
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from('test_attempts')
      .insert([
        {
          test_id: id,
          student_id: studentId,
          attempt_number: attemptNumber,
          score: earnedPoints,
          max_score: maxPoints,
          percentage,
          passed,
          completed_at: new Date().toISOString(),
          answers_summary: answers,
        },
      ])
      .select('*')
      .single();

    if (attemptErr) throw attemptErr;

    // 5. Save detailed per-question test_results
    const resultsRows = questionResults.map((qr) => ({
      attempt_id: attempt.id,
      question_id: qr.question_id,
      chosen_answer_id: qr.chosen_answer_id,
      is_correct: qr.is_correct,
      points_awarded: qr.points_awarded,
    }));

    await supabaseAdmin.from('test_results').insert(resultsRows);

    // 6. Award XP rewards if passed
    if (passed) {
      try {
        const { error: rpcErr } = await supabaseAdmin.rpc('increment_student_xp', {
          student_id_arg: studentId,
          xp_to_add: 100,
        });
        if (rpcErr) {
          const { data: stu } = await supabaseAdmin.from('students').select('xp_points').eq('id', studentId).single();
          const currentXp = Number(stu?.xp_points || 0);
          await supabaseAdmin.from('students').update({ xp_points: currentXp + 100 }).eq('id', studentId);
        }
      } catch (e) {
        // Safe fallback
      }
    }

    res.json({
      success: true,
      result: {
        attempt_id: attempt.id,
        attempt_number: attemptNumber,
        score: earnedPoints,
        max_score: maxPoints,
        percentage,
        passed,
        passing_score: test.passing_score,
        xp_earned: passed ? 100 : 0,
      },
    });
  } catch (err: any) {
    console.error('Error submitting test in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to submit test' });
  }
});

export default router;
