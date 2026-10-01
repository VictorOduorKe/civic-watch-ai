import jwt from 'jsonwebtoken';
import { getUserById } from '../services/authService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_in_production_min32chars';

/**
 * Authentication verification middleware.
 * Verifies JWT from Authorization header (Bearer <token>) or cookies.
 * Attaches verified user profile to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.cookie) {
      // Check cookie if present
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    // Verify JWT signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      const isExpired = jwtErr.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? 'Authentication token has expired. Please log in again.' : 'Invalid authentication token.'
      });
    }

    // Retrieve fresh user from database to ensure account is active and exists
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware.
 * @param {...string} allowedRoles - List of permitted roles (e.g. 'Admin', 'Moderator')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    next();
  };
}

export default { requireAuth, requireRole };
