import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema
} from '../validators/notificationValidators.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';

const router = Router();

// Rate limiter for queries: 300 per 15 min
const queryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many notification requests. Please slow down.'
  }
});

// Rate limiter for mutations: 150 per 15 min
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many notification update requests. Please slow down.'
  }
});

// All notification endpoints require authenticated user
router.use(requireAuth);

// 1. GET /api/notifications - List paginated notifications
router.get('/', queryLimiter, validateRequest(listNotificationsQuerySchema), getNotifications);

// 2. GET /api/notifications/unread-count - Get total unread count
router.get('/unread-count', queryLimiter, getUnreadCount);

// 3. PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', mutationLimiter, markAllAsRead);

// 4. PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', mutationLimiter, validateRequest(notificationIdParamSchema), markAsRead);

import {
  getUserPreferencesController,
  updateUserPreferencesController
} from '../controllers/subscriptionController.js';
import { updatePreferencesSchema } from '../validators/subscriptionValidators.js';

// 5. GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', queryLimiter, getUserPreferencesController);

// 6. PUT /api/notifications/preferences - Update notification preferences
router.put(
  '/preferences',
  mutationLimiter,
  validateRequest(updatePreferencesSchema),
  updateUserPreferencesController
);

export default router;
