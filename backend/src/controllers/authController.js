import { registerUser, loginUser } from '../services/authService.js';
import {
  setAuthCookie,
  clearAuthCookie,
  setCsrfCookie,
  clearCsrfCookie,
  generateCsrfToken
} from '../config/authCookie.js';

/**
 * POST /api/auth/register
 * Creates new Citizen account, sets HttpOnly auth cookie, and issues CSRF token.
 * Never returns the JWT in JSON.
 */
export async function register(req, res, next) {
  try {
    const { fullName, email, phone, password, county, ward } = req.body;

    const { user, token } = await registerUser({
      fullName,
      email,
      phone,
      password,
      county,
      ward
    });

    // Set HttpOnly auth cookie
    setAuthCookie(res, token);

    // Issue CSRF cookie
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
}

import auditService from '../services/auditService.js';
import securityMonitoringService from '../services/securityMonitoringService.js';

/**
 * POST /api/auth/login
 * Verifies credentials, sets HttpOnly auth cookie, and issues CSRF token.
 * Never returns the JWT in JSON.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser({ email, password });

    // Set HttpOnly auth cookie
    setAuthCookie(res, token);

    // Issue CSRF cookie
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    // Audit successful login
    await auditService.recordAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'SESSION',
      resourceId: String(user.id),
      outcome: 'SUCCESS',
      severity: 'INFO',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('[AuthAudit] Failed to log login:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user
    });
  } catch (error) {
    // Audit failed login attempt
    const attemptedEmail = req.body?.email || 'unknown';
    await auditService.recordAuditEvent({
      actorId: null,
      actorEmail: attemptedEmail,
      actorRole: 'ANONYMOUS',
      action: 'USER_LOGIN',
      resourceType: 'SESSION',
      outcome: 'FAILURE',
      severity: 'WARNING',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { reason: error.message }
    }).catch(() => {});

    // Evaluate for failed login intrusion detection
    securityMonitoringService.evaluateFailedLogin({
      email: attemptedEmail,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(() => {});

    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Clears HttpOnly auth cookie and CSRF cookie.
 */
export async function logout(req, res, next) {
  try {
    if (req.user) {
      await auditService.recordAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'USER_LOGOUT',
        resourceType: 'SESSION',
        resourceId: String(req.user.id),
        outcome: 'SUCCESS',
        severity: 'INFO',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }).catch(() => {});
    }

    clearAuthCookie(res);
    clearCsrfCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user's profile via HttpOnly cookie.
 */
export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/csrf-token
 * Issues a fresh CSRF token cookie and returns it.
 */
export async function getCsrfToken(req, res, next) {
  try {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      success: true,
      csrfToken
    });
  } catch (error) {
    next(error);
  }
}

export default { register, login, logout, getMe, getCsrfToken };
