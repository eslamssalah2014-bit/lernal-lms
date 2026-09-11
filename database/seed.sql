-- ============================================================================
-- LERNAL LMS - COMPREHENSIVE SEED DATA
-- Authentic EdTech Sample Data for Children (Since 2026)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO course_categories (id, name, slug, icon, description, display_order) VALUES
('11111111-0000-0000-0000-000000000001', 'Coding & Computer Science', 'coding-cs', 'Code2', 'Fun visual block coding, Python algorithms, and web creation for future engineers.', 1),
('11111111-0000-0000-0000-000000000002', 'Artificial Intelligence & Robotics', 'ai-robotics', 'Cpu', 'Discover machine learning, prompt crafting, and intelligent agents through games.', 2),
('11111111-0000-0000-0000-000000000003', 'Young Entrepreneurs & Money', 'entrepreneurs-finance', 'TrendingUp', 'Financial literacy, idea pitching, and mini-startup creation for ambitious minds.', 3),
('11111111-0000-0000-0000-000000000004', 'English & Storytelling', 'english-storytelling', 'Sparkles', 'Creative writing, confident public speaking, and enchanted vocabulary quests.', 4),
('11111111-0000-0000-0000-000000000005', 'Digital Art & 2D Animation', 'digital-art-animation', 'Palette', 'Vector drawing, character design, and frame-by-frame animation storytelling.', 5)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. USERS & PROFILES
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
ON CONFLICT (email) DO NOTHING;

-- Instructors Details
INSERT INTO instructors (id, profile_id, title, bio, specialties, rating, total_students) VALUES
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Head of Robotics & AI', 'Former MIT roboticist dedicated to making machine learning and spatial computing accessible to young minds.', ARRAY['Python', 'Robotics', 'Game AI', 'Scratch'], 4.96, 420),
('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'Master Educator & Creative Technologist', '12+ years curriculum designer specializing in interactive gamified programming and computational thinking for ages 6–12.', ARRAY['Block Coding', 'Python', 'Game Design', 'Interactive Math'], 4.98, 680)
ON CONFLICT DO NOTHING;

-- Parents Details
INSERT INTO parents (id, profile_id, emergency_contact, billing_address, notes) VALUES
('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', '+1 (555) 492-9900', '742 Evergreen Terrace, Seattle, WA', 'Prefers email updates on Friday afternoons.'),
('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000005', '+1 (555) 381-9988', '120 Innovation Way, Austin, TX', 'Interested in advance math and coding tracks.')
ON CONFLICT DO NOTHING;

-- Students Details
INSERT INTO students (id, profile_id, parent_id, date_of_birth, grade_level, school_name, interests, xp_points, badges_count) VALUES
('55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000001', '2016-04-12', '4th Grade', 'Lincoln Discovery Elementary', ARRAY['Robots', 'Minecraft Modding', 'Space'], 1250, 6),
('55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000002', '2015-08-25', '5th Grade', 'Austin Science Academy', ARRAY['Animation', 'Game Development', 'Drawing'], 840, 4),
('55555555-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000001', '2018-11-03', '2nd Grade', 'Lincoln Discovery Elementary', ARRAY['Storybooks', 'English Adventures', 'Drawing'], 450, 2)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. COURSES
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
    'Young Entrepreneurs: Launch Your First Business Idea',
    'young-entrepreneurs-mini-startup',
    'Turn passions into real mini-ventures! Learn product design, budgeting, branding, and persuasive pitch presentation.',
    'An empowering live interactive workshop series where kids turn their creative inventions and hobbies into viable mini-businesses. Students learn profit calculations, brand design, and deliver a shark-tank style graduation pitch.',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
    '11111111-0000-0000-0000-000000000003',
    '33333333-0000-0000-0000-000000000001',
    'live',
    199.00,
    'USD',
    10,
    16,
    12.0,
    'Beginner',
    'published',
    true,
    '["Develop an original product or service business model", "Create a logo, brand identity, and simple marketing flyer", "Calculate costs, revenues, and understand financial literacy", "Pitch to guest entrepreneurs during Graduation Demo Day"]'::jsonb,
    'Weekly weekend workshops: Saturdays at 11:00 AM EST.'
),
(
    '66666666-0000-0000-0000-000000000004',
    'Kids English & Storytelling Adventure',
    'kids-english-storytelling-adventure',
    'An animated magical quest through phonics, joyful vocabulary, and expressive reading for early learners.',
    'Designed for younger children ages 4 to 8, this course transforms reading into an enchanting fairy tale treasure hunt. Each lesson introduces phonetic sounds, story building blocks, and conversational speaking games.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200',
    '11111111-0000-0000-0000-000000000004',
    '33333333-0000-0000-0000-000000000002',
    'recorded',
    89.00,
    'USD',
    4,
    8,
    10.0,
    'Beginner',
    'published',
    false,
    '["Master 150+ essential vocabulary words through songs and games", "Gain conversational confidence in everyday English", "Construct imaginative original short fairy tales", "Pronunciation mastery with friendly voice coaches"]'::jsonb,
    'Bite-sized 10-minute video lessons perfect for young attention spans.'
),
(
    '66666666-0000-0000-0000-000000000005',
    'Digital Art & 2D Animation Academy',
    'digital-art-2d-animation-academy',
    'Bring drawings to life! Master digital illustration, color palettes, and frame-by-frame character animation.',
    'Young artists learn the digital canvas from scratch. From character sketching and dynamic poses to squash-and-stretch animation physics, students produce their own animated short scenes.',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200',
    '11111111-0000-0000-0000-000000000005',
    '33333333-0000-0000-0000-000000000002',
    'recorded',
    129.00,
    'USD',
    8,
    13,
    14.0,
    'Intermediate',
    'published',
    false,
    '["Create custom character illustrations and mood boards", "Learn keyframing and timing for realistic motion", "Produce a 15-second original cartoon scene with sound effects", "Export and share portfolio creations"]'::jsonb,
    'Self-paced on tablets or desktop drawing tablets.'
)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. MODULES & LESSONS (Focus on Course 1: Creative Coding)
-- ----------------------------------------------------------------------------
-- Module 1
INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES
('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Module 1: The Secret Language of Computers', 'Meet your coding avatar, understand algorithms, and write your very first sequence of instructions.', 1),
('77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'Module 2: Loops, Patterns & Superpowers', 'Why do computers love repeating things? Harness loops to build dazzling kaleidoscope designs and animations.', 2),
('77777777-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', 'Module 3: Game Physics & Space Blaster', 'Code gravity, bouncy obstacles, collision detectors, and high-score trackers.', 3)
ON CONFLICT DO NOTHING;

-- Lessons
INSERT INTO lessons (id, module_id, course_id, title, description, duration_minutes, order_index, is_free_preview) VALUES
('88888888-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Lesson 1.1: Welcome to Lernal & Your First Sprite', 'Explore the interactive editor, choose your character, and give it life with motion commands.', 12, 1, true),
('88888888-0000-0000-0000-000000000002', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Lesson 1.2: Coordinates: The Secret Map of the Screen', 'Understand the X and Y coordinate grid through a fun treasure-hunt mini-game.', 14, 2, false),
('88888888-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000001', 'Lesson 1.3: Events & Keystrokes: Making Characters Move', 'Wire arrow keys and click triggers to steer your space shuttle across the starry sky.', 16, 3, false),
('88888888-0000-0000-0000-000000000004', '77777777-0000-0000-0000-000000000001', 'Lesson 2.1: Forever Loops & Endless Run Dances', 'Build infinite loop choreographies and sound effects sync.', 15, 1, false),
('88888888-0000-0000-0000-000000000005', '77777777-0000-0000-0000-000000000001', 'Lesson 2.2: Conditional Logic: If-Then Magic', 'Teach your game when a character touches an apple or hits an asteroid obstacle.', 18, 2, false),
('88888888-0000-0000-0000-000000000006', '77777777-0000-0000-0000-000000000001', 'Lesson 3.1: Building the Asteroid Blaster Arcade Game', 'Combine collision checks, score counters, and game-over screens into a complete game.', 22, 1, false)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. BUNNY STREAM VIDEOS (Secure metadata)
-- ----------------------------------------------------------------------------
INSERT INTO videos (id, lesson_id, course_id, bunny_video_id, title, duration_seconds, thumbnail_url, preview_url, status) VALUES
('99999999-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'bunny_vid_lernal_101', 'Welcome to Lernal & Your First Sprite', 720, 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready'),
('99999999-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'bunny_vid_lernal_102', 'Coordinates: The Secret Map of the Screen', 840, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'ready'),
('99999999-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', 'bunny_vid_lernal_103', 'Events & Keystrokes', 960, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'ready')
ON CONFLICT DO NOTHING;

-- Lesson Resources
INSERT INTO lesson_resources (id, lesson_id, title, file_url, file_type, file_size_mb) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000001', 'Lernal Starter Sprite Pack & Cheat Sheet.pdf', 'https://lernal.edu/resources/sprite-pack-v1.pdf', 'pdf', 2.4),
('aaaaaaaa-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000002', 'X-Y Coordinates Grid Map Printable.pdf', 'https://lernal.edu/resources/xy-grid-map.pdf', 'pdf', 1.1)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ENROLLMENTS & PROGRESS
-- ----------------------------------------------------------------------------
INSERT INTO enrollments (id, student_id, parent_id, course_id, status, progress_percentage, enrolled_at) VALUES
('bbbbbbbb-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'active', 65.00, NOW() - INTERVAL '14 days'),
('bbbbbbbb-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002', 'active', 25.00, NOW() - INTERVAL '5 days'),
('bbbbbbbb-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000005', 'active', 40.00, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

INSERT INTO student_progress (id, student_id, lesson_id, course_id, is_completed, watch_time_seconds, completed_at) VALUES
('cccccccc-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', true, 720, NOW() - INTERVAL '12 days'),
('cccccccc-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', true, 840, NOW() - INTERVAL '8 days'),
('cccccccc-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', true, 960, NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- Achievements
INSERT INTO achievements (id, student_id, title, description, badge_icon) VALUES
('dddddddd-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', 'First Sprite Navigator', 'Created and commanded your very first animated character.', 'Rocket'),
('dddddddd-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', 'Coordinate Master', 'Solved all X-Y grid challenges without hitting a meteor!', 'Target'),
('dddddddd-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000001', 'Streak Champion: 5 Days', 'Logged in and completed lessons for 5 consecutive days.', 'Flame')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. LEADS CRM (Authentic leads in different pipeline stages)
-- ----------------------------------------------------------------------------
INSERT INTO leads (id, parent_name, child_name, email, phone, course_id, source, status, message, assigned_admin_id, next_follow_up_date) VALUES
(
    'eeeeeeee-0000-0000-0000-000000000001',
    'Jessica Parker',
    'Noah Parker (Age 9)',
    'jessica.parker@example.com',
    '+1 (555) 723-9011',
    '66666666-0000-0000-0000-000000000002',
    'Home Page Hero CTA',
    'new',
    'Noah loves tinkering with ChatGPT and Siri. Does the AI Explorers course require prior Python knowledge?',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '1 day'
),
(
    'eeeeeeee-0000-0000-0000-000000000002',
    'Robert Kim',
    'Chloe Kim (Age 11)',
    'robert.kim@innovate.org',
    '+1 (555) 834-2900',
    '66666666-0000-0000-0000-000000000003',
    'Course Details - Ask Button',
    'contacted',
    'Interested in the Young Entrepreneurs workshop. Can siblings attend together with one enrollment?',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '2 days'
),
(
    'eeeeeeee-0000-0000-0000-000000000003',
    'Amina Al-Mansoor',
    'Zayn Al-Mansoor (Age 8)',
    'amina.mansoor@qatar-health.qa',
    '+974 5512 8841',
    '66666666-0000-0000-0000-000000000001',
    'Social Media Campaign',
    'interested',
    'Looking for a weekend coding schedule that fits Gulf Standard Time.',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '3 days'
),
(
    'eeeeeeee-0000-0000-0000-000000000004',
    'Carlos Rodriguez',
    'Mateo Rodriguez (Age 12)',
    'carlos.rodriguez@techmail.com',
    '+1 (555) 612-4488',
    '66666666-0000-0000-0000-000000000001',
    'Referral from Eleanor Wright',
    'converted',
    'Mateo completed the preview lesson and was super excited. Proceeding with enrollment!',
    '22222222-0000-0000-0000-000000000001',
    NULL
),
(
    'eeeeeeee-0000-0000-0000-000000000005',
    'Emily Thornton',
    'Liam Thornton (Age 5)',
    'emily.thornton@gmail.com',
    '+1 (555) 902-3312',
    '66666666-0000-0000-0000-000000000004',
    'Organic Search',
    'follow_up',
    'Needs advice on whether tablet or laptop is recommended for 5-year-olds.',
    '22222222-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '1 day'
)
ON CONFLICT DO NOTHING;

-- Lead Notes
INSERT INTO lead_notes (id, lead_id, admin_id, note) VALUES
('ffffffff-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Spoke on the phone for 10 mins. Explained sibling discount policy (20% off second student). Robert was very impressed with Dr. Marcus credentials.'),
('ffffffff-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 'Lead converted successfully. Created enrollment TXN-2026-004.')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. TRANSACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO transactions (id, reference_no, student_id, parent_id, course_id, amount, currency, payment_method, payment_status, created_at) VALUES
('10101010-0000-0000-0000-000000000001', 'TXN-2026-8910', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 149.00, 'USD', 'Apple Pay', 'paid', NOW() - INTERVAL '14 days'),
('10101010-0000-0000-0000-000000000002', 'TXN-2026-8911', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002', 249.00, 'USD', 'Credit Card (Visa)', 'paid', NOW() - INTERVAL '5 days'),
('10101010-0000-0000-0000-000000000003', 'TXN-2026-8912', '55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000005', 129.00, 'USD', 'Credit Card (Mastercard)', 'paid', NOW() - INTERVAL '10 days'),
('10101010-0000-0000-0000-000000000004', 'TXN-2026-8913', NULL, '44444444-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000003', 199.00, 'USD', 'PayPal', 'pending', NOW() - INTERVAL '1 day'),
('10101010-0000-0000-0000-000000000005', 'TXN-2026-8914', NULL, NULL, '66666666-0000-0000-0000-000000000004', 89.00, 'USD', 'Credit Card', 'refunded', NOW() - INTERVAL '22 days')
ON CONFLICT (reference_no) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. TESTING & QUIZZES
-- ----------------------------------------------------------------------------
INSERT INTO tests (id, course_id, module_id, title, description, passing_score, time_limit_minutes, max_attempts) VALUES
('20202020-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', 'Level 1 Checkpoint: Space Cadet Coding Quest', 'Test your understanding of sprite coordinates, sequence directions, and keyboard triggers.', 75, 15, 3)
ON CONFLICT DO NOTHING;

-- Questions for Quiz 1
INSERT INTO test_questions (id, test_id, question_text, question_type, points, explanation, order_index) VALUES
('30303030-0000-0000-0000-000000000001', '20202020-0000-0000-0000-000000000001', 'What happens if you change a sprite''s X coordinate by +50?', 'single_choice', 25, 'Positive X values move characters horizontally to the RIGHT on the coordinate screen.', 1),
('30303030-0000-0000-0000-000000000002', '20202020-0000-0000-0000-000000000001', 'Which block makes an action repeat forever until the game stops?', 'single_choice', 25, 'A "Forever" loop continually repeats code inside it.', 2),
('30303030-0000-0000-0000-000000000003', '20202020-0000-0000-0000-000000000001', 'True or False: A computer reads instructions from bottom to top by default.', 'true_false', 25, 'False! Computers read instructions line-by-line sequentially from top to bottom.', 3),
('30303030-0000-0000-0000-000000000004', '20202020-0000-0000-0000-000000000001', 'Which of the following can trigger an event in your game?', 'multiple_choice', 25, 'Key presses, mouse clicks, and touching colors/sprites are all valid triggers.', 4)
ON CONFLICT DO NOTHING;

-- Answers
INSERT INTO test_answers (id, question_id, answer_text, is_correct, order_index) VALUES
('40404040-0000-0000-0000-000000000001', '30303030-0000-0000-0000-000000000001', 'The sprite moves to the RIGHT', true, 1),
('40404040-0000-0000-0000-000000000002', '30303030-0000-0000-0000-000000000001', 'The sprite moves to the LEFT', false, 2),
('40404040-0000-0000-0000-000000000003', '30303030-0000-0000-0000-000000000001', 'The sprite moves UP', false, 3),

('40404040-0000-0000-0000-000000000004', '30303030-0000-0000-0000-000000000002', 'Forever Loop block', true, 1),
('40404040-0000-0000-0000-000000000005', '30303030-0000-0000-0000-000000000002', 'Wait 1 Second block', false, 2),
('40404040-0000-0000-0000-000000000006', '30303030-0000-0000-0000-000000000002', 'Say Hello block', false, 3),

('40404040-0000-0000-0000-000000000007', '30303030-0000-0000-0000-000000000003', 'True', false, 1),
('40404040-0000-0000-0000-000000000008', '30303030-0000-0000-0000-000000000003', 'False', true, 2),

('40404040-0000-0000-0000-000000000009', '30303030-0000-0000-0000-000000000004', 'Pressing the Spacebar', true, 1),
('40404040-0000-0000-0000-000000000010', '30303030-0000-0000-0000-000000000004', 'Clicking on the Green Flag', true, 2),
('40404040-0000-0000-0000-000000000011', '30303030-0000-0000-0000-000000000004', 'Turning off the computer screen', false, 3)
ON CONFLICT DO NOTHING;

-- Sample Student Attempt
INSERT INTO test_attempts (id, test_id, student_id, attempt_number, score, max_score, percentage, passed, started_at, completed_at, answers_summary) VALUES
('50505050-0000-0000-0000-000000000001', '20202020-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', 1, 100, 100, 100.00, true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes', '{"correct": 4, "total": 4}'::jsonb)
ON CONFLICT DO NOTHING;
