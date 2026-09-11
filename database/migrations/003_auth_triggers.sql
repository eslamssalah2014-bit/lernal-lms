-- ============================================================================
-- LERNAL LMS - MIGRATION 003: SUPABASE AUTH SYNCHRONIZATION TRIGGERS
-- Automatically provisions profiles, student/parent records on Supabase Auth events
-- ============================================================================

-- Function triggered on new Supabase auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_full_name TEXT;
    user_avatar TEXT;
    user_phone TEXT;
    new_profile_id UUID;
BEGIN
    -- Extract metadata supplied during signUp
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        'https://api.dicebear.com/7.x/bottts/svg?seed=' || encode(digest(NEW.email, 'sha256'), 'hex')
    );

    -- Ensure role exists in roles table
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id = user_role) THEN
        user_role := 'student';
    END IF;

    -- Upsert profile record linked to auth.users
    INSERT INTO public.profiles (auth_user_id, email, full_name, role, avatar_url, phone, is_active)
    VALUES (NEW.id, NEW.email, user_full_name, user_role, user_avatar, user_phone, true)
    ON CONFLICT (email) DO UPDATE SET
        auth_user_id = NEW.id,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        updated_at = NOW()
    RETURNING id INTO new_profile_id;

    -- Automatically provision specific role entity
    IF user_role = 'student' THEN
        INSERT INTO public.students (profile_id, grade_level, school_name, xp_points, badges_count)
        VALUES (new_profile_id, '4th Grade', 'Discovery Academy', 100, 1)
        ON CONFLICT (profile_id) DO NOTHING;
    ELSIF user_role = 'parent' THEN
        INSERT INTO public.parents (profile_id, emergency_contact, notes)
        VALUES (new_profile_id, user_phone, 'Account created via Lernal Portal')
        ON CONFLICT (profile_id) DO NOTHING;
    ELSIF user_role = 'instructor' THEN
        INSERT INTO public.instructors (profile_id, title, bio, rating)
        VALUES (new_profile_id, 'Course Instructor', 'Educator at Lernal LMS', 5.00)
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    -- Create welcoming notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        new_profile_id,
        'Welcome to Lernal LMS! 🚀',
        'Your learning journey starts here. Explore our interactive courses, tests, and gamified challenges!',
        'success'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table in Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
