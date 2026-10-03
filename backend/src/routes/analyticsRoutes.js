import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  analyticsOverviewSchema,
  analyticsReportsSchema,
  analyticsCategoriesSchema,
  analyticsStatusSchema,
  analyticsGeographySchema,
  analyticsAlertsSchema,
  analyticsTrendsSchema
} from '../validators/analyticsValidators.js';
import {
  getOverview,
  getReportTrends,
  getCategoryStats,
  getStatusStats,
  getGeographyStats,
  getAlertStats,
  getTrends,
  getAdminOverviewStats,
  getAdminReportTrendsStats,
  getAdminCategoryStatsController,
  getAdminStatusStatsController,
  getAdminGeographyStatsController,
  getAdminAlertStatsController
} from '../controllers/analyticsController.js';

const router = Router();

// Public analytics rate limiter — generous limit for public civic data
const publicAnalyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many analytics requests. Please try again shortly.'
  }
});

// Admin analytics rate limiter
const adminAnalyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many administrative analytics requests.'
  }
});

// ─── Public Analytics Routes ──────────────────────────────────────────────────

// GET /api/analytics/overview
router.get(
  '/overview',
  publicAnalyticsLimiter,
  validateRequest(analyticsOverviewSchema),
  getOverview
);

// GET /api/analytics/trends
router.get(
  '/trends',
  publicAnalyticsLimiter,
  validateRequest(analyticsTrendsSchema),
  getTrends
);

// GET /api/analytics/reports
router.get(
  '/reports',
  publicAnalyticsLimiter,
  validateRequest(analyticsReportsSchema),
  getReportTrends
);

// GET /api/analytics/reports/categories
router.get(
  '/reports/categories',
  publicAnalyticsLimiter,
  validateRequest(analyticsCategoriesSchema),
  getCategoryStats
);

// GET /api/analytics/reports/status
router.get(
  '/reports/status',
  publicAnalyticsLimiter,
  validateRequest(analyticsStatusSchema),
  getStatusStats
);

// GET /api/analytics/reports/geography
router.get(
  '/reports/geography',
  publicAnalyticsLimiter,
  validateRequest(analyticsGeographySchema),
  getGeographyStats
);

// GET /api/analytics/alerts
router.get(
  '/alerts',
  publicAnalyticsLimiter,
  validateRequest(analyticsAlertsSchema),
  getAlertStats
);

// ─── Admin Analytics Routes ───────────────────────────────────────────────────
// All admin analytics require authentication + authorized role.

router.get(
  '/admin/overview',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsOverviewSchema),
  getAdminOverviewStats
);

router.get(
  '/admin/reports',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsReportsSchema),
  getAdminReportTrendsStats
);

router.get(
  '/admin/categories',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsCategoriesSchema),
  getAdminCategoryStatsController
);

router.get(
  '/admin/status',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsStatusSchema),
  getAdminStatusStatsController
);

router.get(
  '/admin/geography',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsGeographySchema),
  getAdminGeographyStatsController
);

router.get(
  '/admin/alerts',
  adminAnalyticsLimiter,
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(analyticsAlertsSchema),
  getAdminAlertStatsController
);

export default router;
