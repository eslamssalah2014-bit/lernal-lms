// ============================================================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
// Validates Supabase Auth JWT tokens and maps to public.profiles
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../services/supabase.js';
import { Profile, UserRole } from '../types/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lernal_super_secret_jwt_key_since_2026_kid_safe';

export interface AuthenticatedRequest extends Request {
  user?: Profile;
  supabaseUser?: any;
}

export function generateToken(profile: Profile): string {
  return jwt.sign(
    {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Resolves user profile from Supabase profiles table using auth_user_id or email
 */
async function resolveProfile(authUserId?: string, email?: string, profileId?: string): Promise<Profile | null> {
  try {
    let query = supabaseAdmin.from('profiles').select('*');

    if (authUserId) {
      const { data, error } = await query.eq('auth_user_id', authUserId).maybeSingle();
      if (!error && data) return data as Profile;
    }

    if (profileId) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', profileId).maybeSingle();
      if (!error && data) return data as Profile;
    }

    if (email) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (!error && data) return data as Profile;
    }

    return null;
  } catch (err) {
    console.error('Error resolving profile from Supabase:', err);
    return null;
  }
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try Supabase Auth Token verification
    const { data: { user: sbUser }, error: sbError } = await supabaseAdmin.auth.getUser(token);

    if (!sbError && sbUser) {
      req.supabaseUser = sbUser;
      const profile = await resolveProfile(sbUser.id, sbUser.email);
      if (profile && profile.is_active) {
        req.user = profile;
        return next();
      }
      if (profile && !profile.is_active) {
        return res.status(403).json({ error: 'User account is inactive or suspended' });
      }

      // If user exists in auth.users but not in profiles yet (e.g. trigger lag), create or synthetic profile
      const newProfile: Profile = {
        id: sbUser.id,
        auth_user_id: sbUser.id,
        email: sbUser.email || '',
        full_name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Lernal User',
        role: (sbUser.user_metadata?.role as UserRole) || 'student',
        avatar_url: sbUser.user_metadata?.avatar_url || null,
        phone: sbUser.user_metadata?.phone || null,
        is_active: true,
      };

      // Upsert profile
      await supabaseAdmin.from('profiles').upsert([newProfile], { onConflict: 'email' });
      req.user = newProfile;
      return next();
    }

    // 2. Fallback to server-issued JWT token (used for demo switches and backward compatibility)
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const profile = await resolveProfile(undefined, decoded.email, decoded.id);

    if (!profile || !profile.is_active) {
      // Fallback synthetic profile from decoded payload if database record is provisioning
      if (decoded.id && decoded.email && decoded.role) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          full_name: decoded.full_name || decoded.email.split('@')[0],
          role: decoded.role,
          is_active: true,
        };
        return next();
      }
      return res.status(401).json({ error: 'User profile not found or inactive' });
    }

    req.user = profile;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

/**
 * Optional authentication: attaches user if valid token present, otherwise proceeds unauthenticated
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user: sbUser }, error: sbError } = await supabaseAdmin.auth.getUser(token);
    if (!sbError && sbUser) {
      req.supabaseUser = sbUser;
      const profile = await resolveProfile(sbUser.id, sbUser.email);
      if (profile && profile.is_active) {
        req.user = profile;
        return next();
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const profile = await resolveProfile(undefined, decoded.email, decoded.id);
    if (profile && profile.is_active) {
      req.user = profile;
    }
  } catch (e) {
    // Proceed unauthenticated
  }
  next();
}

/**
 * Role guard middleware
 */
export function requireRole(allowedRoles: Array<UserRole>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden. Role '${req.user.role}' lacks sufficient permissions.`,
      });
    }

    next();
  };
}

export const requireAdmin = requireRole(['admin']);
export const requireInstructorOrAdmin = requireRole(['admin', 'instructor']);
export const requireStudent = requireRole(['student', 'admin']);
export const requireParent = requireRole(['parent', 'admin']);
