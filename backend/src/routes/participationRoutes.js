import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { getUserById } from '../services/authService.js';
import { AUTH_COOKIE_NAME } from '../config/authCookie.js';
import { participationController } from '../controllers/participationController.js';
import {
  listPetitionsQuerySchema,
  petitionIdParamSchema,
  createPetitionSchema,
  updatePetitionSchema,
  moderatePetitionSchema,
  signPetitionSchema,
  listHearingsQuerySchema,
  hearingIdParamSchema,
  createHearingSchema,
  updateHearingSchema,
  cancelHearingSchema,
  listLegislativeItemsQuerySchema,
  legislativeItemIdParamSchema,
  createLegislativeItemSchema,
  submitFeedbackSchema,
  feedbackIdParamSchema,
  moderateFeedbackSchema
} from '../validators/participationValidators.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_in_production_min32chars';

/**
 * Optional Authentication Middleware
 * If cookie/token is present, populates req.user. If absent, proceeds as public.
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await getUserById(decoded.id);
        if (user) req.user = user;
      } catch {
        // Invalid or expired token ignored for public routes
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 1. STATS & AUDITS
// ==========================================
router.get('/stats', participationController.getParticipationStats);
router.get(
  '/audits',
  requireAuth,
  requireRole(['Admin', 'Moderator', 'Analyst']),
  participationController.getAudits
);

// ==========================================
// 2. PETITIONS
// ==========================================
router.get(
  '/petitions',
  optionalAuth,
  validateRequest(listPetitionsQuerySchema),
  participationController.listPetitions
);

router.get(
  '/petitions/:id',
  optionalAuth,
  validateRequest(petitionIdParamSchema),
  participationController.getPetition
);

router.get(
  '/petitions/:id/signatures',
  validateRequest(petitionIdParamSchema),
  participationController.getSignatures
);

router.post(
  '/petitions',
  requireAuth,
  validateRequest(createPetitionSchema),
  participationController.createPetition
);

router.patch(
  '/petitions/:id',
  requireAuth,
  validateRequest(petitionIdParamSchema),
  validateRequest(updatePetitionSchema),
  participationController.updatePetition
);

router.post(
  '/petitions/:id/sign',
  requireAuth,
  validateRequest(petitionIdParamSchema),
  validateRequest(signPetitionSchema),
  participationController.signPetition
);

router.delete(
  '/petitions/:id/sign',
  requireAuth,
  validateRequest(petitionIdParamSchema),
  participationController.withdrawSignature
);

router.post(
  '/petitions/:id/moderate',
  requireAuth,
  requireRole(['Admin', 'Moderator']),
  validateRequest(petitionIdParamSchema),
  validateRequest(moderatePetitionSchema),
  participationController.moderatePetition
);

// ==========================================
// 3. BUDGET HEARINGS
// ==========================================
router.get(
  '/hearings',
  optionalAuth,
  validateRequest(listHearingsQuerySchema),
  participationController.listHearings
);

router.get(
  '/hearings/:id',
  validateRequest(hearingIdParamSchema),
  participationController.getHearing
);

router.post(
  '/hearings',
  requireAuth,
  validateRequest(createHearingSchema),
  participationController.createHearing
);

router.patch(
  '/hearings/:id',
  requireAuth,
  validateRequest(hearingIdParamSchema),
  validateRequest(updateHearingSchema),
  participationController.updateHearing
);

router.post(
  '/hearings/:id/cancel',
  requireAuth,
  validateRequest(hearingIdParamSchema),
  validateRequest(cancelHearingSchema),
  participationController.cancelHearing
);

// ==========================================
// 4. LEGISLATIVE ITEMS & FEEDBACK
// ==========================================
router.get(
  '/legislative-items',
  optionalAuth,
  validateRequest(listLegislativeItemsQuerySchema),
  participationController.listLegislativeItems
);

router.get(
  '/legislative-items/:id',
  validateRequest(legislativeItemIdParamSchema),
  participationController.getLegislativeItem
);

router.post(
  '/legislative-items',
  requireAuth,
  requireRole(['Admin', 'Moderator']),
  validateRequest(createLegislativeItemSchema),
  participationController.createLegislativeItem
);

router.get(
  '/legislative-items/:id/feedback',
  optionalAuth,
  validateRequest(legislativeItemIdParamSchema),
  participationController.listFeedback
);

router.post(
  '/legislative-items/:id/feedback',
  requireAuth,
  validateRequest(legislativeItemIdParamSchema),
  validateRequest(submitFeedbackSchema),
  participationController.submitFeedback
);

router.patch(
  '/feedback/:id/moderate',
  requireAuth,
  requireRole(['Admin', 'Moderator']),
  validateRequest(feedbackIdParamSchema),
  validateRequest(moderateFeedbackSchema),
  participationController.moderateFeedback
);

export default router;
