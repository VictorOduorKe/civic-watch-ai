import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validate.js';
import { auditQuerySchema, auditExportSchema } from '../validators/governanceValidators.js';
import {
  getAuditEvents,
  getAuditEventById,
  verifyAuditIntegrity,
  generateComplianceExport,
  getAuditStats
} from '../controllers/auditController.js';

const router = Router();

// Administrative Audit Log Routes strictly enforce authentication
router.use(requireAuth);

// GET /api/admin/audit/stats - Summary KPI statistics (Admin, Analyst)
router.get('/stats', requireRole('Admin', 'Analyst'), getAuditStats);

// GET /api/admin/audit/integrity - Cryptographic chained hash integrity verification (Admin, Analyst)
router.get('/integrity', requireRole('Admin', 'Analyst'), verifyAuditIntegrity);

// POST /api/admin/audit/export - Compliance report export (CSV/JSON) (Admin only)
router.post('/export', requireRole('Admin'), validateRequest(auditExportSchema), generateComplianceExport);

// GET /api/admin/audit - Search and filter audit log trail (Admin, Analyst)
router.get('/', requireRole('Admin', 'Analyst'), validateRequest(auditQuerySchema), getAuditEvents);

// GET /api/admin/audit/:id - Detailed event inspection (Admin, Analyst)
router.get('/:id', requireRole('Admin', 'Analyst'), getAuditEventById);

export default router;
