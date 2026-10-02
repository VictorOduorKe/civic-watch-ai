import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  getRoadmapOverview,
  getMilestoneDetails,
  approveMilestone,
  rejectMilestone,
  reportRegression,
  updateMilestoneDefinition
} from '../controllers/milestoneController.js';
import {
  approveMilestoneSchema,
  rejectMilestoneSchema,
  reportRegressionSchema,
  updateMilestoneDefinitionSchema
} from '../validators/milestoneValidators.js';

const router = Router();

// All admin milestone routes strictly enforce authentication
router.use(requireAuth);

// Read-only overview for admin/moderator/analyst
router.get('/', getRoadmapOverview);
router.get('/:id', getMilestoneDetails);

// Strict Human Approval Gates: ONLY 'Admin' role can approve, reject, or flag regressions
router.post(
  '/:id/approve',
  requireRole('Admin'),
  validateRequest(approveMilestoneSchema),
  approveMilestone
);

router.post(
  '/:id/reject',
  requireRole('Admin'),
  validateRequest(rejectMilestoneSchema),
  rejectMilestone
);

router.post(
  '/:id/regression',
  requireRole('Admin'),
  validateRequest(reportRegressionSchema),
  reportRegression
);

router.put(
  '/:id',
  requireRole('Admin'),
  validateRequest(updateMilestoneDefinitionSchema),
  updateMilestoneDefinition
);

export default router;
