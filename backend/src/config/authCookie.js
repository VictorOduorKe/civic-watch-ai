import crypto from 'crypto';

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'civicwatch_auth';
export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN';

const isProduction = process.env.NODE_ENV === 'production';
const isSecure = isProduction || process.env.AUTH_COOKIE_SECURE === 'true';
const sameSitePolicy = (process.env.AUTH_COOKIE_SAME_SITE || 'lax').toLowerCase();

/**
 * Standard cookie options for HttpOnly authentication credential.
 */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSitePolicy,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  };
}

/**
 * Standard cookie options for client-readable CSRF token.
 * Double-submit cookie pattern requires JavaScript readability to attach to headers.
 */
export function getCsrfCookieOptions() {
  return {
    httpOnly: false,
    secure: isSecure,
    sameSite: sameSitePolicy,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  };
}

/**
 * Generate a cryptographically secure random CSRF token.
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set the HttpOnly authentication cookie on the response.
 */
export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

/**
 * Clear the authentication cookie.
 */
export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSitePolicy,
    path: '/'
  });
}

/**
 * Set the client-readable CSRF token cookie.
 */
export function setCsrfCookie(res, csrfToken) {
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
}

/**
 * Clear the CSRF token cookie.
 */
export function clearCsrfCookie(res) {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: isSecure,
    sameSite: sameSitePolicy,
    path: '/'
  });
}

export default {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  getAuthCookieOptions,
  getCsrfCookieOptions,
  generateCsrfToken,
  setAuthCookie,
  clearAuthCookie,
  setCsrfCookie,
  clearCsrfCookie
};
