// ============================================================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, Profile } from '../data/mockDatabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lernal_super_secret_jwt_key_since_2026_kid_safe';

export interface AuthenticatedRequest extends Request {
  user?: Profile;
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

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const profile = db.profiles.find((p) => p.id === decoded.id);

    if (!profile || !profile.is_active) {
      return res.status(401).json({ error: 'User profile not found or inactive' });
    }

    req.user = profile;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication: attaches user if valid token present, otherwise proceeds
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const profile = db.profiles.find((p) => p.id === decoded.id);
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
export function requireRole(allowedRoles: Array<'admin' | 'instructor' | 'student' | 'parent'>) {
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
