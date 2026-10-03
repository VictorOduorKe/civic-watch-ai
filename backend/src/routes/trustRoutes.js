import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { getUserById } from '../services/authService.js';
import { AUTH_COOKIE_NAME } from '../config/authCookie.js';
import {
  createSourceSchema,
  updateSourceSchema,
  verifyActionSchema,
  addReferenceSchema,
  listSourcesQuerySchema,
  queryVerificationQueueSchema
} from '../validators/trustValidators.js';
import {
  listSourcesHandler,
  getSourceHandler,
  createSourceHandler,
  updateSourceHandler,
  verifyActionHandler,
  addReferenceHandler,
  getProvenanceDossierHandler,
  getVerificationHistoryHandler,
  getVerificationReferencesHandler,
  getVerificationQueueHandler,
  getVerificationStatsHandler
} from '../controllers/trustController.js';

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
// Public / Citizen Verification & Source Routes
// ==========================================

// GET /api/trust/sources - List all recognized civic sources
router.get(
  '/sources',
  optionalAuth,
  validateRequest(listSourcesQuerySchema),
  listSourcesHandler
);

// GET /api/trust/sources/:id - View single source dossier
router.get(
  '/sources/:id',
  optionalAuth,
  getSourceHandler
);

// GET /api/trust/verify/:entityType/:entityId - Public Provenance Dossier
router.get(
  '/verify/:entityType/:entityId',
  optionalAuth,
  getProvenanceDossierHandler
);

// GET /api/trust/verify/:entityType/:entityId/history - Append-only verification log
router.get(
  '/verify/:entityType/:entityId/history',
  optionalAuth,
  getVerificationHistoryHandler
);

// GET /api/trust/verify/:entityType/:entityId/references - Supporting evidence & references
router.get(
  '/verify/:entityType/:entityId/references',
  optionalAuth,
  getVerificationReferencesHandler
);

// ==========================================
// Administrative Verification & Trust Management
// ==========================================

// GET /api/trust/admin/queue - Review queue for sources, alerts, and reports
router.get(
  '/admin/queue',
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  validateRequest(queryVerificationQueueSchema),
  getVerificationQueueHandler
);

// GET /api/trust/admin/stats - Verification metrics & status breakdown
router.get(
  '/admin/stats',
  requireAuth,
  requireRole('Admin', 'Moderator', 'Analyst'),
  getVerificationStatsHandler
);

// POST /api/trust/sources - Create new source record
router.post(
  '/sources',
  requireAuth,
  requireRole('Admin', 'Moderator'),
  validateRequest(createSourceSchema),
  createSourceHandler
);

// PUT /api/trust/sources/:id - Update existing source
router.put(
  '/sources/:id',
  requireAuth,
  requireRole('Admin', 'Moderator'),
  validateRequest(updateSourceSchema),
  updateSourceHandler
);

// POST /api/trust/verify/:entityType/:entityId - Execute verification action (VERIFIED, DISPUTED, CORRECTED, etc.)
router.post(
  '/verify/:entityType/:entityId',
  requireAuth,
  requireRole('Admin', 'Moderator'),
  validateRequest(verifyActionSchema),
  verifyActionHandler
);

// POST /api/trust/verify/:entityType/:entityId/references - Attach supporting reference/evidence
router.post(
  '/verify/:entityType/:entityId/references',
  requireAuth,
  requireRole('Admin', 'Moderator'),
  validateRequest(addReferenceSchema),
  addReferenceHandler
);

export default router;
