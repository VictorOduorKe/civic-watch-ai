import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { securityPolicyUpdateSchema } from '../validators/governanceValidators.js';
import {
  getSecurityPolicies,
  updateSecurityPolicy,
  getSecurityPolicyHistory
} from '../controllers/governanceController.js';

const router = Router();

router.use(requireAuth);

// GET /api/admin/security-policies - List all configurable policies (Admin, Analyst)
router.get('/', requireRole('Admin', 'Analyst'), getSecurityPolicies);

// GET /api/admin/security-policies/history - Full versioned audit history (Admin, Analyst)
router.get('/history', requireRole('Admin', 'Analyst'), getSecurityPolicyHistory);

// PATCH /api/admin/security-policies/:key - Update policy with validation bounds (Admin only)
router.patch('/:key', requireRole('Admin'), validateRequest(securityPolicyUpdateSchema), updateSecurityPolicy);

export default router;
