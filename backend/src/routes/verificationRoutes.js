import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createVerification,
  getVerifications,
  getVerification,
  getVerificationImage
} from '../controllers/verificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  verificationUpload,
  handleVerificationUploadErrors
} from '../middleware/verificationUploadMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createVerificationSchema,
  listVerificationsQuerySchema,
  verificationIdParamSchema
} from '../validators/verificationValidators.js';

const router = Router();

// Strict rate limiter for AI verification submissions: 15 per hour in production, 150 in dev/test
const isProd = process.env.NODE_ENV === 'production';
const verificationSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 15 : 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification requests submitted. Please wait before submitting another claim for analysis.'
  }
});

// Rate limiter for reading verification records: 100 per 15 minutes (500 in dev/test)
const verificationReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification requests. Please slow down.'
  }
});

/**
 * POST /api/verifications
 * Submit a new claim or image for AI verification
 */
router.post(
  '/',
  requireAuth,
  verificationSubmissionLimiter,
  verificationUpload.single('image'),
  handleVerificationUploadErrors,
  validateRequest(createVerificationSchema),
  createVerification
);

/**
 * GET /api/verifications
 * Retrieve list of user's past verifications
 */
router.get(
  '/',
  requireAuth,
  verificationReadLimiter,
  validateRequest(listVerificationsQuerySchema),
  getVerifications
);

/**
 * GET /api/verifications/:id
 * Retrieve details for a specific verification
 */
router.get(
  '/:id',
  requireAuth,
  verificationReadLimiter,
  validateRequest(verificationIdParamSchema),
  getVerification
);

/**
 * GET /api/verifications/:id/image
 * Serve uploaded screenshot with ownership verification
 */
router.get(
  '/:id/image',
  requireAuth,
  verificationReadLimiter,
  validateRequest(verificationIdParamSchema),
  getVerificationImage
);

export default router;
