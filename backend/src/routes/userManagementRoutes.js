import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  listUsersQuerySchema,
  userIdParamSchema,
  updateRoleSchema,
  suspendUserSchema,
  reactivateUserSchema,
  provisionCountyLiaisonSchema,
  updateIdentitySchema,
  inviteStaffSchema
} from '../validators/userManagementValidators.js';
import {
  listUsersHandler,
  getUserDetailsHandler,
  changeUserRoleHandler,
  suspendUserHandler,
  reactivateUserHandler,
  provisionCountyLiaisonHandler,
  updateIdentityHandler,
  inviteStaffHandler,
  getUserAuditsHandler,
  getUserStatsHandler
} from '../controllers/userManagementController.js';

const router = Router();

// Aggregate KPI stats (Admin and Analyst)
router.get(
  '/stats',
  requireAuth,
  requireRole('Admin', 'Analyst'),
  getUserStatsHandler
);

// Global audit history logs (Admin and Analyst)
router.get(
  '/audits',
  requireAuth,
  requireRole('Admin', 'Analyst'),
  getUserAuditsHandler
);

// Staff invitation endpoint (Admin only)
router.post(
  '/invite',
  requireAuth,
  requireRole('Admin'),
  validateRequest(inviteStaffSchema),
  inviteStaffHandler
);

// List users with search and filters (Admin and Analyst)
router.get(
  '/',
  requireAuth,
  requireRole('Admin', 'Analyst'),
  validateRequest(listUsersQuerySchema),
  listUsersHandler
);

// Single user profile with audit and verification history (Admin and Analyst)
router.get(
  '/:id',
  requireAuth,
  requireRole('Admin', 'Analyst'),
  validateRequest(userIdParamSchema),
  getUserDetailsHandler
);

// Single user audit history (Admin and Analyst)
router.get(
  '/:id/audits',
  requireAuth,
  requireRole('Admin', 'Analyst'),
  validateRequest(userIdParamSchema),
  getUserAuditsHandler
);

// Update user role with last-admin protection (Admin only)
router.patch(
  '/:id/role',
  requireAuth,
  requireRole('Admin'),
  validateRequest(userIdParamSchema),
  validateRequest(updateRoleSchema),
  changeUserRoleHandler
);

// Suspend user account with last-admin protection & session invalidation (Admin only)
router.post(
  '/:id/suspend',
  requireAuth,
  requireRole('Admin'),
  validateRequest(userIdParamSchema),
  validateRequest(suspendUserSchema),
  suspendUserHandler
);

// Reactivate user account (Admin only)
router.post(
  '/:id/reactivate',
  requireAuth,
  requireRole('Admin'),
  validateRequest(userIdParamSchema),
  validateRequest(reactivateUserSchema),
  reactivateUserHandler
);

// Provision county liaison role & geographical assignment (Admin only)
router.patch(
  '/:id/liaison',
  requireAuth,
  requireRole('Admin'),
  validateRequest(userIdParamSchema),
  validateRequest(provisionCountyLiaisonSchema),
  provisionCountyLiaisonHandler
);

// Update identity verification status (Admin only)
router.patch(
  '/:id/identity',
  requireAuth,
  requireRole('Admin'),
  validateRequest(userIdParamSchema),
  validateRequest(updateIdentitySchema),
  updateIdentityHandler
);

export default router;
