import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication & Identity endpoints
router.use('/auth', authRoutes);

// Incident Reporting endpoints (Milestone 4 & 5)
router.use('/reports', reportRoutes);

// Administrative OCL endpoints (Milestone 6)
router.use('/admin', adminRoutes);

export default router;
