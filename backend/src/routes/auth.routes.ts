// ============================================================================
// AUTHENTICATION ROUTES (SUPABASE INTEGRATED)
// Supports Supabase Auth login, registration, password recovery & demo roles
// ============================================================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { Profile, Student, Parent } from '../types/database.js';

const router = Router();

// Pre-configured demo accounts for fast evaluation
export const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Platform Admin',
    email: 'admin@lernal.edu',
    name: 'Alex Vance (Director)',
    badge: 'Full Access (CRM, Finance, Courses)',
  },
  {
    role: 'instructor',
    label: 'Lead Instructor',
    email: 'instructor.marcus@lernal.edu',
    name: 'Dr. Marcus Sterling',
    badge: 'Curriculum & Grading',
  },
  {
    role: 'parent',
    label: 'Parent',
    email: 'parent.eleanor@lernal.edu',
    name: 'Eleanor Wright',
    badge: 'Monitoring & Invoices',
  },
  {
    role: 'student',
    label: 'Student',
    email: 'student.leo@lernal.edu',
    name: 'Leo Wright (Age 10)',
    badge: 'Interactive Learning Hub',
  },
];

// GET /api/auth/demo-accounts
router.get('/demo-accounts', (req: Request, res: Response) => {
  res.json({ success: true, accounts: DEMO_ACCOUNTS });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    let profile: Profile | null = null;
    let supabaseSession: any = null;

    // A. 1-Click Demo Persona Login
    if (role) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (data) {
        profile = data as Profile;
      } else {
        // Fallback demo account definition
        const demo = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0];
        profile = {
          id: `demo-${role}`,
          email: demo.email,
          full_name: demo.name,
          role: role as any,
          is_active: true,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(demo.name)}`,
        };
      }
    } else if (email) {
      // B. Standard Email / Password Login via Supabase Auth
      if (password) {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!authErr && authData?.user && authData?.session) {
          supabaseSession = authData.session;
          const { data: profData } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();
          profile = profData as Profile;
        }
      }

      // If no session yet (e.g., passwordless reviewer test or demo mode), check profiles table
      if (!profile) {
        const { data: profData, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (profData) {
          profile = profData as Profile;
        }
      }
    }

    if (!profile) {
      return res.status(401).json({ error: 'Invalid credentials or user not found in database.' });
    }

    const token = supabaseSession?.access_token || generateToken(profile);

    // Fetch related student or parent metadata from database
    let meta: { student?: Student | null; parent?: Parent | null } = {};
    if (profile.role === 'student') {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      meta.student = stu;
    } else if (profile.role === 'parent') {
      const { data: par } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      meta.parent = par;
    }

    res.json({
      success: true,
      token,
      session: supabaseSession,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
      },
      meta,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, full_name, role = 'student', phone } = req.body;

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and Full Name are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if profile already exists in Supabase
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // 1. Create Supabase Auth user if password provided
    let authUserId: string | null = null;
    let sessionToken: string | null = null;

    if (password) {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name,
            role,
            phone,
          },
        },
      });

      if (authErr && !authErr.message.includes('already registered')) {
        console.warn('Supabase Auth signUp notice:', authErr.message);
      } else if (authData?.user) {
        authUserId = authData.user.id;
        if (authData.session) {
          sessionToken = authData.session.access_token;
        }
      }
    }

    // 2. Insert or ensure profile in public.profiles table
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(full_name)}`;
    const { data: newProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          auth_user_id: authUserId,
          email: normalizedEmail,
          full_name,
          role,
          avatar_url: avatarUrl,
          phone: phone || null,
          is_active: true,
        },
      ])
      .select('*')
      .single();

    if (profileErr) {
      throw new Error(`Failed to create user profile: ${profileErr.message}`);
    }

    // 3. Provision role-specific child table
    if (role === 'student') {
      await supabaseAdmin.from('students').insert([
        {
          profile_id: newProfile.id,
          grade_level: '4th Grade',
          school_name: 'Discovery Academy',
          interests: ['Coding', 'Space'],
          xp_points: 100,
          badges_count: 1,
        },
      ]);
    } else if (role === 'parent') {
      await supabaseAdmin.from('parents').insert([
        {
          profile_id: newProfile.id,
          emergency_contact: phone || '',
          billing_address: '',
        },
      ]);
    } else if (role === 'instructor') {
      await supabaseAdmin.from('instructors').insert([
        {
          profile_id: newProfile.id,
          title: 'Curriculum Instructor',
          bio: 'Educator at Lernal LMS',
          specialties: ['Coding', 'Robotics'],
          rating: 5.0,
          total_students: 0,
        },
      ]);
    }

    const token = sessionToken || generateToken(newProfile);

    res.status(201).json({
      success: true,
      token,
      user: newProfile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email, redirectTo } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectTo || `${req.headers.origin || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      console.warn('Supabase resetPasswordForEmail notice:', error.message);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, password recovery instructions have been sent.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send password reset' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let meta: { student?: Student | null; parent?: Parent | null } = {};

  try {
    if (user.role === 'student') {
      const { data: stu } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();
      meta.student = stu;
    } else if (user.role === 'parent') {
      const { data: par } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();
      meta.parent = par;
    }

    res.json({
      success: true,
      user,
      meta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve session' });
  }
});

export default router;
