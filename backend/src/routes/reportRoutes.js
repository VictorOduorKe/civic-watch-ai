import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getCategories,
  createReport,
  getMyStats
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { reportUpload, handleUploadErrors } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { createReportSchema } from '../validators/reportValidators.js';

const router = Router();

// Rate limiter for report submissions: 25 submissions per 15 minutes per IP
const reportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many report submissions. Please wait before submitting another report.'
  }
});

// GET /api/reports/categories - List active incident categories
router.get('/categories', getCategories);

// GET /api/reports/stats/me - Get current user's report statistics (real counts)
router.get('/stats/me', requireAuth, getMyStats);

// POST /api/reports - Create a new incident report with optional attachments
router.post(
  '/',
  requireAuth,
  reportSubmissionLimiter,
  reportUpload.array('attachments', 5),
  handleUploadErrors,
  validateRequest(createReportSchema),
  createReport
);

export default router;
