import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  webhookCreateSchema,
  webhookUpdateSchema
} from '../validators/governanceValidators.js';
import {
  listWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  testWebhook,
  getWebhookDeliveries
} from '../controllers/governanceController.js';

const router = Router();

router.use(requireAuth);

// GET /api/admin/webhooks - List registered webhooks (Admin, Analyst)
router.get('/', requireRole('Admin', 'Analyst'), listWebhooks);

// GET /api/admin/webhooks/:id - Get single webhook detail (Admin, Analyst)
router.get('/:id', requireRole('Admin', 'Analyst'), getWebhookById);

// POST /api/admin/webhooks - Register new webhook (Admin only)
router.post('/', requireRole('Admin'), validateRequest(webhookCreateSchema), createWebhook);

// PATCH /api/admin/webhooks/:id - Update webhook endpoint or subscriptions (Admin only)
router.patch('/:id', requireRole('Admin'), validateRequest(webhookUpdateSchema), updateWebhook);

// POST /api/admin/webhooks/:id/test - Send signed test delivery (Admin only)
router.post('/:id/test', requireRole('Admin'), testWebhook);

// GET /api/admin/webhooks/:id/deliveries - View delivery history log (Admin, Analyst)
router.get('/:id/deliveries', requireRole('Admin', 'Analyst'), getWebhookDeliveries);

export default router;
