-- ============================================================================
-- LERNAL LMS - MIGRATION 004: COMPREHENSIVE SEED DATA
-- Production-grade authentic development dataset for children & parents
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
    ('admin', 'Administrator', 'Full system and platform access'),
    ('instructor', 'Instructor', 'Curriculum designer and cohort teacher'),
    ('parent', 'Parent', 'Guardian monitoring child learning progress and billing'),
    ('student', 'Student', 'Learner accessing courses, videos, quizzes and rewards')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. COURSE CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO course_categories (id, name, slug, icon, description, display_order) VALUES
('11111111-0000-0000-0000-000000000001', 'Coding & Computer Science', 'coding-cs', 'Code2', 'Fun visual block coding, Python algorithms, and web creation for future engineers.', 1),
('11111111-0000-0000-0000-000000000002', 'Artificial Intelligence & Robotics', 'ai-robotics', 'Cpu', 'Discover machine learning, prompt crafting, and intelligent agents through games.', 2),
('11111111-0000-0000-0000-000000000003', 'Young Entrepreneurs & Money', 'entrepreneurs-finance', 'TrendingUp', 'Financial literacy, idea pitching, and mini-startup creation for ambitious minds.', 3),
('11111111-0000-0000-0000-000000000004', 'English & Storytelling', 'english-storytelling', 'Sparkles', 'Creative writing, confident public speaking, and enchanted vocabulary quests.', 4),
('11111111-0000-0000-0000-000000000005', 'Digital Art & 2D Animation', 'digital-art-animation', 'Palette', 'Vector drawing, character design, and frame-by-frame animation storytelling.', 5)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 3. USERS & PROFILES
-- ----------------------------------------------------------------------------
-- Admin
INSERT INTO profiles (id, email, full_name, role, avatar_url, phone) VALUES
('22222222-0000-0000-0000-000000000001', 'admin@lernal.edu', 'Alex Vance (Director)', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+1 (555) 019-2831'),
-- Instructors
('22222222-0000-0000-0000-000000000002', 'instructor.marcus@lernal.edu', 'Dr. Marcus Sterling', 'instructor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+1 (555) 014-9922'),
('22222222-0000-0000-0000-000000000003', 'instructor.sarah@lernal.edu', 'Sarah Jenkins, M.Ed.', 'instructor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '+1 (555) 018-7711'),
-- Parents
('22222222-0000-0000-0000-000000000004', 'parent.eleanor@lernal.edu', 'Eleanor Wright', 'parent', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '+1 (555) 492-1100'),
('22222222-0000-0000-0000-000000000005', 'parent.david@lernal.edu', 'David Chen', 'parent', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+1 (555) 381-8844'),
-- Students
('22222222-0000-0000-0000-000000000006', 'student.leo@lernal.edu', 'Leo Wright', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', NULL),
('22222222-0000-0000-0000-000000000007', 'student.sophie@lernal.edu', 'Sophie Chen', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', NULL),
('22222222-0000-0000-0000-000000000008', 'student.maya@lernal.edu', 'Maya Wright', 'student', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', NULL)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url;

-- Instructors Details
INSERT INTO instructors (id, profile_id, title, bio, specialties, rating, total_students) VALUES
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Head of Robotics & AI', 'Former MIT roboticist dedicated to making machine learning and spatial computing accessible to young minds.', ARRAY['Python', 'Robotics', 'Game AI', 'Scratch'], 4.96, 420),
('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'Master Educator & Creative Technologist', '12+ years curriculum designer specializing in interactive gamified programming and computational thinking for ages 6–12.', ARRAY['Block Coding', 'Python', 'Game Design', 'Interactive Math'], 4.98, 680)
ON CONFLICT (profile_id) DO UPDATE SET
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    total_students = EXCLUDED.total_students;

-- Parents Details
INSERT INTO parents (id, profile_id, emergency_contact, billing_address, notes) VALUES
('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', '+1 (555) 492-9900', '742 Evergreen Terrace, Seattle, WA', 'Prefers email updates on Friday afternoons.'),
('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000005', '+1 (555) 381-9988', '120 Innovation Way, Austin, TX', 'Interested in advance math and coding tracks.')
ON CONFLICT (profile_id) DO UPDATE SET
    emergency_contact = EXCLUDED.emergency_contact,
    billing_address = EXCLUDED.billing_address;

-- Students Details
INSERT INTO students (id, profile_id, parent_id, date_of_birth, grade_level, school_name, interests, xp_points, badges_count) VALUES
('55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000001', '2016-04-12', '4th Grade', 'Lincoln Discovery Elementary', ARRAY['Robots', 'Minecraft Modding', 'Space'], 1250, 6),
('55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000002', '2015-08-25', '5th Grade', 'Austin Science Academy', ARRAY['Animation', 'Game Development', 'Drawing'], 840, 4),
('55555555-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000001', '2018-11-03', '2nd Grade', 'Lincoln Discovery Elementary', ARRAY['Storybooks', 'English Adventures', 'Drawing'], 450, 2)
ON CONFLICT (profile_id) DO UPDATE SET
    grade_level = EXCLUDED.grade_level,
    xp_points = EXCLUDED.xp_points,
    badges_count = EXCLUDED.badges_count;

-- ----------------------------------------------------------------------------
-- 4. COURSES
-- ----------------------------------------------------------------------------
INSERT INTO courses (id, title, slug, short_description, full_description, thumbnail_url, banner_url, category_id, instructor_id, course_type, price, currency, age_min, age_max, duration_hours, difficulty, status, is_featured, learning_outcomes, schedule_details) VALUES
(
    '66666666-0000-0000-0000-000000000001',
    'Creative Coding with Scratch & Python',
    'creative-coding-scratch-python',
    'From whimsical animated cartoons to real playable arcade games, learn core programming fundamentals step-by-step.',
    'This comprehensive recorded course takes young learners on a vibrant journey through computational thinking. Starting with visual block coding in Scratch, students master loops, variables, and logic before transitioning gracefully to clean Python syntax.',
    'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
    '11111111-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000002',
    'recorded',
    149.00,
    'USD',
    7,
    12,
    18.0,
    'Beginner',
    'published',
    true,
    '["Build 6 complete playable arcade games", "Master variables, loops, conditional logic and functions", "Transition from Scratch blocks to beginner Python syntax", "Earn the Junior Software Architect Certificate"]'::jsonb,
    'Self-paced with lifetime access. Includes monthly live Q&A mentor sessions.'
),
(
    '66666666-0000-0000-0000-000000000002',
    'AI Explorers: Machine Learning for Young Innovators',
    'ai-explorers-machine-learning',
    'Discover how computers learn, recognize images, generate creative stories, and power smart assistants.',
    'A live cohort-based interactive program where kids train their first machine learning models, understand computer vision through playful experiments, and explore ethical AI in a secure, kid-safe environment.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    '11111111-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000001',
    'live',
    249.00,
    'USD',
    9,
    14,
    15.0,
    'Intermediate',
    'published',
    true,
    '["Train computer vision models to identify hand gestures and toys", "Understand neural networks using interactive visual sandboxes", "Create your own customized AI assistant", "Learn safe and ethical digital intelligence habits"]'::jsonb,
    'Live cohorts every Tuesday & Thursday at 5:00 PM EST via interactive classroom.'
),
(
    '66666666-0000-0000-0000-000000000003',
    'Young CEO: Financial Literacy & Pitch Craft',
    'young-ceo-financial-literacy',
    'Empower children with real-world entrepreneurial skills, financial mindset, budgeting, and public speaking.',
    'Kids create an imaginary business from ground up: developing a prototype product, calculating profits, managing marketing campaigns, and presenting to friendly mentors in a fun Shark Tank finale.',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200',
    '11111111-0000-0000-0000-000000000003',
    '33333333-0000-0000-0000-000000000002',
    'live',
    199.00,
    'USD',
    8,
    15,
    12.0,
    'Beginner',
    'published',
    true,
    '["Master money basics: earning, saving, investing, and giving", "Design and brand a complete mini-product or social project", "Gain stage confidence with persuasive pitch presentation skills", "Understand the value of ethical and conscious business"]'::jsonb,
    'Live cohorts every Saturday morning at 10:00 AM EST.'
),
(
    '66666666-0000-0000-0000-000000000004',
    'StoryCraft: English Creative Writing & Worldbuilding',
    'storycraft-creative-writing-worldbuilding',
    'Ignite your imagination! Craft vivid fantasy worlds, intriguing characters, and write your first published book.',
    'Guided by renowned educators, this self-paced course transforms reading reluctance into enthusiastic authorship through myth-building, dialog crafting, and illustrated anthologies.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200',
    '11111111-0000-0000-0000-000000000004',
    '33333333-0000-0000-0000-000000000002',
    'recorded',
    119.00,
    'USD',
    8,
    13,
    10.0,
    'Beginner',
    'published',
    false,
    '["Master the 3-Act narrative story arc", "Build original fantasy realms with maps and lore", "Enhance descriptive vocabulary and lively dialog", "Compile a finished illustrated short story portfolio"]'::jsonb,
    'Self-paced on demand with 1-on-1 editorial feedback.'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    status = EXCLUDED.status;

-- ----------------------------------------------------------------------------
-- 5. COURSE MODULES & LESSONS
-- ----------------------------------------------------------------------------
-- Modules for Course 1
INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES
('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Module 1: The Magician of Code (Scratch Basics)', 'Meet the canvas, sprites, coordinate systems, and your first animated story.', 1),
('77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'Module 2: Loops, Logic & Catch Games', 'Learn repetition, condition blocks (if-then), collision detection, and score counters.', 2),
('77777777-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', 'Module 3: Leaping into Real Python', 'Graduating from drag-and-drop blocks to clean, elegant Python statements.', 3)
ON CONFLICT DO NOTHING;

-- Lessons for Module 1
INSERT INTO lessons (id, module_id, course_id, title, description, duration_minutes, order_index, is_free_preview) VALUES
('88888888-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Lesson 1.1: Welcome to the Coding Realm', 'Discover how software powers the world and meet your Scratch editor playground.', 12, 1, true),
('88888888-0000-0000-0000-000000000002', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Lesson 1.2: Moving Sprites with X & Y Coordinates', 'Understand 2D coordinate planes by making your character dance on beat.', 15, 2, false),
('88888888-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Lesson 1.3: Voice and Sound Effects in Code', 'Record sounds, add music loops, and trigger humorous voice lines.', 14, 3, false)
ON CONFLICT DO NOTHING;

-- Lessons for Module 2
INSERT INTO lessons (id, module_id, course_id, title, description, duration_minutes, order_index, is_free_preview) VALUES
('88888888-0000-0000-0000-000000000004', '77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'Lesson 2.1: Infinite Loops and Gliders', 'Master the "forever" loop and build continuous starfield backgrounds.', 18, 1, false),
('88888888-0000-0000-0000-000000000005', '77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'Lesson 2.2: Building the Apple Catcher Game', 'Implement paddle movement, falling gravity, and dynamic score calculation.', 22, 2, false)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. VIDEOS (Bunny Stream Metadata - Strictly NO Raw Video Files)
-- ----------------------------------------------------------------------------
INSERT INTO videos (id, lesson_id, course_id, bunny_video_id, title, duration_seconds, thumbnail_url, playback_metadata) VALUES
(
    '99999999-0000-0000-0000-000000000001',
    '88888888-0000-0000-0000-000000000001',
    '66666666-0000-0000-0000-000000000001',
    'bunny_vid_lernal_101',
    'Welcome to the Coding Realm (Bunny Stream 1080p)',
    720,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    '{"resolutions": ["1080p", "720p", "480p", "360p"], "cdn_region": "auto", "drm_enabled": true}'::jsonb
),
(
    '99999999-0000-0000-0000-000000000002',
    '88888888-0000-0000-0000-000000000002',
    '66666666-0000-0000-0000-000000000001',
    'bunny_vid_lernal_102',
    'Moving Sprites with X & Y Coordinates',
    900,
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600',
    '{"resolutions": ["1080p", "720p", "480p"], "cdn_region": "auto", "drm_enabled": true}'::jsonb
)
ON CONFLICT (lesson_id) DO UPDATE SET
    bunny_video_id = EXCLUDED.bunny_video_id,
    duration_seconds = EXCLUDED.duration_seconds;

-- ----------------------------------------------------------------------------
-- 7. ENROLLMENTS & PROGRESS
-- ----------------------------------------------------------------------------
INSERT INTO enrollments (id, student_id, parent_id, course_id, status, progress_percentage, enrolled_at) VALUES
(
    'aaaaaaaa-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000001', -- Leo Wright
    '44444444-0000-0000-0000-000000000001', -- Eleanor Wright
    '66666666-0000-0000-0000-000000000001', -- Creative Coding
    'active',
    66.7,
    NOW() - INTERVAL '14 days'
),
(
    'aaaaaaaa-0000-0000-0000-000000000002',
    '55555555-0000-0000-0000-000000000002', -- Sophie Chen
    '44444444-0000-0000-0000-000000000002', -- David Chen
    '66666666-0000-0000-0000-000000000002', -- AI Explorers
    'active',
    35.0,
    NOW() - INTERVAL '7 days'
)
ON CONFLICT (student_id, course_id) DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage;

-- Student Progress for Leo
INSERT INTO student_progress (student_id, lesson_id, course_id, is_completed, watch_time_seconds, completed_at) VALUES
('55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', true, 720, NOW() - INTERVAL '10 days'),
('55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', true, 900, NOW() - INTERVAL '5 days'),
('55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', false, 320, NULL)
ON CONFLICT (student_id, lesson_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    watch_time_seconds = EXCLUDED.watch_time_seconds;

-- ----------------------------------------------------------------------------
-- 8. LEADS (CRM ENGINE)
-- ----------------------------------------------------------------------------
INSERT INTO leads (id, parent_name, child_name, email, phone, course_id, source, status, message, assigned_admin_id, next_follow_up_date, created_at) VALUES
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Catherine Miller',
    'Lucas Miller (Age 9)',
    'catherine.miller@gmail.com',
    '+1 (555) 749-1120',
    '66666666-0000-0000-0000-000000000002',
    'Landing Page Hero Form',
    'new',
    'My son is obsessed with Minecraft and robots. Is the AI course suitable for a beginner 9-year old?',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '1 day',
    NOW() - INTERVAL '2 hours'
),
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Robert Ramirez',
    'Emma Ramirez (Age 11)',
    'robert.r@outlook.com',
    '+1 (555) 883-9912',
    '66666666-0000-0000-0000-000000000001',
    'Course Details Inquiry',
    'contacted',
    'Interested in weekend morning batches for Scratch and Python.',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
),
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    'Sarah Thompson',
    'Oliver Thompson (Age 13)',
    'sthompson.family@yahoo.com',
    '+1 (555) 302-8819',
    '66666666-0000-0000-0000-000000000003',
    'Live Chat Referral',
    'converted',
    'Looking forward to enrolling Oliver in the Young CEO cohort.',
    '22222222-0000-0000-0000-000000000001',
    NULL,
    NOW() - INTERVAL '4 days'
)
ON CONFLICT DO NOTHING;

-- Lead Notes
INSERT INTO lead_notes (id, lead_id, admin_id, note, created_at) VALUES
('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Called parent Robert. He requested syllabus PDF and schedule for Saturday cohort.', NOW() - INTERVAL '20 hours'),
('cccccccc-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'Payment completed via Stripe link. Successfully converted lead to enrolled student Oliver.', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. TRANSACTIONS (FINANCIAL LEDGER)
-- ----------------------------------------------------------------------------
INSERT INTO transactions (id, reference_no, student_id, parent_id, course_id, amount, currency, payment_method, payment_status, created_at) VALUES
(
    'dddddddd-0000-0000-0000-000000000001',
    'TXN-2026-8801',
    '55555555-0000-0000-0000-000000000001',
    '44444444-0000-0000-0000-000000000001',
    '66666666-0000-0000-0000-000000000001',
    149.00,
    'USD',
    'Stripe Credit Card',
    'paid',
    NOW() - INTERVAL '14 days'
),
(
    'dddddddd-0000-0000-0000-000000000002',
    'TXN-2026-8802',
    '55555555-0000-0000-0000-000000000002',
    '44444444-0000-0000-0000-000000000002',
    '66666666-0000-0000-0000-000000000002',
    249.00,
    'USD',
    'Apple Pay',
    'paid',
    NOW() - INTERVAL '7 days'
),
(
    'dddddddd-0000-0000-0000-000000000003',
    'TXN-2026-8803',
    '55555555-0000-0000-0000-000000000003',
    '44444444-0000-0000-0000-000000000001',
    '66666666-0000-0000-0000-000000000004',
    119.00,
    'USD',
    'Bank Wire',
    'pending',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (reference_no) DO UPDATE SET
    payment_status = EXCLUDED.payment_status;

-- ----------------------------------------------------------------------------
-- 10. TESTS, QUESTIONS, & ATTEMPTS
-- ----------------------------------------------------------------------------
INSERT INTO tests (id, course_id, module_id, title, description, passing_score, time_limit_minutes, max_attempts, is_active) VALUES
(
    'eeeeeeee-0000-0000-0000-000000000001',
    '66666666-0000-0000-0000-000000000001',
    '77777777-0000-0000-0000-000000000001',
    'Module 1 Checkpoint: Scratch Coordinates Master',
    'Demonstrate your mastery of sprite movements, X & Y axes, and sequence logic.',
    70,
    15,
    3,
    true
)
ON CONFLICT DO NOTHING;

-- Question 1
INSERT INTO test_questions (id, test_id, question_text, question_type, points, order_index) VALUES
('ffffffff-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', 'In Scratch 2D plane, what happens to a sprite when you change X by +50?', 'single_choice', 10, 1),
('ffffffff-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000001', 'Which block makes a sequence repeat forever?', 'single_choice', 10, 2)
ON CONFLICT DO NOTHING;

-- Answers for Q1
INSERT INTO test_answers (id, question_id, answer_text, is_correct, order_index) VALUES
('12121212-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000001', 'The sprite moves 50 steps to the RIGHT', true, 1),
('12121212-0000-0000-0000-000000000002', 'ffffffff-0000-0000-0000-000000000001', 'The sprite moves 50 steps to the LEFT', false, 2),
('12121212-0000-0000-0000-000000000003', 'ffffffff-0000-0000-0000-000000000001', 'The sprite jumps 50 steps UP', false, 3)
ON CONFLICT DO NOTHING;

-- Answers for Q2
INSERT INTO test_answers (id, question_id, answer_text, is_correct, order_index) VALUES
('12121212-0000-0000-0000-000000000004', 'ffffffff-0000-0000-0000-000000000002', 'forever [ ] block', true, 1),
('12121212-0000-0000-0000-000000000005', 'ffffffff-0000-0000-0000-000000000002', 'repeat (10) [ ] block', false, 2),
('12121212-0000-0000-0000-000000000006', 'ffffffff-0000-0000-0000-000000000002', 'if <touching> then [ ] block', false, 3)
ON CONFLICT DO NOTHING;

-- Test Attempt for Leo
INSERT INTO test_attempts (id, test_id, student_id, attempt_number, score, max_score, percentage, passed, started_at, completed_at) VALUES
(
    '13131313-0000-0000-0000-000000000001',
    'eeeeeeee-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000001',
    1,
    20,
    20,
    100.00,
    true,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '8 minutes'
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. ACHIEVEMENTS & NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO achievements (id, student_id, title, description, badge_icon, earned_at) VALUES
('14141414-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', 'First Code Spark ⚡', 'Completed first interactive lesson in Scratch', 'Zap', NOW() - INTERVAL '10 days'),
('14141414-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', 'Perfect Score 🎯', 'Earned 100% on Module 1 Checkpoint Assessment', 'Award', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;
