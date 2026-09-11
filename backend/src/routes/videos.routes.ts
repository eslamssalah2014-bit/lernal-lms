// ============================================================================
// VIDEO STREAMING ACCESS GUARD & BUNNY STREAM SIGNER - SUPABASE INTEGRATED
// Authorizes viewing rights against Supabase enrollments & signs Bunny CDN tokens
// ============================================================================

import { Router, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { bunnyStream } from '../services/bunnyStream.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/videos/lessons/:lessonId/access - Authorizes stream & returns signed Bunny CDN tokens
router.get('/lessons/:lessonId/access', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { lessonId } = req.params;

  try {
    // 1. Fetch lesson and parent course
    const { data: lesson, error: lesErr } = await supabaseAdmin
      .from('lessons')
      .select(`
        *,
        course:courses(id, title, price),
        videos:videos(bunny_video_id, title, duration_seconds, thumbnail_url, playback_metadata),
        resources:lesson_resources(*)
      `)
      .eq('id', lessonId)
      .maybeSingle();

    if (lesErr || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // 2. Check authorization
    let isAuthorized = false;
    let authReason = '';

    if (lesson.is_free_preview) {
      isAuthorized = true;
      authReason = 'Free preview lesson available to all learners';
    } else if (!req.user) {
      return res.status(401).json({
        error: 'Please log in to stream this lesson.',
        requires_login: true,
        lesson_title: lesson.title,
      });
    } else if (req.user.role === 'admin' || req.user.role === 'instructor') {
      isAuthorized = true;
      authReason = `Staff access (${req.user.role})`;
    } else if (req.user.role === 'student') {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('profile_id', req.user.id)
        .maybeSingle();

      if (stu) {
        const { data: enrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('student_id', stu.id)
          .eq('course_id', lesson.course_id)
          .eq('status', 'active')
          .maybeSingle();

        if (enrollment) {
          isAuthorized = true;
          authReason = 'Active student course enrollment';
        }
      }
    } else if (req.user.role === 'parent') {
      const { data: par } = await supabaseAdmin
        .from('parents')
        .select('id, students:students(id)')
        .eq('profile_id', req.user.id)
        .maybeSingle();

      if (par && par.students && par.students.length > 0) {
        const studentIds = par.students.map((s: any) => s.id);
        const { data: enrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .in('student_id', studentIds)
          .eq('course_id', lesson.course_id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        if (enrollment) {
          isAuthorized = true;
          authReason = 'Child enrolled under parent account';
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Enrollment required to view full lesson video stream.',
        course_id: lesson.course_id,
        course_title: lesson.course?.title || 'Course',
        course_price: lesson.course?.price || 0,
        lesson_title: lesson.title,
      });
    }

    // 3. Retrieve Bunny video identifier from metadata (strictly NO raw media files in Supabase)
    const videoRecord = lesson.videos?.[0] || lesson.videos;
    const bunnyVideoId = videoRecord?.bunny_video_id || `bunny_vid_lernal_${lesson.id.slice(0, 8)}`;

    const playbackInfo = bunnyStream.getAuthorizedVideoPlayback(bunnyVideoId);

    // 4. Retrieve existing watch progress if user is a student
    let currentProgress = 0;
    let isCompleted = false;

    if (req.user && req.user.role === 'student') {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('profile_id', req.user.id)
        .maybeSingle();

      if (stu) {
        const { data: prog } = await supabaseAdmin
          .from('student_progress')
          .select('watch_time_seconds, is_completed')
          .eq('student_id', stu.id)
          .eq('lesson_id', lesson.id)
          .maybeSingle();

        if (prog) {
          currentProgress = prog.watch_time_seconds || 0;
          isCompleted = Boolean(prog.is_completed);
        }
      }
    }

    res.json({
      success: true,
      auth_reason: authReason,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration_minutes: lesson.duration_minutes,
        resources: lesson.resources || [],
        progress: {
          watch_time_seconds: currentProgress,
          is_completed: isCompleted,
        },
      },
      playback: playbackInfo,
    });
  } catch (err: any) {
    console.error('Error authorizing video access in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to authorize video access' });
  }
});

export default router;
