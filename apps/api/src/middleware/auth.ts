/**
 * Express middleware — verifies Firebase ID-token from the Authorization header.
 *
 * • Extracts `Bearer <token>` from the header.
 * • Verifies with Firebase Admin (checks expiry, signature, revocation).
 * • Attaches decoded claims to `req.user`.
 * • Returns 401/403 on failure.
 */
import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../lib/firebase';
import type { AuthUser, UserRole } from '@venuexp/shared';

// Extend Express Request to carry user data
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Authenticate — any valid token (including anonymous).
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  try {
    const decoded = await firebaseAuth.verifyIdToken(token, true /* checkRevoked */);
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      role: (decoded.role as UserRole) ?? 'fan',
      isAnonymous: decoded.firebase?.sign_in_provider === 'anonymous',
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Authorise by role — must be chained after requireAuth.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
