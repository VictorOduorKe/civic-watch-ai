import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { apiKeyCreateSchema } from '../validators/governanceValidators.js';
import {
  listApiKeys,
  createApiKey,
  rotateApiKey,
  revokeApiKey
} from '../controllers/governanceController.js';

const router = Router();

router.use(requireAuth);

// GET /api/admin/api-keys - List integration API keys (Admin, Analyst)
router.get('/', requireRole('Admin', 'Analyst'), listApiKeys);

// POST /api/admin/api-keys - Generate new API key (Admin only)
router.post('/', requireRole('Admin'), validateRequest(apiKeyCreateSchema), createApiKey);

// POST /api/admin/api-keys/:id/rotate - Rotate key secret (Admin only)
router.post('/:id/rotate', requireRole('Admin'), rotateApiKey);

// POST /api/admin/api-keys/:id/revoke - Revoke key immediately (Admin only)
router.post('/:id/revoke', requireRole('Admin'), revokeApiKey);

export default router;
