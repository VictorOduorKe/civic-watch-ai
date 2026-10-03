import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  updatePreferencesSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  subscriptionIdParamSchema,
  unsubscribeSchema
} from '../validators/subscriptionValidators.js';
import {
  getUserPreferencesController,
  updateUserPreferencesController,
  getUserSubscriptionsController,
  createSubscriptionController,
  updateSubscriptionController,
  deleteSubscriptionController,
  unsubscribeController
} from '../controllers/subscriptionController.js';

const router = Router();

// Rate limiters
const queryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many subscription requests. Please slow down.'
  }
});

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many subscription updates. Please try again shortly.'
  }
});

// All subscription and preference routes strictly enforce authentication
router.use(requireAuth);

// ─── Preferences ──────────────────────────────────────────────────────────────
router.get('/preferences', queryLimiter, getUserPreferencesController);
router.put(
  '/preferences',
  mutationLimiter,
  validateRequest(updatePreferencesSchema),
  updateUserPreferencesController
);

// ─── Subscriptions CRUD ───────────────────────────────────────────────────────
router.get('/', queryLimiter, getUserSubscriptionsController);

router.post(
  '/',
  mutationLimiter,
  validateRequest(createSubscriptionSchema),
  createSubscriptionController
);

router.put(
  '/:id',
  mutationLimiter,
  validateRequest(updateSubscriptionSchema),
  updateSubscriptionController
);

router.delete(
  '/:id',
  mutationLimiter,
  validateRequest(subscriptionIdParamSchema),
  deleteSubscriptionController
);

router.post(
  '/unsubscribe',
  mutationLimiter,
  validateRequest(unsubscribeSchema),
  unsubscribeController
);

export default router;
