import { Router } from 'express';
import { getRoadmapOverview, getMilestoneDetails } from '../controllers/milestoneController.js';

const router = Router();

// GET /api/milestones - Full roadmap overview with dynamic metrics
router.get('/', getRoadmapOverview);

// GET /api/milestones/:id - Specific milestone details, verification specs & checklist
router.get('/:id', getMilestoneDetails);

export default router;
