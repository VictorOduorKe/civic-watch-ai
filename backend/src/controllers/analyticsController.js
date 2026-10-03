import {
  getPublicOverview,
  getAdminOverview,
  getPublicReportTrends,
  getAdminReportTrends,
  getPublicCategoryStats,
  getAdminCategoryStats,
  getPublicStatusStats,
  getAdminStatusStats,
  getPublicGeographyStats,
  getAdminGeographyStats,
  getPublicAlertStats,
  getAdminAlertStats,
  MIN_PUBLIC_COUNT
} from '../services/analyticsService.js';

/**
 * M12 — Civic Intelligence & Insights: Analytics Controllers
 *
 * Public routes: privacy-safe aggregated data only.
 * Admin routes: additional detail; requires Auth + Admin/Moderator/Analyst role.
 *
 * Error responses never expose: stack traces, SQL, DB credentials, tokens.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

function extractFilters(query) {
  const { range, start_date, end_date, county, category, status } = query;
  return { range, start_date, end_date, county, category, status };
}

function buildFiltersResponse(query) {
  const { range, start_date, end_date, county, category, status } = query;
  const filters = {};
  if (range) filters.range = range;
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  if (county) filters.county = county;
  if (category) filters.category = category;
  if (status) filters.status = status;
  return filters;
}

// ─── Public Endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/analytics/overview
 * Public-safe civic overview statistics.
 */
export async function getOverview(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const data = await getPublicOverview(filters);
    return res.status(200).json({
      success: true,
      data,
      filters: buildFiltersResponse(req.query),
      privacy: {
        note: 'Sensitive reports are excluded from public statistics.',
        min_public_count: MIN_PUBLIC_COUNT
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/reports
 * Public report trend data over time.
 */
export async function getReportTrends(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const trends = await getPublicReportTrends(filters);
    return res.status(200).json({
      success: true,
      data: { trends },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/reports/categories
 * Public category breakdown.
 */
export async function getCategoryStats(req, res, next) {
  try {
    const { range, start_date, end_date, county, status } = req.query;
    const categories = await getPublicCategoryStats({ range, start_date, end_date, county, status });
    return res.status(200).json({
      success: true,
      data: { categories },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/reports/status
 * Public status breakdown.
 */
export async function getStatusStats(req, res, next) {
  try {
    const { range, start_date, end_date, county, category } = req.query;
    const statuses = await getPublicStatusStats({ range, start_date, end_date, county, category });
    return res.status(200).json({
      success: true,
      data: { statuses },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/reports/geography
 * Public geographic breakdown (MIN_PUBLIC_COUNT threshold applied).
 */
export async function getGeographyStats(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const geography = await getPublicGeographyStats(filters);
    return res.status(200).json({
      success: true,
      data: { geography },
      filters: buildFiltersResponse(req.query),
      privacy: {
        note: 'Geographic groups with fewer than the minimum threshold are excluded.',
        min_public_count: MIN_PUBLIC_COUNT
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/alerts
 * Public alert analytics.
 */
export async function getAlertStats(req, res, next) {
  try {
    const { range, start_date, end_date, county } = req.query;
    const data = await getPublicAlertStats({ range, start_date, end_date, county });
    return res.status(200).json({
      success: true,
      data,
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/trends
 * Public combined time-series trends for reports.
 */
export async function getTrends(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const trends = await getPublicReportTrends(filters);
    return res.status(200).json({
      success: true,
      data: { trends },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/analytics/admin/overview
 * Admin-only overview with deeper statistics including sensitive record counts.
 */
export async function getAdminOverviewStats(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const data = await getAdminOverview(filters);
    return res.status(200).json({
      success: true,
      data,
      filters: buildFiltersResponse(req.query),
      meta: { calculated_at: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/admin/reports
 * Admin report trends including active/resolved breakdown.
 */
export async function getAdminReportTrendsStats(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const trends = await getAdminReportTrends(filters);
    return res.status(200).json({
      success: true,
      data: { trends },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/admin/categories
 * Admin category breakdown — includes all reports.
 */
export async function getAdminCategoryStatsController(req, res, next) {
  try {
    const { range, start_date, end_date, county, status } = req.query;
    const categories = await getAdminCategoryStats({ range, start_date, end_date, county, status });
    return res.status(200).json({
      success: true,
      data: { categories },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/admin/status
 * Admin status breakdown — includes all reports.
 */
export async function getAdminStatusStatsController(req, res, next) {
  try {
    const { range, start_date, end_date, county, category } = req.query;
    const statuses = await getAdminStatusStats({ range, start_date, end_date, county, category });
    return res.status(200).json({
      success: true,
      data: { statuses },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/admin/geography
 * Admin geography — no threshold, includes sensitive counts (aggregate only).
 */
export async function getAdminGeographyStatsController(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const geography = await getAdminGeographyStats(filters);
    return res.status(200).json({
      success: true,
      data: { geography },
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/admin/alerts
 * Admin alert statistics — includes draft counts and category breakdown.
 */
export async function getAdminAlertStatsController(req, res, next) {
  try {
    const { range, start_date, end_date, county } = req.query;
    const data = await getAdminAlertStats({ range, start_date, end_date, county });
    return res.status(200).json({
      success: true,
      data,
      filters: buildFiltersResponse(req.query)
    });
  } catch (error) {
    next(error);
  }
}
