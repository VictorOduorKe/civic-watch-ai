import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  adminIncidentListSchema,
  incidentReferenceParamSchema,
  changeIncidentStatusSchema,
  assignIncidentSchema,
  unassignIncidentSchema,
  createInternalNoteSchema,
  createCitizenUpdateSchema,
  createReferralSchema,
  updateReferralStatusSchema,
  incidentAttachmentParamSchema
} from '../validators/incidentManagementValidators.js';
import {
  listIncidents,
  getAssignees,
  getIncidentDetail,
  updateStatus,
  assignIncident,
  unassignIncident,
  addInternalNote,
  addCitizenUpdate,
  createReferral,
  updateReferralStatus,
  downloadIncidentAttachment
} from '../controllers/adminIncidentController.js';

const router = Router();

// Rate limiter for incident management queries: 300 per 15 min
const incidentQueryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many incident management queries. Please slow down.'
  }
});

// Rate limiter for incident operational mutations: 100 per 15 min
const incidentMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many operational modifications. Please slow down.'
  }
});

// All incident management routes require authentication and an administrative role
router.use(requireAuth);

// 1. GET /api/admin/incidents - List incidents (Admin, Moderator, Analyst)
router.get(
  '/',
  requireRole('Admin', 'Moderator', 'Analyst'),
  incidentQueryLimiter,
  validateRequest(adminIncidentListSchema),
  listIncidents
);

// 2. GET /api/admin/incidents/assignees - List eligible staff for assignment (Admin, Moderator)
router.get(
  '/assignees',
  requireRole('Admin', 'Moderator'),
  getAssignees
);

// 3. GET /api/admin/incidents/:reference - Get incident detail (Admin, Moderator, Analyst)
router.get(
  '/:reference',
  requireRole('Admin', 'Moderator', 'Analyst'),
  incidentQueryLimiter,
  validateRequest(incidentReferenceParamSchema),
  getIncidentDetail
);

// 4. GET /api/admin/incidents/:reference/attachments/:attachmentId - Secure download (Admin, Moderator, Analyst)
router.get(
  '/:reference/attachments/:attachmentId',
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(incidentAttachmentParamSchema),
  downloadIncidentAttachment
);

// 5. PATCH /api/admin/incidents/:reference/status - Change status (Admin, Moderator only)
router.patch(
  '/:reference/status',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(changeIncidentStatusSchema),
  updateStatus
);

// 6. POST /api/admin/incidents/:reference/assign - Assign to staff (Admin, Moderator only)
router.post(
  '/:reference/assign',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(assignIncidentSchema),
  assignIncident
);

// 7. POST /api/admin/incidents/:reference/unassign - Remove assignment (Admin, Moderator only)
router.post(
  '/:reference/unassign',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(unassignIncidentSchema),
  unassignIncident
);

// 8. POST /api/admin/incidents/:reference/internal-notes - Add internal note (Admin, Moderator only)
router.post(
  '/:reference/internal-notes',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(createInternalNoteSchema),
  addInternalNote
);

// 9. POST /api/admin/incidents/:reference/updates - Publish citizen update (Admin, Moderator only)
router.post(
  '/:reference/updates',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(createCitizenUpdateSchema),
  addCitizenUpdate
);

// 10. POST /api/admin/incidents/:reference/referrals - Create referral (Admin, Moderator only)
router.post(
  '/:reference/referrals',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(createReferralSchema),
  createReferral
);

// 11. PATCH /api/admin/incidents/:reference/referrals/:referralId - Update referral status (Admin, Moderator only)
router.patch(
  '/:reference/referrals/:referralId',
  requireRole('Admin', 'Moderator'),
  incidentMutationLimiter,
  validateRequest(updateReferralStatusSchema),
  updateReferralStatus
);

export default router;
