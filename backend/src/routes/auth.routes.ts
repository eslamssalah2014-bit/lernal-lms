// ============================================================================
// AUTHENTICATION ROUTES
// Supports standard login, registration, and 1-click demo role switching
// ============================================================================

import { Router, Request, Response } from 'express';
import { db, Profile } from '../data/mockDatabase.js';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Pre-configured demo accounts for seamless reviewer testing
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
router.post('/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email or by requested demo role
  let user: Profile | undefined;
  if (role) {
    user = db.profiles.find((p) => p.role === role);
  } else {
    user = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or credentials' });
  }

  const token = generateToken(user);

  // If student, attach student details; if parent, attach parent details
  let meta: any = {};
  if (user.role === 'student') {
    meta.student = db.students.find((s) => s.profile_id === user!.id);
  } else if (user.role === 'parent') {
    meta.parent = db.parents.find((p) => p.profile_id === user!.id);
  }

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
    },
    meta,
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { email, full_name, role = 'student', phone, parent_email } = req.body;

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and Full Name are required' });
  }

  const existing = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newProfile: Profile = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    email,
    full_name,
    role: role as any,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(full_name)}`,
    phone,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.profiles.push(newProfile);

  if (role === 'student') {
    db.students.push({
      id: `stu-${Date.now()}`,
      profile_id: newProfile.id,
      date_of_birth: '2016-01-01',
      grade_level: '4th Grade',
      school_name: 'Elementary Discovery School',
      interests: ['Coding', 'Space'],
      xp_points: 100,
      badges_count: 1,
    });
  } else if (role === 'parent') {
    db.parents.push({
      id: `par-${Date.now()}`,
      profile_id: newProfile.id,
      emergency_contact: phone || '',
      billing_address: '',
    });
  }

  const token = generateToken(newProfile);

  res.status(201).json({
    success: true,
    token,
    user: newProfile,
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let meta: any = {};
  if (user.role === 'student') {
    meta.student = db.students.find((s) => s.profile_id === user.id);
  } else if (user.role === 'parent') {
    meta.parent = db.parents.find((p) => p.profile_id === user.id);
  }

  res.json({
    success: true,
    user,
    meta,
  });
});

export default router;
