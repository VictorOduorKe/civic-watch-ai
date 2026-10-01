import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getCategories,
  createReport,
  getMyReports,
  getMySummary,
  getMyReportDetail,
  downloadAttachment,
  getMyStats
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { reportUpload, handleUploadErrors } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createReportSchema,
  listMyReportsSchema,
  reportReferenceSchema,
  reportAttachmentParamSchema
} from '../validators/reportValidators.js';

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

// Rate limiter for reading report details to protect against automated reference enumeration: 120 per 15 min
const reportReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many report lookup requests. Please slow down.'
  }
});

// GET /api/reports/categories - List active incident categories
router.get('/categories', getCategories);

// GET /api/reports/stats/me - Get current user's report statistics (real database counts)
router.get('/stats/me', requireAuth, getMyStats);

// GET /api/reports/my/summary - Get current user's full status breakdown summary
router.get('/my/summary', requireAuth, getMySummary);

// GET /api/reports/my - List reports submitted by the authenticated citizen (paginated, filtered, searched)
router.get(
  '/my',
  requireAuth,
  validateRequest(listMyReportsSchema),
  getMyReports
);

// GET /api/reports/my/:reference - Get detailed citizen view of a specific owned report
router.get(
  '/my/:reference',
  requireAuth,
  reportReadLimiter,
  validateRequest(reportReferenceSchema),
  getMyReportDetail
);

// GET /api/reports/my/:reference/attachments/:attachmentId - Securely download an owned attachment
router.get(
  '/my/:reference/attachments/:attachmentId',
  requireAuth,
  validateRequest(reportAttachmentParamSchema),
  downloadAttachment
);

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
