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

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Clears HttpOnly auth cookie and CSRF cookie.
 */
export async function logout(req, res, next) {
  try {
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
