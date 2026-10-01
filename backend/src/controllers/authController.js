import { registerUser, loginUser } from '../services/authService.js';

/**
 * Helper to set HttpOnly auth cookie if supported.
 */
function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
}

/**
 * POST /api/auth/register
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

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser({ email, password });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    res.clearCookie('token');
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
 * Retrieves current authenticated user's profile.
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
