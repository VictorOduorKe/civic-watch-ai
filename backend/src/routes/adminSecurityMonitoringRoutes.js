import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  securityEventQuerySchema,
  securityEventStatusSchema
} from '../validators/governanceValidators.js';
import {
  getSecurityEvents,
  getSecurityEventById,
  updateSecurityEventStatus,
  getSecurityMonitoringStats
} from '../controllers/securityMonitoringController.js';

const router = Router();

router.use(requireAuth);

// GET /api/admin/security-events/stats (Admin, Moderator, Analyst)
router.get('/stats', requireRole('Admin', 'Moderator', 'Analyst'), getSecurityMonitoringStats);

// GET /api/admin/security-events - List security alerts (Admin, Moderator, Analyst)
router.get('/', requireRole('Admin', 'Moderator', 'Analyst'), validateRequest(securityEventQuerySchema), getSecurityEvents);

// GET /api/admin/security-events/:id - Get security event detail (Admin, Moderator, Analyst)
router.get('/:id', requireRole('Admin', 'Moderator', 'Analyst'), getSecurityEventById);

// PATCH /api/admin/security-events/:id - Update review status (Admin, Moderator)
router.patch('/:id', requireRole('Admin', 'Moderator'), validateRequest(securityEventStatusSchema), updateSecurityEventStatus);

export default router;
