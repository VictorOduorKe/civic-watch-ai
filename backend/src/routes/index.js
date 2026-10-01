import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication & Identity endpoints
router.use('/auth', authRoutes);

// Incident Reporting endpoints (Milestone 4)
router.use('/reports', reportRoutes);

export default router;
