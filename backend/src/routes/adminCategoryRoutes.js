import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema
} from '../validators/governanceValidators.js';
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  archiveCategory
} from '../controllers/governanceController.js';

const router = Router();

router.use(requireAuth);

// GET /api/admin/categories - List all categories across modules (Admin, Moderator, Analyst)
router.get('/', requireRole('Admin', 'Moderator', 'Analyst'), listCategories);

// GET /api/admin/categories/:id - Get category detail (Admin, Moderator, Analyst)
router.get('/:id', requireRole('Admin', 'Moderator', 'Analyst'), getCategoryById);

// POST /api/admin/categories - Create new category (Admin only)
router.post('/', requireRole('Admin'), validateRequest(categoryCreateSchema), createCategory);

// PATCH /api/admin/categories/:id - Update category details (Admin only)
router.patch('/:id', requireRole('Admin'), validateRequest(categoryUpdateSchema), updateCategory);

// POST /api/admin/categories/:id/archive - Archive category safely (Admin only)
router.post('/:id/archive', requireRole('Admin'), archiveCategory);

export default router;
