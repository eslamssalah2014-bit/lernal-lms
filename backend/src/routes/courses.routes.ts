// ============================================================================
// COURSES & CURRICULUM ROUTES
// Public catalog, detailed syllabus, and admin course creation/editing
// ============================================================================

import { Router, Request, Response } from 'express';
import { db, Course, CourseModule, Lesson } from '../data/mockDatabase.js';
import { authenticate, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/courses/categories
router.get('/categories', (req: Request, res: Response) => {
  res.json({ success: true, categories: db.categories });
});

// GET /api/courses
router.get('/', (req: Request, res: Response) => {
  const { category, type, search, difficulty, age } = req.query;

  let results = db.courses.filter((c) => c.status === 'published');

  if (category) {
    const cat = db.categories.find((k) => k.slug === category || k.id === category);
    if (cat) {
      results = results.filter((c) => c.category_id === cat.id);
    }
  }

  if (type && (type === 'live' || type === 'recorded')) {
    results = results.filter((c) => c.course_type === type);
  }

  if (difficulty) {
    results = results.filter((c) => c.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
  }

  if (age) {
    const ageNum = parseInt(age as string, 10);
    if (!isNaN(ageNum)) {
      results = results.filter((c) => c.age_min <= ageNum && c.age_max >= ageNum);
    }
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.short_description.toLowerCase().includes(q) ||
        c.learning_outcomes.some((o) => o.toLowerCase().includes(q))
    );
  }

  // Hydrate with instructor & category details
  const enriched = results.map((course) => {
    const categoryObj = db.categories.find((cat) => cat.id === course.category_id);
    const instructorObj = db.instructors.find((ins) => ins.id === course.instructor_id);
    const instructorProfile = instructorObj
      ? db.profiles.find((p) => p.id === instructorObj.profile_id)
      : null;

    const courseModules = db.modules.filter((m) => m.course_id === course.id);
    const lessonsCount = courseModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const enrollmentsCount = db.enrollments.filter((e) => e.course_id === course.id).length;

    return {
      ...course,
      category: categoryObj,
      instructor: instructorObj && instructorProfile
        ? {
            ...instructorObj,
            name: instructorProfile.full_name,
            avatar_url: instructorProfile.avatar_url,
          }
        : null,
      stats: {
        modules_count: courseModules.length,
        lessons_count: lessonsCount,
        enrollments_count: enrollmentsCount,
      },
    };
  });

  res.json({ success: true, count: enriched.length, courses: enriched });
});

// GET /api/courses/:idOrSlug
router.get('/:idOrSlug', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { idOrSlug } = req.params;

  const course = db.courses.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const categoryObj = db.categories.find((cat) => cat.id === course.category_id);
  const instructorObj = db.instructors.find((ins) => ins.id === course.instructor_id);
  const instructorProfile = instructorObj
    ? db.profiles.find((p) => p.id === instructorObj.profile_id)
    : null;

  const courseModules = db.modules
    .filter((m) => m.course_id === course.id)
    .sort((a, b) => a.order_index - b.order_index);

  // Check if current user is enrolled
  let isEnrolled = false;
  let enrollmentDetails: any = null;

  if (req.user) {
    const student = db.students.find((s) => s.profile_id === req.user!.id);
    if (student) {
      const enrollment = db.enrollments.find(
        (e) => e.student_id === student.id && e.course_id === course.id && e.status === 'active'
      );
      if (enrollment) {
        isEnrolled = true;
        enrollmentDetails = enrollment;
      }
    } else if (req.user.role === 'admin') {
      isEnrolled = true;
    }
  }

  // Hydrate syllabus (hide video source URLs for non-free preview lessons unless enrolled)
  const sanitizedModules = courseModules.map((module) => ({
    ...module,
    lessons: (module.lessons || []).map((lesson) => ({
      id: lesson.id,
      module_id: lesson.module_id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      is_free_preview: lesson.is_free_preview,
      has_video: Boolean(lesson.bunny_video_id || lesson.video_url),
      can_access: isEnrolled || lesson.is_free_preview,
      resources: isEnrolled || lesson.is_free_preview ? lesson.resources : [],
    })),
  }));

  const totalLessons = sanitizedModules.reduce((acc, m) => acc + m.lessons.length, 0);

  res.json({
    success: true,
    course: {
      ...course,
      category: categoryObj,
      instructor: instructorObj && instructorProfile
        ? {
            ...instructorObj,
            name: instructorProfile.full_name,
            avatar_url: instructorProfile.avatar_url,
          }
        : null,
      modules: sanitizedModules,
      stats: {
        total_modules: sanitizedModules.length,
        total_lessons: totalLessons,
      },
      user_access: {
        is_enrolled: isEnrolled,
        enrollment: enrollmentDetails,
      },
    },
  });
});

// POST /api/courses (Admin only)
router.post('/', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    slug,
    short_description,
    full_description,
    category_id,
    instructor_id,
    course_type = 'recorded',
    price = 99,
    currency = 'USD',
    age_min = 6,
    age_max = 14,
    duration_hours = 10,
    difficulty = 'Beginner',
    thumbnail_url,
    learning_outcomes = [],
    schedule_details,
  } = req.body;

  if (!title || !short_description) {
    return res.status(400).json({ error: 'Title and short description are required' });
  }

  const newSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCourse: Course = {
    id: `crs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    slug: newSlug,
    short_description,
    full_description: full_description || short_description,
    category_id: category_id || db.categories[0].id,
    instructor_id: instructor_id || db.instructors[0].id,
    course_type,
    price: Number(price),
    currency,
    age_min: Number(age_min),
    age_max: Number(age_max),
    duration_hours: Number(duration_hours),
    difficulty,
    status: 'published',
    is_featured: false,
    thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800',
    learning_outcomes: Array.isArray(learning_outcomes) ? learning_outcomes : [learning_outcomes],
    schedule_details,
    created_at: new Date().toISOString(),
  };

  db.courses.unshift(newCourse);

  res.status(201).json({ success: true, course: newCourse });
});

// POST /api/courses/:id/modules (Admin only)
router.post('/:id/modules', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const course = db.courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const existingModules = db.modules.filter((m) => m.course_id === id);
  const newModule: CourseModule = {
    id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    course_id: id,
    title: title || `Module ${existingModules.length + 1}`,
    description: description || '',
    order_index: existingModules.length + 1,
    lessons: [],
  };

  db.modules.push(newModule);

  res.status(201).json({ success: true, module: newModule });
});

// POST /api/modules/:moduleId/lessons (Admin only)
router.post('/modules/:moduleId/lessons', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { moduleId } = req.params;
  const { title, description, duration_minutes = 15, is_free_preview = false, bunny_video_id, video_url } = req.body;

  const moduleObj = db.modules.find((m) => m.id === moduleId);
  if (!moduleObj) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const newLesson: Lesson = {
    id: `les-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    module_id: moduleId,
    course_id: moduleObj.course_id,
    title: title || 'New Lesson',
    description: description || '',
    duration_minutes: Number(duration_minutes),
    order_index: (moduleObj.lessons?.length || 0) + 1,
    is_free_preview: Boolean(is_free_preview),
    bunny_video_id: bunny_video_id || `bunny_vid_lernal_${Date.now()}`,
    video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    resources: [],
  };

  moduleObj.lessons.push(newLesson);

  res.status(201).json({ success: true, lesson: newLesson });
});

export default router;
