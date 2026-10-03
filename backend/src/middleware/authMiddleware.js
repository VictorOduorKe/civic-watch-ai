import jwt from 'jsonwebtoken';
import { getUserById } from '../services/authService.js';
import { AUTH_COOKIE_NAME } from '../config/authCookie.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_in_production_min32chars';

/**
 * Authentication verification middleware.
 * Verifies JWT from HttpOnly cookie (primary) or Bearer header (fallback for CLI/tools).
 * Attaches verified user profile to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Primary: Retrieve JWT from HttpOnly secure cookie
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Secondary fallback for CLI tools and automated API testing
      token = req.headers.authorization.substring(7).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // 2. Verify JWT signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      const isExpired = jwtErr.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? 'Authentication session has expired. Please log in again.' : 'Invalid authentication credential.'
      });
    }

    // 3. Retrieve user from database to ensure account is active and exists
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
    }

    // 4. Attach verified user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

import auditService from '../services/auditService.js';
import securityMonitoringService from '../services/securityMonitoringService.js';

/**
 * Role-based authorization middleware.
 * @param {...string} allowedRoles - List of permitted roles (e.g. 'Admin', 'Moderator')
 */
export function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      // Record unauthorized attempt asynchronously
      auditService.recordAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'API_ENDPOINT',
        resourceId: req.originalUrl,
        outcome: 'DENIED',
        severity: 'WARNING',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          attemptedUrl: req.originalUrl,
          requiredRoles: roles,
          userRole: req.user.role
        }
      }).catch(() => {});

      securityMonitoringService.evaluateUnauthorizedBurst({
        ipAddress: req.ip,
        userId: req.user.id,
        resourceType: req.originalUrl
      }).catch(() => {});

      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    next();
  };
}

export default { requireAuth, requireRole };
