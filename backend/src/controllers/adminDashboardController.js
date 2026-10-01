import { getAdminDashboardSummary } from '../services/adminDashboardService.js';

/**
 * GET /api/admin/dashboard/summary
 * Retrieves overall platform statistics for authorized administrative users.
 */
export async function getDashboardSummary(req, res, next) {
  try {
    const { range = '30d' } = req.query;
    const result = await getAdminDashboardSummary({ range });

    return res.status(200).json({
      success: true,
      summary: result.summary,
      reports_by_status: result.reports_by_status,
      reports_by_category: result.reports_by_category,
      reports_by_county: result.reports_by_county,
      reports_over_time: result.reports_over_time,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}
