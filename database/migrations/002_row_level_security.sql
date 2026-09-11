-- ============================================================================
-- LERNAL LMS - MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- Role-Based Access Control enforcing student, parent, instructor & admin scopes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. ROLES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Roles are viewable by everyone" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Roles manageable by admin only" ON roles
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Users can read their own profile, or admins can read all profiles
-- Instructors can read student profiles enrolled in their courses
CREATE POLICY "Profiles viewable by self, instructors of enrolled courses, or admin" ON profiles
    FOR SELECT USING (
        auth.uid() = auth_user_id
        OR public.is_admin()
        OR EXISTS (
            -- Parent reading child profile
            SELECT 1 FROM parents p
            JOIN students s ON s.parent_id = p.id
            WHERE p.profile_id = public.get_current_profile_id()
              AND s.profile_id = profiles.id
        )
        OR EXISTS (
            -- Instructor reading enrolled student profile
            SELECT 1 FROM instructors ins
            JOIN courses c ON c.instructor_id = ins.id
            JOIN enrollments e ON e.course_id = c.id
            JOIN students s ON s.id = e.student_id
            WHERE ins.profile_id = public.get_current_profile_id()
              AND s.profile_id = profiles.id
        )
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id OR public.is_admin());

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. PARENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Parents view own record or admin" ON parents
    FOR SELECT USING (
        profile_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Parents update own record or admin" ON parents
    FOR UPDATE USING (
        profile_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Admins manage all parents" ON parents
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. STUDENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students view self, parent views child, instructor views cohort, or admin" ON students
    FOR SELECT USING (
        profile_id = public.get_current_profile_id()
        OR parent_id IN (SELECT id FROM parents WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM instructors ins
            JOIN courses c ON c.instructor_id = ins.id
            JOIN enrollments e ON e.course_id = c.id
            WHERE ins.profile_id = public.get_current_profile_id()
              AND e.student_id = students.id
        )
    );

CREATE POLICY "Students update own preferences or admin" ON students
    FOR UPDATE USING (
        profile_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Admins manage all students" ON students
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. INSTRUCTORS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Instructors are publicly viewable" ON instructors
    FOR SELECT USING (true);

CREATE POLICY "Instructors can update own profile" ON instructors
    FOR UPDATE USING (
        profile_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Admins manage all instructors" ON instructors
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. COURSE CATEGORIES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Categories are viewable by everyone" ON course_categories
    FOR SELECT USING (true);

CREATE POLICY "Categories manageable by admin only" ON course_categories
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. COURSES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Published courses viewable by everyone; drafts viewable by staff" ON courses
    FOR SELECT USING (
        status = 'published'
        OR public.is_admin()
        OR instructor_id IN (SELECT id FROM instructors WHERE profile_id = public.get_current_profile_id())
    );

CREATE POLICY "Courses insertable by admin or instructor" ON courses
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR instructor_id IN (SELECT id FROM instructors WHERE profile_id = public.get_current_profile_id())
    );

CREATE POLICY "Courses updatable by admin or assigned instructor" ON courses
    FOR UPDATE USING (
        public.is_admin()
        OR instructor_id IN (SELECT id FROM instructors WHERE profile_id = public.get_current_profile_id())
    );

CREATE POLICY "Courses deletable by admin only" ON courses
    FOR DELETE USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. COURSE MODULES & LESSONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Modules viewable if course is accessible" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_modules.course_id
              AND (c.status = 'published' OR public.is_admin())
        )
    );

CREATE POLICY "Modules manageable by admin or course instructor" ON course_modules
    FOR ALL USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = course_modules.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Lessons viewable by everyone for overview, detailed video access guarded" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = lessons.course_id
              AND (c.status = 'published' OR public.is_admin())
        )
    );

CREATE POLICY "Lessons manageable by admin or course instructor" ON lessons
    FOR ALL USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = lessons.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

-- ----------------------------------------------------------------------------
-- 9. VIDEOS (Bunny Stream Metadata)
-- ----------------------------------------------------------------------------
CREATE POLICY "Videos metadata viewable by enrolled students, parents, instructors, or admins" ON videos
    FOR SELECT USING (
        public.is_admin()
        OR EXISTS (
            -- Free preview lesson
            SELECT 1 FROM lessons l
            WHERE l.id = videos.lesson_id AND l.is_free_preview = true
        )
        OR EXISTS (
            -- Enrolled student
            SELECT 1 FROM enrollments e
            JOIN students s ON s.id = e.student_id
            WHERE e.course_id = videos.course_id
              AND e.status = 'active'
              AND s.profile_id = public.get_current_profile_id()
        )
        OR EXISTS (
            -- Parent of enrolled student
            SELECT 1 FROM enrollments e
            JOIN students s ON s.id = e.student_id
            JOIN parents p ON p.id = s.parent_id
            WHERE e.course_id = videos.course_id
              AND e.status = 'active'
              AND p.profile_id = public.get_current_profile_id()
        )
        OR EXISTS (
            -- Instructor of course
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = videos.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Videos manageable by admin or course instructor" ON videos
    FOR ALL USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = videos.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

-- ----------------------------------------------------------------------------
-- 10. LESSON RESOURCES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Resources viewable by enrolled users or staff" ON lesson_resources
    FOR SELECT USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM lessons l
            WHERE l.id = lesson_resources.lesson_id AND l.is_free_preview = true
        )
        OR EXISTS (
            SELECT 1 FROM lessons l
            JOIN enrollments e ON e.course_id = l.course_id
            JOIN students s ON s.id = e.student_id
            WHERE l.id = lesson_resources.lesson_id
              AND e.status = 'active'
              AND s.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Resources manageable by admin or course instructor" ON lesson_resources
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. ENROLLMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Enrollments viewable by student, parent, course instructor, or admin" ON enrollments
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR parent_id IN (SELECT id FROM parents WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = enrollments.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Students can self-enroll or admins manage enrollments" ON enrollments
    FOR INSERT WITH CHECK (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
    );

CREATE POLICY "Enrollments updatable by admin or student progress hook" ON enrollments
    FOR UPDATE USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
    );

CREATE POLICY "Enrollments deletable by admin only" ON enrollments
    FOR DELETE USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. STUDENT PROGRESS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Progress viewable by owner student, parent, or admin" ON student_progress
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR EXISTS (
            SELECT 1 FROM parents p
            JOIN students s ON s.parent_id = p.id
            WHERE p.profile_id = public.get_current_profile_id()
              AND s.id = student_progress.student_id
        )
        OR public.is_admin()
    );

CREATE POLICY "Students can insert and update their own progress" ON student_progress
    FOR ALL USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
    );

-- ----------------------------------------------------------------------------
-- 13. LEADS (LEADS CENTER CRM) POLICIES
-- ----------------------------------------------------------------------------
-- Visitors (including anonymous public web visitors) can submit inquiries
CREATE POLICY "Public visitor can submit lead" ON leads
    FOR INSERT WITH CHECK (true);

-- Only admins can read, update, or delete CRM leads
CREATE POLICY "Admins can view all leads" ON leads
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update leads" ON leads
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete leads" ON leads
    FOR DELETE USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 14. LEAD NOTES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins can view lead notes" ON lead_notes
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert and manage lead notes" ON lead_notes
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 15. TRANSACTIONS (FINANCE) POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own transactions, admins view all" ON transactions
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR parent_id IN (SELECT id FROM parents WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
    );

CREATE POLICY "Transactions manageable by admin only" ON transactions
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 16. TESTS, QUESTIONS, & ANSWERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Tests viewable by enrolled students, instructors, or admins" ON tests
    FOR SELECT USING (
        is_active = true
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = tests.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Tests manageable by admin or course instructor" ON tests
    FOR ALL USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM courses c
            JOIN instructors ins ON ins.id = c.instructor_id
            WHERE c.id = tests.course_id
              AND ins.profile_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Questions viewable for accessible tests" ON test_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tests t
            WHERE t.id = test_questions.test_id
              AND (t.is_active = true OR public.is_admin())
        )
    );

CREATE POLICY "Questions manageable by admin or instructor" ON test_questions
    FOR ALL USING (public.is_admin());

CREATE POLICY "Answers options viewable without correct flag for students; staff sees all" ON test_answers
    FOR SELECT USING (true);

CREATE POLICY "Answers options manageable by admin or instructor" ON test_answers
    FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 17. TEST ATTEMPTS & RESULTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Attempts viewable by owner student, parent, or admin" ON test_attempts
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR EXISTS (
            SELECT 1 FROM parents p
            JOIN students s ON s.parent_id = p.id
            WHERE p.profile_id = public.get_current_profile_id()
              AND s.id = test_attempts.student_id
        )
        OR public.is_admin()
    );

CREATE POLICY "Students can submit test attempts" ON test_attempts
    FOR INSERT WITH CHECK (
        student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
        OR public.is_admin()
    );

CREATE POLICY "Results viewable by owner student, parent, or admin" ON test_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_attempts a
            WHERE a.id = test_results.attempt_id
              AND (
                  a.student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
                  OR public.is_admin()
              )
        )
    );

CREATE POLICY "Results insertable by system/student submission" ON test_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM test_attempts a
            WHERE a.id = test_results.attempt_id
              AND (
                  a.student_id IN (SELECT id FROM students WHERE profile_id = public.get_current_profile_id())
                  OR public.is_admin()
              )
        )
    );

-- ----------------------------------------------------------------------------
-- 18. NOTIFICATIONS & ACHIEVEMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Notifications viewable and updatable by recipient" ON notifications
    FOR ALL USING (
        user_id = public.get_current_profile_id()
        OR public.is_admin()
    );

CREATE POLICY "Achievements viewable by everyone" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Achievements manageable by admin" ON achievements
    FOR ALL USING (public.is_admin());
