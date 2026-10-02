import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { adminDashboardSummarySchema } from '../validators/adminDashboardValidators.js';
import { getDashboardSummary } from '../controllers/adminDashboardController.js';
import adminIncidentRoutes from './adminIncidentRoutes.js';
import adminAlertRoutes from './adminAlertRoutes.js';
import adminMilestoneRoutes from './adminMilestoneRoutes.js';

const router = Router();

// Rate limiter for admin dashboard queries
const adminDashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many administrative requests. Please slow down.'
  }
});

// All admin routes strictly require authentication and an administrative role
router.use(requireAuth);
router.use(requireRole('Admin', 'Moderator', 'Analyst'));

// GET /api/admin/dashboard/summary
router.get(
  '/dashboard/summary',
  adminDashboardLimiter,
  validateRequest(adminDashboardSummarySchema),
  getDashboardSummary
);

// Incident management routes (Milestone 7)
router.use('/incidents', adminIncidentRoutes);

// Civic Alerts & Advisories management routes (Milestone 11)
router.use('/alerts', adminAlertRoutes);

// Milestone Roadmap & Human Approval Gate management routes (ROADMAP 1)
router.use('/milestones', adminMilestoneRoutes);

export default router;
