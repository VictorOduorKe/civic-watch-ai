import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { adminDashboardSummarySchema } from '../validators/adminDashboardValidators.js';
import { getDashboardSummary } from '../controllers/adminDashboardController.js';
import adminIncidentRoutes from './adminIncidentRoutes.js';
import adminAlertRoutes from './adminAlertRoutes.js';
import adminMilestoneRoutes from './adminMilestoneRoutes.js';
import userManagementRoutes from './userManagementRoutes.js';
import adminAuditRoutes from './adminAuditRoutes.js';
import adminSecurityMonitoringRoutes from './adminSecurityMonitoringRoutes.js';
import adminCategoryRoutes from './adminCategoryRoutes.js';
import adminApiKeyRoutes from './adminApiKeyRoutes.js';
import adminWebhookRoutes from './adminWebhookRoutes.js';
import adminSecurityPolicyRoutes from './adminSecurityPolicyRoutes.js';

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

// User & Role Management routes (Milestone 14-1)
router.use('/users', userManagementRoutes);

// System Audit Logging & Compliance routes (Milestone 16)
router.use('/audit', adminAuditRoutes);

// Security Intrusion Monitoring routes (Milestone 16)
router.use('/security-events', adminSecurityMonitoringRoutes);

// Category Schema Management routes (Milestone 16)
router.use('/categories', adminCategoryRoutes);

// API Key Management routes (Milestone 16)
router.use('/api-keys', adminApiKeyRoutes);

// Webhook Management routes (Milestone 16)
router.use('/webhooks', adminWebhookRoutes);

// Security Policy Configurations routes (Milestone 16)
router.use('/security-policies', adminSecurityPolicyRoutes);

export default router;
