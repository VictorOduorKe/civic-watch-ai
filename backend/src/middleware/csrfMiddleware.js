import { CSRF_COOKIE_NAME, generateCsrfToken, setCsrfCookie } from '../config/authCookie.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Robust CSRF Protection Middleware for SPA + Cookie Authentication.
 * 
 * Implements:
 * 1. Origin / Referer Verification against allowed FRONTEND_URL.
 * 2. Double-Submit Cookie verification on state-changing requests (POST, PUT, PATCH, DELETE).
 * 3. Automatic issuance of CSRF cookie on safe requests if missing.
 */
export function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();

  // 1. Ensure CSRF cookie is set on safe requests if not already present
  if (SAFE_METHODS.has(method)) {
    if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
      const newCsrfToken = generateCsrfToken();
      setCsrfCookie(res, newCsrfToken);
    }
    return next();
  }

  // 2. Validate Origin / Referer for state-changing requests
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  let allowedOrigin;
  try {
    allowedOrigin = new URL(frontendUrl).origin;
  } catch {
    allowedOrigin = 'http://localhost:5173';
  }

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;

  if (originHeader) {
    if (originHeader !== allowedOrigin) {
      return res.status(403).json({
        success: false,
        message: 'CSRF validation failed: Invalid request origin.'
      });
    }
  } else if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (refererOrigin !== allowedOrigin) {
        return res.status(403).json({
          success: false,
          message: 'CSRF validation failed: Invalid referer origin.'
        });
      }
    } catch {
      return res.status(403).json({
        success: false,
        message: 'CSRF validation failed: Malformed referer.'
      });
    }
  }

  // 3. Double-Submit Cookie validation
  // If the client has a CSRF cookie or is making an authenticated request, enforce header match
  const csrfCookie = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;
  const csrfHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  // Skip token match check only for initial unauthenticated login/register if no CSRF cookie exists yet
  const isAuthIntake = req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/register';

  if (!isAuthIntake || csrfCookie) {
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({
        success: false,
        message: 'CSRF validation failed: Missing or invalid CSRF token.'
      });
    }
  }

  next();
}

export default csrfProtection;
