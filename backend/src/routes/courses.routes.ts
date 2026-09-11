// ============================================================================
// COURSES & CURRICULUM ROUTES (SUPABASE INTEGRATED)
// Real PostgreSQL queries for course catalog, syllabus, and module administration
// ============================================================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticate, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { Course, CourseCategory, CourseModule, Lesson } from '../types/database.js';

const router = Router();

// GET /api/courses/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('course_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, categories: categories || [] });
  } catch (err: any) {
    console.error('Error fetching categories from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch course categories' });
  }
});

// GET /api/courses
router.get('/', async (req: Request, res: Response) => {
  const { category, type, search, difficulty, age } = req.query;

  try {
    let query = supabaseAdmin
      .from('courses')
      .select(`
        *,
        category:course_categories(*),
        instructor:instructors(*, profile:profiles(*))
      `)
      .eq('status', 'published');

    if (type && (type === 'live' || type === 'recorded')) {
      query = query.eq('course_type', type);
    }

    if (difficulty) {
      query = query.ilike('difficulty', difficulty as string);
    }

    if (age) {
      const ageNum = parseInt(age as string, 10);
      if (!isNaN(ageNum)) {
        query = query.lte('age_min', ageNum).gte('age_max', ageNum);
      }
    }

    if (search) {
      const term = `%${(search as string).trim()}%`;
      query = query.or(`title.ilike.${term},short_description.ilike.${term}`);
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    let filteredCourses = courses || [];

    // Filter by category slug or id if specified
    if (category) {
      filteredCourses = filteredCourses.filter(
        (c: any) => c.category_id === category || c.category?.slug === category
      );
    }

    // Hydrate counts (modules, lessons, enrollments)
    const enriched = await Promise.all(
      filteredCourses.map(async (course: any) => {
        const [modulesRes, enrollmentsRes] = await Promise.all([
          supabaseAdmin.from('course_modules').select('id, lessons(id)').eq('course_id', course.id),
          supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true }).eq('course_id', course.id),
        ]);

        const modules = modulesRes.data || [];
        const lessonsCount = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
        const enrollmentsCount = enrollmentsRes.count || 0;

        const instructorProfile = course.instructor?.profile;

        return {
          ...course,
          instructor: course.instructor
            ? {
                ...course.instructor,
                name: instructorProfile?.full_name || 'Lernal Mentor',
                avatar_url: instructorProfile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              }
            : null,
          stats: {
            modules_count: modules.length,
            lessons_count: lessonsCount,
            enrollments_count: enrollmentsCount,
          },
        };
      })
    );

    res.json({ success: true, count: enriched.length, courses: enriched });
  } catch (err: any) {
    console.error('Error fetching courses from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch courses' });
  }
});

// GET /api/courses/:idOrSlug
router.get('/:idOrSlug', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { idOrSlug } = req.params;

  try {
    // 1. Fetch course details
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let courseQuery = supabaseAdmin
      .from('courses')
      .select(`
        *,
        category:course_categories(*),
        instructor:instructors(*, profile:profiles(*))
      `);

    if (isUUID) {
      courseQuery = courseQuery.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    } else {
      courseQuery = courseQuery.eq('slug', idOrSlug);
    }

    const { data: course, error: courseError } = await courseQuery.maybeSingle();

    if (courseError) throw courseError;
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 2. Fetch modules & lessons with videos
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('course_modules')
      .select(`
        *,
        lessons:lessons(
          *,
          videos:videos(bunny_video_id, duration_seconds, thumbnail_url),
          resources:lesson_resources(*)
        )
      `)
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });

    if (modulesError) throw modulesError;

    // 3. Check enrollment authorization for current user
    let isEnrolled = false;
    let enrollmentDetails: any = null;

    if (req.user) {
      if (req.user.role === 'admin') {
        isEnrolled = true;
      } else if (req.user.role === 'student') {
        const { data: student } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('profile_id', req.user.id)
          .maybeSingle();

        if (student) {
          const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('student_id', student.id)
            .eq('course_id', course.id)
            .eq('status', 'active')
            .maybeSingle();

          if (enrollment) {
            isEnrolled = true;
            enrollmentDetails = enrollment;
          }
        }
      } else if (req.user.role === 'parent') {
        const { data: parent } = await supabaseAdmin
          .from('parents')
          .select('id')
          .eq('profile_id', req.user.id)
          .maybeSingle();

        if (parent) {
          const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('parent_id', parent.id)
            .eq('course_id', course.id)
            .eq('status', 'active')
            .maybeSingle();

          if (enrollment) {
            isEnrolled = true;
            enrollmentDetails = enrollment;
          }
        }
      }
    }

    // 4. Sanitize lessons (protect non-preview video URLs & resources)
    const sanitizedModules = (modules || []).map((module: any) => {
      const sortedLessons = (module.lessons || []).sort(
        (a: any, b: any) => a.order_index - b.order_index
      );

      return {
        ...module,
        lessons: sortedLessons.map((lesson: any) => {
          const videoMeta = lesson.videos?.[0] || lesson.videos;
          const canAccess = isEnrolled || lesson.is_free_preview;

          return {
            id: lesson.id,
            module_id: lesson.module_id,
            course_id: lesson.course_id,
            title: lesson.title,
            description: lesson.description,
            duration_minutes: lesson.duration_minutes,
            order_index: lesson.order_index,
            is_free_preview: lesson.is_free_preview,
            has_video: Boolean(videoMeta?.bunny_video_id),
            can_access: canAccess,
            bunny_video_id: canAccess ? videoMeta?.bunny_video_id : undefined,
            resources: canAccess ? lesson.resources || [] : [],
          };
        }),
      };
    });

    const totalLessons = sanitizedModules.reduce((acc, m) => acc + m.lessons.length, 0);
    const instructorProfile = course.instructor?.profile;

    res.json({
      success: true,
      course: {
        ...course,
        instructor: course.instructor
          ? {
              ...course.instructor,
              name: instructorProfile?.full_name || 'Lernal Mentor',
              avatar_url: instructorProfile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
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
  } catch (err: any) {
    console.error('Error fetching course syllabus from Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch course details' });
  }
});

// POST /api/courses (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

  try {
    const { data: newCourse, error } = await supabaseAdmin
      .from('courses')
      .insert([
        {
          title,
          slug: newSlug,
          short_description,
          full_description: full_description || short_description,
          category_id: category_id || null,
          instructor_id: instructor_id || null,
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
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, course: newCourse });
  } catch (err: any) {
    console.error('Error creating course in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to create course' });
  }
});

// POST /api/courses/:id/modules (Admin only)
router.post('/:id/modules', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const { count } = await supabaseAdmin
      .from('course_modules')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', id);

    const orderIndex = (count || 0) + 1;

    const { data: newModule, error } = await supabaseAdmin
      .from('course_modules')
      .insert([
        {
          course_id: id,
          title: title || `Module ${orderIndex}`,
          description: description || '',
          order_index: orderIndex,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, module: newModule });
  } catch (err: any) {
    console.error('Error creating course module in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to create module' });
  }
});

// POST /api/courses/modules/:moduleId/lessons (Admin only)
router.post('/modules/:moduleId/lessons', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { moduleId } = req.params;
  const { title, description, duration_minutes = 15, is_free_preview = false, bunny_video_id } = req.body;

  try {
    const { data: moduleRecord, error: modErr } = await supabaseAdmin
      .from('course_modules')
      .select('course_id')
      .eq('id', moduleId)
      .single();

    if (modErr || !moduleRecord) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const { count } = await supabaseAdmin
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('module_id', moduleId);

    const orderIndex = (count || 0) + 1;

    // 1. Insert lesson
    const { data: newLesson, error: lessonErr } = await supabaseAdmin
      .from('lessons')
      .insert([
        {
          module_id: moduleId,
          course_id: moduleRecord.course_id,
          title: title || 'New Lesson',
          description: description || '',
          duration_minutes: Number(duration_minutes),
          order_index: orderIndex,
          is_free_preview: Boolean(is_free_preview),
        },
      ])
      .select('*')
      .single();

    if (lessonErr) throw lessonErr;

    // 2. Insert Bunny Stream video metadata if provided
    if (bunny_video_id) {
      await supabaseAdmin.from('videos').insert([
        {
          lesson_id: newLesson.id,
          course_id: moduleRecord.course_id,
          bunny_video_id,
          title: newLesson.title,
          duration_seconds: Number(duration_minutes) * 60,
          status: 'ready',
        },
      ]);
    }

    res.status(201).json({ success: true, lesson: newLesson });
  } catch (err: any) {
    console.error('Error creating lesson in Supabase:', err);
    res.status(500).json({ error: err.message || 'Failed to create lesson' });
  }
});

export default router;
