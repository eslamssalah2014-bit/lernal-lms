// ============================================================================
// VIDEO STREAMING ACCESS GUARD & BUNNY STREAM SIGNER
// Enforces enrollment authorization before issuing signed video streaming tokens
// ============================================================================

import { Router, Response } from 'express';
import { db } from '../data/mockDatabase.js';
import { bunnyStream } from '../services/bunnyStream.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/videos/lessons/:lessonId/access
router.get('/lessons/:lessonId/access', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { lessonId } = req.params;

  // Search across modules for the lesson
  let foundLesson: any = null;
  let parentCourse: any = null;

  for (const mod of db.modules) {
    const l = mod.lessons.find((item) => item.id === lessonId);
    if (l) {
      foundLesson = l;
      parentCourse = db.courses.find((c) => c.id === l.course_id);
      break;
    }
  }

  if (!foundLesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Check access authorization
  let isAuthorized = false;
  let authReason = '';

  if (foundLesson.is_free_preview) {
    isAuthorized = true;
    authReason = 'Free preview lesson available to all learners';
  } else if (!req.user) {
    return res.status(401).json({
      error: 'Please log in to stream this lesson.',
      requires_login: true,
      lesson_title: foundLesson.title,
    });
  } else if (req.user.role === 'admin' || req.user.role === 'instructor') {
    isAuthorized = true;
    authReason = `Staff access (${req.user.role})`;
  } else if (req.user.role === 'student') {
    const student = db.students.find((s) => s.profile_id === req.user!.id);
    if (student) {
      const enrollment = db.enrollments.find(
        (e) => e.student_id === student.id && e.course_id === foundLesson.course_id && e.status === 'active'
      );
      if (enrollment) {
        isAuthorized = true;
        authReason = 'Active student course enrollment';
      }
    }
  } else if (req.user.role === 'parent') {
    const parent = db.parents.find((p) => p.profile_id === req.user!.id);
    if (parent) {
      const studentChildren = db.students.filter((s) => s.parent_id === parent.id);
      const studentIds = studentChildren.map((s) => s.id);
      const enrollment = db.enrollments.find(
        (e) => studentIds.includes(e.student_id) && e.course_id === foundLesson.course_id && e.status === 'active'
      );
      if (enrollment) {
        isAuthorized = true;
        authReason = 'Child enrolled under parent account';
      }
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Enrollment required to view full lesson video stream.',
      course_id: foundLesson.course_id,
      course_title: parentCourse ? parentCourse.title : 'Course',
      course_price: parentCourse ? parentCourse.price : 0,
      lesson_title: foundLesson.title,
    });
  }

  // Authorize and sign Bunny Stream payload
  const bunnyVideoId = foundLesson.bunny_video_id || 'bunny_vid_lernal_101';
  const playbackInfo = bunnyStream.getAuthorizedVideoPlayback(bunnyVideoId, foundLesson.video_url);

  // Retrieve existing watch progress if user is a student
  let currentProgress = 0;
  let isCompleted = false;
  if (req.user && req.user.role === 'student') {
    const student = db.students.find((s) => s.profile_id === req.user!.id);
    if (student) {
      const progressRecord = db.studentProgress.find(
        (p) => p.student_id === student.id && p.lesson_id === foundLesson.id
      );
      if (progressRecord) {
        currentProgress = progressRecord.watch_time_seconds;
        isCompleted = progressRecord.is_completed;
      }
    }
  }

  res.json({
    success: true,
    auth_reason: authReason,
    lesson: {
      id: foundLesson.id,
      title: foundLesson.title,
      description: foundLesson.description,
      duration_minutes: foundLesson.duration_minutes,
      resources: foundLesson.resources || [],
      progress: {
        watch_time_seconds: currentProgress,
        is_completed: isCompleted,
      },
    },
    playback: playbackInfo,
  });
});

export default router;
