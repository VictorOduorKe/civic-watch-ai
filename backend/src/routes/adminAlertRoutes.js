import { Router } from 'express';
import { requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  listAdminAlertsQuerySchema,
  alertIdParamSchema,
  createAdminAlertSchema,
  updateAdminAlertSchema,
  verifyAlertSchema,
  publishAlertSchema
} from '../validators/alertValidators.js';
import {
  getAdminAlerts,
  getAdminAlertStats,
  getAdminAlertById,
  createAdminAlert,
  updateAdminAlert,
  verifyAdminAlert,
  publishAdminAlert,
  archiveAdminAlert
} from '../controllers/adminAlertController.js';

const router = Router();

// GET /api/admin/alerts/summary - KPI Summary stats for alert management (accessible by Admin, Moderator, Analyst)
router.get('/summary', getAdminAlertStats);

// GET /api/admin/alerts - List all alerts with admin filtering (accessible by Admin, Moderator, Analyst)
router.get(
  '/',
  validateRequest(listAdminAlertsQuerySchema),
  getAdminAlerts
);

// GET /api/admin/alerts/:id - Get alert detail with audit trail (accessible by Admin, Moderator, Analyst)
router.get(
  '/:id',
  validateRequest(alertIdParamSchema),
  getAdminAlertById
);

// Mutating endpoints strictly require Admin or Moderator role
router.use(requireRole('Admin', 'Moderator'));

// POST /api/admin/alerts - Create alert (draft, scheduled, or active)
router.post(
  '/',
  validateRequest(createAdminAlertSchema),
  createAdminAlert
);

// PUT /api/admin/alerts/:id - Edit alert
router.put(
  '/:id',
  validateRequest(updateAdminAlertSchema),
  updateAdminAlert
);

// POST /api/admin/alerts/:id/verify - Verify or reject alert
router.post(
  '/:id/verify',
  validateRequest(verifyAlertSchema),
  verifyAdminAlert
);

// POST /api/admin/alerts/:id/publish - Publish alert (immediate or scheduled)
router.post(
  '/:id/publish',
  validateRequest(publishAlertSchema),
  publishAdminAlert
);

// POST /api/admin/alerts/:id/archive - Archive alert
router.post(
  '/:id/archive',
  validateRequest(alertIdParamSchema),
  archiveAdminAlert
);

export default router;
