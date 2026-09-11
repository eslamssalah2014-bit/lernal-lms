// ============================================================================
// LERNAL LMS - INITIAL IN-MEMORY RELATIONAL DATABASE
// Faithful implementation of schema.sql and seed.sql for instant development
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student' | 'parent';
  avatar_url: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Parent {
  id: string;
  profile_id: string;
  emergency_contact: string;
  billing_address: string;
  notes?: string;
}

export interface Student {
  id: string;
  profile_id: string;
  parent_id?: string;
  date_of_birth: string;
  grade_level: string;
  school_name: string;
  interests: string[];
  xp_points: number;
  badges_count: number;
}

export interface Instructor {
  id: string;
  profile_id: string;
  title: string;
  bio: string;
  specialties: string[];
  rating: number;
  total_students: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
  bunny_video_id?: string;
  video_url?: string;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  thumbnail_url: string;
  banner_url?: string;
  category_id: string;
  instructor_id: string;
  course_type: 'live' | 'recorded';
  price: number;
  currency: string;
  age_min: number;
  age_max: number;
  duration_hours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  learning_outcomes: string[];
  schedule_details?: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  parent_id?: string;
  course_id: string;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  last_watched_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  admin_id: string;
  note: string;
  created_at: string;
}

export interface Lead {
  id: string;
  parent_name: string;
  child_name: string;
  email: string;
  phone: string;
  course_id?: string;
  source: string;
  status: 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'not_interested' | 'lost';
  message?: string;
  notes?: string;
  assigned_admin_id?: string;
  next_follow_up_date?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  reference_no: string;
  student_id?: string;
  parent_id?: string;
  course_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  refund_amount?: number;
  refund_reason?: string;
  notes?: string;
  created_at: string;
}

export interface TestAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_index?: number;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points: number;
  explanation: string;
  answers: TestAnswer[];
}

export interface Test {
  id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  questions: TestQuestion[];
}

export interface TestAttempt {
  id: string;
  test_id: string;
  student_id: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
  answers_summary: Record<string, any>;
}

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  badge_icon: string;
  earned_at: string;
}

// ============================================================================
// IN-MEMORY DATABASE INSTANCE
// ============================================================================
class LernalDatabase {
  public profiles: Profile[] = [
    {
      id: '22222222-0000-0000-0000-000000000001',
      email: 'admin@lernal.edu',
      full_name: 'Alex Vance (Director)',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+1 (555) 019-2831',
      is_active: true,
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000002',
      email: 'instructor.marcus@lernal.edu',
      full_name: 'Dr. Marcus Sterling',
      role: 'instructor',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+1 (555) 014-9922',
      is_active: true,
      created_at: '2026-01-12T10:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000003',
      email: 'instructor.sarah@lernal.edu',
      full_name: 'Sarah Jenkins, M.Ed.',
      role: 'instructor',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: '+1 (555) 018-7711',
      is_active: true,
      created_at: '2026-01-14T10:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000004',
      email: 'parent.eleanor@lernal.edu',
      full_name: 'Eleanor Wright',
      role: 'parent',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      phone: '+1 (555) 492-1100',
      is_active: true,
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000005',
      email: 'parent.david@lernal.edu',
      full_name: 'David Chen',
      role: 'parent',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      phone: '+1 (555) 381-8844',
      is_active: true,
      created_at: '2026-02-04T10:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000006',
      email: 'student.leo@lernal.edu',
      full_name: 'Leo Wright',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      is_active: true,
      created_at: '2026-02-01T11:00:00Z',
    },
    {
      id: '22222222-0000-0000-0000-000000000007',
      email: 'student.sophie@lernal.edu',
      full_name: 'Sophie Chen',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      is_active: true,
      created_at: '2026-02-05T11:00:00Z',
    },
  ];

  public parents: Parent[] = [
    {
      id: '44444444-0000-0000-0000-000000000001',
      profile_id: '22222222-0000-0000-0000-000000000004',
      emergency_contact: '+1 (555) 492-9900',
      billing_address: '742 Evergreen Terrace, Seattle, WA',
      notes: 'Prefers email updates on Friday afternoons.',
    },
    {
      id: '44444444-0000-0000-0000-000000000002',
      profile_id: '22222222-0000-0000-0000-000000000005',
      emergency_contact: '+1 (555) 381-9988',
      billing_address: '120 Innovation Way, Austin, TX',
      notes: 'Interested in robotics and entrepreneurship tracks.',
    },
  ];

  public students: Student[] = [
    {
      id: '55555555-0000-0000-0000-000000000001',
      profile_id: '22222222-0000-0000-0000-000000000006',
      parent_id: '44444444-0000-0000-0000-000000000001',
      date_of_birth: '2016-04-12',
      grade_level: '4th Grade',
      school_name: 'Lincoln Discovery Elementary',
      interests: ['Robots', 'Minecraft Modding', 'Space Games'],
      xp_points: 1250,
      badges_count: 6,
    },
    {
      id: '55555555-0000-0000-0000-000000000002',
      profile_id: '22222222-0000-0000-0000-000000000007',
      parent_id: '44444444-0000-0000-0000-000000000002',
      date_of_birth: '2015-08-25',
      grade_level: '5th Grade',
      school_name: 'Austin Science Academy',
      interests: ['Digital Art', '2D Animation', 'Character Design'],
      xp_points: 840,
      badges_count: 4,
    },
  ];

  public instructors: Instructor[] = [
    {
      id: '33333333-0000-0000-0000-000000000001',
      profile_id: '22222222-0000-0000-0000-000000000002',
      title: 'Head of Robotics & AI Education',
      bio: 'Former MIT roboticist dedicated to making machine learning and spatial computing accessible to young minds.',
      specialties: ['Python', 'Robotics', 'Game AI', 'Scratch'],
      rating: 4.96,
      total_students: 420,
    },
    {
      id: '33333333-0000-0000-0000-000000000002',
      profile_id: '22222222-0000-0000-0000-000000000003',
      title: 'Master Educator & Creative Technologist',
      bio: '12+ years curriculum designer specializing in interactive gamified programming and computational thinking for ages 6–12.',
      specialties: ['Block Coding', 'Python', 'Game Design', 'Interactive Math'],
      rating: 4.98,
      total_students: 680,
    },
  ];

  public categories: CourseCategory[] = [
    {
      id: '11111111-0000-0000-0000-000000000001',
      name: 'Coding & Tech',
      slug: 'coding-cs',
      icon: 'Code2',
      description: 'Fun visual block coding, Python algorithms, and web creation for future engineers.',
      display_order: 1,
    },
    {
      id: '11111111-0000-0000-0000-000000000002',
      name: 'AI & Robotics',
      slug: 'ai-robotics',
      icon: 'Cpu',
      description: 'Discover machine learning, prompt crafting, and intelligent agents through games.',
      display_order: 2,
    },
    {
      id: '11111111-0000-0000-0000-000000000003',
      name: 'Young Entrepreneurs',
      slug: 'entrepreneurs-finance',
      icon: 'TrendingUp',
      description: 'Financial literacy, idea pitching, and mini-startup creation for ambitious minds.',
      display_order: 3,
    },
    {
      id: '11111111-0000-0000-0000-000000000004',
      name: 'English & Stories',
      slug: 'english-storytelling',
      icon: 'Sparkles',
      description: 'Creative writing, confident public speaking, and enchanted vocabulary quests.',
      display_order: 4,
    },
    {
      id: '11111111-0000-0000-0000-000000000005',
      name: 'Digital Art',
      slug: 'digital-art-animation',
      icon: 'Palette',
      description: 'Vector drawing, character design, and frame-by-frame animation storytelling.',
      display_order: 5,
    },
  ];

  public courses: Course[] = [
    {
      id: '66666666-0000-0000-0000-000000000001',
      title: 'Creative Coding with Scratch & Python',
      slug: 'creative-coding-scratch-python',
      short_description: 'From whimsical animated cartoons to real playable arcade games, learn core programming fundamentals step-by-step.',
      full_description: 'This comprehensive recorded course takes young learners on a vibrant journey through computational thinking. Starting with visual block coding in Scratch, students master loops, variables, and logic before transitioning gracefully to clean Python syntax.',
      thumbnail_url: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800',
      banner_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
      category_id: '11111111-0000-0000-0000-000000000001',
      instructor_id: '33333333-0000-0000-0000-000000000002',
      course_type: 'recorded',
      price: 149.00,
      currency: 'USD',
      age_min: 7,
      age_max: 12,
      duration_hours: 18.0,
      difficulty: 'Beginner',
      status: 'published',
      is_featured: true,
      learning_outcomes: [
        'Build 6 complete playable arcade games',
        'Master variables, loops, conditional logic and functions',
        'Transition from Scratch blocks to beginner Python syntax',
        'Earn the Junior Software Architect Certificate',
      ],
      schedule_details: 'Self-paced with lifetime access. Includes monthly live mentor check-ins.',
      created_at: '2026-01-15T09:00:00Z',
    },
    {
      id: '66666666-0000-0000-0000-000000000002',
      title: 'AI Explorers: Machine Learning for Young Innovators',
      slug: 'ai-explorers-machine-learning',
      short_description: 'Discover how computers learn, recognize images, generate creative stories, and power smart assistants.',
      full_description: 'A live cohort-based interactive program where kids train their first machine learning models, understand computer vision through playful experiments, and explore ethical AI in a secure, kid-safe environment.',
      thumbnail_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      category_id: '11111111-0000-0000-0000-000000000002',
      instructor_id: '33333333-0000-0000-0000-000000000001',
      course_type: 'live',
      price: 249.00,
      currency: 'USD',
      age_min: 9,
      age_max: 14,
      duration_hours: 15.0,
      difficulty: 'Intermediate',
      status: 'published',
      is_featured: true,
      learning_outcomes: [
        'Train computer vision models to identify hand gestures and toys',
        'Understand neural networks using interactive visual sandboxes',
        'Create your own customized AI assistant',
        'Learn safe and ethical digital intelligence habits',
      ],
      schedule_details: 'Live cohorts every Tuesday & Thursday at 5:00 PM EST.',
      created_at: '2026-01-20T09:00:00Z',
    },
    {
      id: '66666666-0000-0000-0000-000000000003',
      title: 'Young Entrepreneurs: Launch Your First Business Idea',
      slug: 'young-entrepreneurs-mini-startup',
      short_description: 'Turn passions into real mini-ventures! Learn product design, budgeting, branding, and persuasive pitch presentation.',
      full_description: 'An empowering live interactive workshop series where kids turn their creative inventions and hobbies into viable mini-businesses. Students learn profit calculations, brand design, and deliver a shark-tank style graduation pitch.',
      thumbnail_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
      banner_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
      category_id: '11111111-0000-0000-0000-000000000003',
      instructor_id: '33333333-0000-0000-0000-000000000001',
      course_type: 'live',
      price: 199.00,
      currency: 'USD',
      age_min: 10,
      age_max: 16,
      duration_hours: 12.0,
      difficulty: 'Beginner',
      status: 'published',
      is_featured: true,
      learning_outcomes: [
        'Develop an original product or service business model',
        'Create a logo, brand identity, and simple marketing flyer',
        'Calculate costs, revenues, and understand financial literacy',
        'Pitch to guest entrepreneurs during Graduation Demo Day',
      ],
      schedule_details: 'Weekly weekend workshops: Saturdays at 11:00 AM EST.',
      created_at: '2026-01-25T09:00:00Z',
    },
    {
      id: '66666666-0000-0000-0000-000000000004',
      title: 'Kids English & Storytelling Adventure',
      slug: 'kids-english-storytelling-adventure',
      short_description: 'An animated magical quest through phonics, joyful vocabulary, and expressive reading for early learners.',
      full_description: 'Designed for younger children ages 4 to 8, this course transforms reading into an enchanting fairy tale treasure hunt. Each lesson introduces phonetic sounds, story building blocks, and conversational speaking games.',
      thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      banner_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200',
      category_id: '11111111-0000-0000-0000-000000000004',
      instructor_id: '33333333-0000-0000-0000-000000000002',
      course_type: 'recorded',
      price: 89.00,
      currency: 'USD',
      age_min: 4,
      age_max: 8,
      duration_hours: 10.0,
      difficulty: 'Beginner',
      status: 'published',
      is_featured: false,
      learning_outcomes: [
        'Master 150+ essential vocabulary words through songs and games',
        'Gain conversational confidence in everyday English',
        'Construct imaginative original short fairy tales',
        'Pronunciation mastery with friendly voice coaches',
      ],
      schedule_details: 'Bite-sized 10-minute video lessons perfect for young attention spans.',
      created_at: '2026-02-01T09:00:00Z',
    },
    {
      id: '66666666-0000-0000-0000-000000000005',
      title: 'Digital Art & 2D Animation Academy',
      slug: 'digital-art-2d-animation-academy',
      short_description: 'Bring drawings to life! Master digital illustration, color palettes, and frame-by-frame character animation.',
      full_description: 'Young artists learn the digital canvas from scratch. From character sketching and dynamic poses to squash-and-stretch animation physics, students produce their own animated short scenes.',
      thumbnail_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
      banner_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200',
      category_id: '11111111-0000-0000-0000-000000000005',
      instructor_id: '33333333-0000-0000-0000-000000000002',
      course_type: 'recorded',
      price: 129.00,
      currency: 'USD',
      age_min: 8,
      age_max: 13,
      duration_hours: 14.0,
      difficulty: 'Intermediate',
      status: 'published',
      is_featured: false,
      learning_outcomes: [
        'Create custom character illustrations and mood boards',
        'Learn keyframing and timing for realistic motion',
        'Produce a 15-second original cartoon scene with sound effects',
        'Export and share portfolio creations',
      ],
      schedule_details: 'Self-paced on tablets or desktop drawing tablets.',
      created_at: '2026-02-05T09:00:00Z',
    },
  ];

  public modules: CourseModule[] = [
    {
      id: '77777777-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000001',
      title: 'Module 1: The Secret Language of Computers',
      description: 'Meet your coding avatar, understand algorithms, and write your very first sequence of instructions.',
      order_index: 1,
      lessons: [
        {
          id: '88888888-0000-0000-0000-000000000001',
          module_id: '77777777-0000-0000-0000-000000000001',
          course_id: '66666666-0000-0000-0000-000000000001',
          title: 'Lesson 1.1: Welcome to Lernal & Your First Sprite',
          description: 'Explore the interactive editor, choose your character, and give it life with motion commands.',
          duration_minutes: 12,
          order_index: 1,
          is_free_preview: true,
          bunny_video_id: 'bunny_vid_lernal_101',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          resources: [
            {
              id: 'aaaaaaaa-0000-0000-0000-000000000001',
              lesson_id: '88888888-0000-0000-0000-000000000001',
              title: 'Lernal Starter Sprite Pack & Cheat Sheet.pdf',
              file_url: 'https://lernal.edu/resources/sprite-pack-v1.pdf',
              file_type: 'pdf',
              file_size_mb: 2.4,
            },
          ],
        },
        {
          id: '88888888-0000-0000-0000-000000000002',
          module_id: '77777777-0000-0000-0000-000000000001',
          course_id: '66666666-0000-0000-0000-000000000001',
          title: 'Lesson 1.2: Coordinates: The Secret Map of the Screen',
          description: 'Understand the X and Y coordinate grid through a fun treasure-hunt mini-game.',
          duration_minutes: 14,
          order_index: 2,
          is_free_preview: false,
          bunny_video_id: 'bunny_vid_lernal_102',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          resources: [
            {
              id: 'aaaaaaaa-0000-0000-0000-000000000002',
              lesson_id: '88888888-0000-0000-0000-000000000002',
              title: 'X-Y Coordinates Grid Map Printable.pdf',
              file_url: 'https://lernal.edu/resources/xy-grid-map.pdf',
              file_type: 'pdf',
              file_size_mb: 1.1,
            },
          ],
        },
        {
          id: '88888888-0000-0000-0000-000000000003',
          module_id: '77777777-0000-0000-0000-000000000001',
          course_id: '66666666-0000-0000-0000-000000000001',
          title: 'Lesson 1.3: Events & Keystrokes: Making Characters Move',
          description: 'Wire arrow keys and click triggers to steer your space shuttle across the starry sky.',
          duration_minutes: 16,
          order_index: 3,
          is_free_preview: false,
          bunny_video_id: 'bunny_vid_lernal_103',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
      ],
    },
    {
      id: '77777777-0000-0000-0000-000000000002',
      course_id: '66666666-0000-0000-0000-000000000001',
      title: 'Module 2: Loops, Patterns & Superpowers',
      description: 'Why do computers love repeating things? Harness loops to build dazzling kaleidoscope designs.',
      order_index: 2,
      lessons: [
        {
          id: '88888888-0000-0000-0000-000000000004',
          module_id: '77777777-0000-0000-0000-000000000002',
          course_id: '66666666-0000-0000-0000-000000000001',
          title: 'Lesson 2.1: Forever Loops & Endless Run Dances',
          description: 'Build infinite loop choreographies and sound effects sync.',
          duration_minutes: 15,
          order_index: 1,
          is_free_preview: false,
          bunny_video_id: 'bunny_vid_lernal_201',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: '88888888-0000-0000-0000-000000000005',
          module_id: '77777777-0000-0000-0000-000000000002',
          course_id: '66666666-0000-0000-0000-000000000001',
          title: 'Lesson 2.2: Conditional Logic: If-Then Magic',
          description: 'Teach your game when a character touches an apple or hits an asteroid obstacle.',
          duration_minutes: 18,
          order_index: 2,
          is_free_preview: false,
          bunny_video_id: 'bunny_vid_lernal_202',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
      ],
    },
  ];

  public enrollments: Enrollment[] = [
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000001',
      student_id: '55555555-0000-0000-0000-000000000001',
      parent_id: '44444444-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000001',
      status: 'active',
      progress_percentage: 60.0,
      enrolled_at: '2026-02-15T14:30:00Z',
      last_accessed_at: '2026-03-01T16:20:00Z',
    },
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000002',
      student_id: '55555555-0000-0000-0000-000000000001',
      parent_id: '44444444-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000002',
      status: 'active',
      progress_percentage: 25.0,
      enrolled_at: '2026-02-20T11:00:00Z',
      last_accessed_at: '2026-02-28T10:15:00Z',
    },
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000003',
      student_id: '55555555-0000-0000-0000-000000000002',
      parent_id: '44444444-0000-0000-0000-000000000002',
      course_id: '66666666-0000-0000-0000-000000000005',
      status: 'active',
      progress_percentage: 40.0,
      enrolled_at: '2026-02-18T16:00:00Z',
      last_accessed_at: '2026-03-02T14:00:00Z',
    },
  ];

  public studentProgress: StudentProgress[] = [
    {
      id: 'cccccccc-0000-0000-0000-000000000001',
      student_id: '55555555-0000-0000-0000-000000000001',
      lesson_id: '88888888-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000001',
      is_completed: true,
      watch_time_seconds: 720,
      last_watched_at: '2026-02-16T15:00:00Z',
    },
    {
      id: 'cccccccc-0000-0000-0000-000000000002',
      student_id: '55555555-0000-0000-0000-000000000001',
      lesson_id: '88888888-0000-0000-0000-000000000002',
      course_id: '66666666-0000-0000-0000-000000000001',
      is_completed: true,
      watch_time_seconds: 840,
      last_watched_at: '2026-02-22T17:00:00Z',
    },
    {
      id: 'cccccccc-0000-0000-0000-000000000003',
      student_id: '55555555-0000-0000-0000-000000000001',
      lesson_id: '88888888-0000-0000-0000-000000000003',
      course_id: '66666666-0000-0000-0000-000000000001',
      is_completed: true,
      watch_time_seconds: 960,
      last_watched_at: '2026-02-26T18:00:00Z',
    },
  ];

  public achievements: Achievement[] = [
    {
      id: 'dddddddd-0000-0000-0000-000000000001',
      student_id: '55555555-0000-0000-0000-000000000001',
      title: 'First Sprite Navigator',
      description: 'Created and commanded your very first animated character.',
      badge_icon: 'Rocket',
      earned_at: '2026-02-16T15:10:00Z',
    },
    {
      id: 'dddddddd-0000-0000-0000-000000000002',
      student_id: '55555555-0000-0000-0000-000000000001',
      title: 'Coordinate Master',
      description: 'Solved all X-Y grid challenges without hitting a single meteor!',
      badge_icon: 'Target',
      earned_at: '2026-02-22T17:15:00Z',
    },
    {
      id: 'dddddddd-0000-0000-0000-000000000003',
      student_id: '55555555-0000-0000-0000-000000000001',
      title: 'Streak Champion: 5 Days',
      description: 'Logged in and completed lessons for 5 consecutive days.',
      badge_icon: 'Flame',
      earned_at: '2026-02-28T19:00:00Z',
    },
  ];

  public leads: Lead[] = [
    {
      id: 'eeeeeeee-0000-0000-0000-000000000001',
      parent_name: 'Jessica Parker',
      child_name: 'Noah Parker (Age 9)',
      email: 'jessica.parker@example.com',
      phone: '+1 (555) 723-9011',
      course_id: '66666666-0000-0000-0000-000000000002',
      source: 'Home Page Hero CTA',
      status: 'new',
      message: 'Noah loves tinkering with ChatGPT and Siri. Does the AI Explorers course require prior Python knowledge?',
      assigned_admin_id: '22222222-0000-0000-0000-000000000001',
      next_follow_up_date: '2026-03-12',
      created_at: '2026-03-08T10:15:00Z',
    },
    {
      id: 'eeeeeeee-0000-0000-0000-000000000002',
      parent_name: 'Robert Kim',
      child_name: 'Chloe Kim (Age 11)',
      email: 'robert.kim@innovate.org',
      phone: '+1 (555) 834-2900',
      course_id: '66666666-0000-0000-0000-000000000003',
      source: 'Course Details - Ask Button',
      status: 'contacted',
      message: 'Interested in the Young Entrepreneurs workshop. Can siblings attend together with one enrollment?',
      assigned_admin_id: '22222222-0000-0000-0000-000000000001',
      next_follow_up_date: '2026-03-13',
      created_at: '2026-03-05T14:40:00Z',
    },
    {
      id: 'eeeeeeee-0000-0000-0000-000000000003',
      parent_name: 'Amina Al-Mansoor',
      child_name: 'Zayn Al-Mansoor (Age 8)',
      email: 'amina.mansoor@qatar-health.qa',
      phone: '+974 5512 8841',
      course_id: '66666666-0000-0000-0000-000000000001',
      source: 'Social Media Campaign',
      status: 'interested',
      message: 'Looking for a weekend coding schedule that fits Gulf Standard Time.',
      assigned_admin_id: '22222222-0000-0000-0000-000000000001',
      next_follow_up_date: '2026-03-14',
      created_at: '2026-03-04T09:20:00Z',
    },
    {
      id: 'eeeeeeee-0000-0000-0000-000000000004',
      parent_name: 'Carlos Rodriguez',
      child_name: 'Mateo Rodriguez (Age 12)',
      email: 'carlos.rodriguez@techmail.com',
      phone: '+1 (555) 612-4488',
      course_id: '66666666-0000-0000-0000-000000000001',
      source: 'Referral from Eleanor Wright',
      status: 'converted',
      message: 'Mateo completed the preview lesson and was super excited. Proceeding with enrollment!',
      assigned_admin_id: '22222222-0000-0000-0000-000000000001',
      created_at: '2026-03-01T11:00:00Z',
    },
    {
      id: 'eeeeeeee-0000-0000-0000-000000000005',
      parent_name: 'Emily Thornton',
      child_name: 'Liam Thornton (Age 5)',
      email: 'emily.thornton@gmail.com',
      phone: '+1 (555) 902-3312',
      course_id: '66666666-0000-0000-0000-000000000004',
      source: 'Organic Search',
      status: 'follow_up',
      message: 'Needs advice on whether tablet or laptop is recommended for 5-year-olds.',
      assigned_admin_id: '22222222-0000-0000-0000-000000000001',
      next_follow_up_date: '2026-03-11',
      created_at: '2026-03-07T16:00:00Z',
    },
  ];

  public leadNotes: LeadNote[] = [
    {
      id: 'ffffffff-0000-0000-0000-000000000001',
      lead_id: 'eeeeeeee-0000-0000-0000-000000000002',
      admin_id: '22222222-0000-0000-0000-000000000001',
      note: 'Spoke on the phone for 10 mins. Explained sibling discount policy (20% off second student). Robert was very impressed with Dr. Marcus credentials.',
      created_at: '2026-03-06T10:00:00Z',
    },
    {
      id: 'ffffffff-0000-0000-0000-000000000002',
      lead_id: 'eeeeeeee-0000-0000-0000-000000000004',
      admin_id: '22222222-0000-0000-0000-000000000001',
      note: 'Lead converted successfully. Created enrollment TXN-2026-8910.',
      created_at: '2026-03-01T11:45:00Z',
    },
  ];

  public transactions: Transaction[] = [
    {
      id: '10101010-0000-0000-0000-000000000001',
      reference_no: 'TXN-2026-8910',
      student_id: '55555555-0000-0000-0000-000000000001',
      parent_id: '44444444-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000001',
      amount: 149.00,
      currency: 'USD',
      payment_method: 'Apple Pay',
      payment_status: 'paid',
      created_at: '2026-02-15T14:30:00Z',
    },
    {
      id: '10101010-0000-0000-0000-000000000002',
      reference_no: 'TXN-2026-8911',
      student_id: '55555555-0000-0000-0000-000000000001',
      parent_id: '44444444-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000002',
      amount: 249.00,
      currency: 'USD',
      payment_method: 'Credit Card (Visa)',
      payment_status: 'paid',
      created_at: '2026-02-20T11:00:00Z',
    },
    {
      id: '10101010-0000-0000-0000-000000000003',
      reference_no: 'TXN-2026-8912',
      student_id: '55555555-0000-0000-0000-000000000002',
      parent_id: '44444444-0000-0000-0000-000000000002',
      course_id: '66666666-0000-0000-0000-000000000005',
      amount: 129.00,
      currency: 'USD',
      payment_method: 'Credit Card (Mastercard)',
      payment_status: 'paid',
      created_at: '2026-02-18T16:00:00Z',
    },
    {
      id: '10101010-0000-0000-0000-000000000004',
      reference_no: 'TXN-2026-8913',
      parent_id: '44444444-0000-0000-0000-000000000002',
      course_id: '66666666-0000-0000-0000-000000000003',
      amount: 199.00,
      currency: 'USD',
      payment_method: 'PayPal',
      payment_status: 'pending',
      created_at: '2026-03-08T19:00:00Z',
    },
    {
      id: '10101010-0000-0000-0000-000000000005',
      reference_no: 'TXN-2026-8914',
      course_id: '66666666-0000-0000-0000-000000000004',
      amount: 89.00,
      currency: 'USD',
      payment_method: 'Credit Card',
      payment_status: 'refunded',
      refund_amount: 89.00,
      refund_reason: 'Schedule conflict before course start date',
      created_at: '2026-02-05T12:00:00Z',
    },
  ];

  public tests: Test[] = [
    {
      id: '20202020-0000-0000-0000-000000000001',
      course_id: '66666666-0000-0000-0000-000000000001',
      module_id: '77777777-0000-0000-0000-000000000001',
      title: 'Level 1 Checkpoint: Space Cadet Coding Quest',
      description: 'Test your understanding of sprite coordinates, sequence directions, and keyboard triggers.',
      passing_score: 75,
      time_limit_minutes: 15,
      max_attempts: 3,
      questions: [
        {
          id: '30303030-0000-0000-0000-000000000001',
          test_id: '20202020-0000-0000-0000-000000000001',
          question_text: "What happens if you change a sprite's X coordinate by +50?",
          question_type: 'single_choice',
          points: 25,
          explanation: 'Positive X values move characters horizontally to the RIGHT on the screen.',
          answers: [
            { id: '40404040-0000-0000-0000-000000000001', question_id: '30303030-0000-0000-0000-000000000001', answer_text: 'The sprite moves to the RIGHT', is_correct: true },
            { id: '40404040-0000-0000-0000-000000000002', question_id: '30303030-0000-0000-0000-000000000001', answer_text: 'The sprite moves to the LEFT', is_correct: false },
            { id: '40404040-0000-0000-0000-000000000003', question_id: '30303030-0000-0000-0000-000000000001', answer_text: 'The sprite moves UP', is_correct: false },
          ],
        },
        {
          id: '30303030-0000-0000-0000-000000000002',
          test_id: '20202020-0000-0000-0000-000000000001',
          question_text: 'Which block makes an action repeat forever until the game stops?',
          question_type: 'single_choice',
          points: 25,
          explanation: 'A "Forever" loop continually repeats code inside it.',
          answers: [
            { id: '40404040-0000-0000-0000-000000000004', question_id: '30303030-0000-0000-0000-000000000002', answer_text: 'Forever Loop block', is_correct: true },
            { id: '40404040-0000-0000-0000-000000000005', question_id: '30303030-0000-0000-0000-000000000002', answer_text: 'Wait 1 Second block', is_correct: false },
            { id: '40404040-0000-0000-0000-000000000006', question_id: '30303030-0000-0000-0000-000000000002', answer_text: 'Say Hello block', is_correct: false },
          ],
        },
        {
          id: '30303030-0000-0000-0000-000000000003',
          test_id: '20202020-0000-0000-0000-000000000001',
          question_text: 'True or False: A computer reads instructions sequentially from top to bottom.',
          question_type: 'true_false',
          points: 25,
          explanation: 'True! Computers execute code line by line from top to bottom unless told otherwise by loops or conditions.',
          answers: [
            { id: '40404040-0000-0000-0000-000000000007', question_id: '30303030-0000-0000-0000-000000000003', answer_text: 'True', is_correct: true },
            { id: '40404040-0000-0000-0000-000000000008', question_id: '30303030-0000-0000-0000-000000000003', answer_text: 'False', is_correct: false },
          ],
        },
        {
          id: '30303030-0000-0000-0000-000000000004',
          test_id: '20202020-0000-0000-0000-000000000001',
          question_text: 'Which of the following can trigger an interactive event in your project?',
          question_type: 'single_choice',
          points: 25,
          explanation: 'Pressing a key on the keyboard is a classic user event trigger.',
          answers: [
            { id: '40404040-0000-0000-0000-000000000009', question_id: '30303030-0000-0000-0000-000000000004', answer_text: 'Pressing the Spacebar key', is_correct: true },
            { id: '40404040-0000-0000-0000-000000000010', question_id: '30303030-0000-0000-0000-000000000004', answer_text: 'Closing your eyes', is_correct: false },
            { id: '40404040-0000-0000-0000-000000000011', question_id: '30303030-0000-0000-0000-000000000004', answer_text: 'Drinking a glass of juice', is_correct: false },
          ],
        },
      ],
    },
  ];

  public testAttempts: TestAttempt[] = [
    {
      id: '50505050-0000-0000-0000-000000000001',
      test_id: '20202020-0000-0000-0000-000000000001',
      student_id: '55555555-0000-0000-0000-000000000001',
      attempt_number: 1,
      score: 100,
      max_score: 100,
      percentage: 100.0,
      passed: true,
      started_at: '2026-02-27T14:00:00Z',
      completed_at: '2026-02-27T14:08:00Z',
      answers_summary: {
        '30303030-0000-0000-0000-000000000001': '40404040-0000-0000-0000-000000000001',
        '30303030-0000-0000-0000-000000000002': '40404040-0000-0000-0000-000000000004',
        '30303030-0000-0000-0000-000000000003': '40404040-0000-0000-0000-000000000007',
        '30303030-0000-0000-0000-000000000004': '40404040-0000-0000-0000-000000000009',
      },
    },
  ];
}

export const db = new LernalDatabase();
