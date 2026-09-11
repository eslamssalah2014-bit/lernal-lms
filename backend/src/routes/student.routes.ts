// ============================================================================
// STUDENT DASHBOARD & LEARNING HUB ROUTES - SUPABASE INTEGRATED
// Kid-friendly learning tracking, enrollments, XP rewards & lesson progress
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Resolve student entity
    let student: any = null;
    const { data: stuRecord } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('profile_id', req.user!.id)
      .maybeSingle();

    if (stuRecord) {
      student = stuRecord;
    } else {
      // Fallback first student for demo accounts
      const { data: defaultStu } = await supabaseAdmin.from('students').select('*').limit(1).single();
      student = defaultStu;
    }

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    // 2. Fetch active enrollments with course details
    const { data: enrollments, error: enrErr } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        course:courses(
          id,
          title,
          slug,
          course_type,
          thumbnail_url,
          modules:course_modules(id, lessons(id))
        )
      `)
      .eq('student_id', student.id)
      .eq('status', 'active');

    if (enrErr) throw enrErr;

    // 3. Fetch student progress
    const { data: allProgress } = await supabaseAdmin
      .from('student_progress')
      .select('*')
      .eq('student_id', student.id);

    const completedProgress = (allProgress || []).filter((p: any) => p.is_completed);

    const myCourses = (enrollments || []).map((e: any) => {
      const course = e.course;
      const modules = course?.modules || [];
      const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
      const completedForCourse = completedProgress.filter((p: any) => p.course_id === e.course_id).length;

      return {
        enrollment_id: e.id,
        course_id: e.course_id,
        course_title: course?.title || 'Course',
        course_slug: course?.slug || '',
        course_type: course?.course_type || 'recorded',
        thumbnail_url: course?.thumbnail_url || '',
        progress_percentage: Number(e.progress_percentage || 0),
        total_lessons: totalLessons,
        completed_lessons: completedForCourse,
        last_accessed_at: e.last_accessed_at,
      };
    });

    // 4. Fetch achievements & test attempts
    const [achievementsRes, attemptsRes] = await Promise.all([
      supabaseAdmin.from('achievements').select('*').eq('student_id', student.id).order('earned_at', { ascending: false }),
      supabaseAdmin.from('test_attempts').select('*').eq('student_id', student.id),
    ]);

    const achievements = achievementsRes.data || [];
    const testAttempts = attemptsRes.data || [];

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
        completed_lessons: completedProgress.length,
        tests_passed: testAttempts.filter((a: any) => a.passed).length,
        total_xp: student.xp_points,
      },
      continue_learning: myCourses[0] || null,
      enrolled_courses: myCourses,
      achievements,
    });
  } catch (err: any) {
    console.error('Error fetching student dashboard from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch student dashboard' });
  }
});

// POST /api/student/enroll - Enroll current student in a course
router.post('/enroll', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required' });
  }

  try {
    let studentId: string;
    let parentId: string | null = null;

    const { data: stu } = await supabaseAdmin
      .from('students')
      .select('id, parent_id')
      .eq('profile_id', req.user!.id)
      .maybeSingle();

    if (stu) {
      studentId = stu.id;
      parentId = stu.parent_id;
    } else {
      const { data: defaultStu } = await supabaseAdmin.from('students').select('id, parent_id').limit(1).single();
      studentId = defaultStu?.id || '55555555-0000-0000-0000-000000000001';
      parentId = defaultStu?.parent_id || null;
    }

    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .upsert(
        [
          {
            student_id: studentId,
            parent_id: parentId,
            course_id,
            status: 'active',
            progress_percentage: 0.0,
            last_accessed_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'student_id,course_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, enrollment });
  } catch (err: any) {
    console.error('Error enrolling student in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to enroll student' });
  }
});

// POST /api/student/lessons/:lessonId/progress - Update watch time & completion
router.post('/lessons/:lessonId/progress', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { lessonId } = req.params;
  const { is_completed = false, watch_time_seconds = 0 } = req.body;

  try {
    // 1. Fetch lesson to know course_id
    const { data: lesson, error: lesErr } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id')
      .eq('id', lessonId)
      .single();

    if (lesErr || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // 2. Resolve student
    let studentId: string;
    const { data: stu } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('profile_id', req.user!.id)
      .maybeSingle();

    studentId = stu?.id || '55555555-0000-0000-0000-000000000001';

    // 3. Upsert student progress record
    const { data: progress, error: progErr } = await supabaseAdmin
      .from('student_progress')
      .upsert(
        [
          {
            student_id: studentId,
            lesson_id: lesson.id,
            course_id: lesson.course_id,
            is_completed: Boolean(is_completed),
            watch_time_seconds: Number(watch_time_seconds),
            completed_at: is_completed ? new Date().toISOString() : null,
            last_watched_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'student_id,lesson_id' }
      )
      .select('*')
      .single();

    if (progErr) throw progErr;

    // 4. Recalculate enrollment percentage
    const [totalLessonsRes, completedLessonsRes] = await Promise.all([
      supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', lesson.course_id),
      supabaseAdmin
        .from('student_progress')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('course_id', lesson.course_id)
        .eq('is_completed', true),
    ]);

    const totalCount = totalLessonsRes.count || 1;
    const completedCount = completedLessonsRes.count || 0;
    const percentage = Number(((completedCount / totalCount) * 100).toFixed(1));

    await supabaseAdmin
      .from('enrollments')
      .update({
        progress_percentage: Math.min(100, percentage),
        last_accessed_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('course_id', lesson.course_id);

    res.json({ success: true, progress, calculated_progress_percentage: percentage });
  } catch (err: any) {
    console.error('Error updating progress in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to update lesson progress' });
  }
});

export default router;
