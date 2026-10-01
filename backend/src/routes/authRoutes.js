import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe, getCsrfToken } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Dedicated rate limiting for authentication to protect against brute-force and stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after a few minutes.'
  }
});

// Registration endpoint
router.post('/register', authLimiter, validateRequest(registerSchema), register);

// Login endpoint
router.post('/login', authLimiter, validateRequest(loginSchema), login);

// Logout endpoint
router.post('/logout', logout);

// Profile endpoint (protected via HttpOnly cookie)
router.get('/me', requireAuth, getMe);

// CSRF token retrieval endpoint
router.get('/csrf-token', getCsrfToken);

export default router;

