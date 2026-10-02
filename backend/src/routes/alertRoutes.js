import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  listPublicAlertsQuerySchema,
  alertIdParamSchema,
  createCommunityAdvisorySchema
} from '../validators/alertValidators.js';
import {
  getPublicAlerts,
  getPublicAlertById,
  createCommunityAdvisory
} from '../controllers/alertController.js';

const router = Router();

const publicAlertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many alert requests. Please try again shortly.'
  }
});

const communitySubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // Max 20 community advisories per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many community submissions. Please try again later.'
  }
});

// GET /api/alerts - Public list of active/expired alerts
router.get(
  '/',
  publicAlertLimiter,
  validateRequest(listPublicAlertsQuerySchema),
  getPublicAlerts
);

// GET /api/alerts/:id - Public alert detail
router.get(
  '/:id',
  publicAlertLimiter,
  validateRequest(alertIdParamSchema),
  getPublicAlertById
);

// POST /api/alerts/community - Citizen submits community advisory (requires auth)
router.post(
  '/community',
  requireAuth,
  communitySubmissionLimiter,
  validateRequest(createCommunityAdvisorySchema),
  createCommunityAdvisory
);

export default router;
