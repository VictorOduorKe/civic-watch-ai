import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import alertRoutes from './alertRoutes.js';
import milestoneRoutes from './milestoneRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import trustRoutes from './trustRoutes.js';
import participationRoutes from './participationRoutes.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication & Identity endpoints
router.use('/auth', authRoutes);

// Incident Reporting endpoints (Milestone 4 & 5)
router.use('/reports', reportRoutes);

// Administrative OCL endpoints (Milestone 6 & 7)
router.use('/admin', adminRoutes);

// In-app Notification endpoints (Milestone 8)
router.use('/notifications', notificationRoutes);

// Citizen Notifications & Subscriptions endpoints (Milestone 13)
router.use('/alert-subscriptions', subscriptionRoutes);
router.use('/notification-preferences', subscriptionRoutes);

// AI Information Verification endpoints (Milestone 9)
router.use('/verifications', verificationRoutes);

// Civic Alerts & Advisories endpoints (Milestone 11)
router.use('/alerts', alertRoutes);

// Milestone Roadmap & Human Approval Gate endpoints (ROADMAP 1)
router.use('/milestones', milestoneRoutes);

// Civic Intelligence & Insights analytics endpoints (Milestone 12)
router.use('/analytics', analyticsRoutes);

// Verification & Trust Layer endpoints (Milestone 14)
router.use('/trust', trustRoutes);

// Civic Participation & Petitions endpoints (Milestone 15)
router.use('/participation', participationRoutes);

export default router;
