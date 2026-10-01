import {
  getActiveCategories,
  createReport as createReportService,
  getUserReportCount
} from '../services/reportService.js';

/**
 * GET /api/reports/categories
 * Retrieves active incident categories.
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await getActiveCategories();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reports
 * Submits a new incident report with optional attachments.
 */
export async function createReport(req, res, next) {
  try {
    const userId = req.user.id;
    const reportData = req.body;
    const files = req.files || [];

    const result = await createReportService({
      userId,
      reportData,
      files
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      report: {
        reference: result.reference,
        status: result.status,
        created_at: result.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/stats/me
 * Retrieves current user's report statistics (real counts).
 */
export async function getMyStats(req, res, next) {
  try {
    const userId = req.user.id;
    const count = await getUserReportCount(userId);

    return res.status(200).json({
      success: true,
      stats: {
        submitted: count,
        underReview: 0,
        inProgress: 0,
        resolved: 0
      }
    });
  } catch (error) {
    next(error);
  }
}
