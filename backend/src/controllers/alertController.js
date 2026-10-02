import * as alertService from '../services/alertService.js';

/**
 * Public: List active alerts & advisories
 * GET /api/alerts
 */
export async function getPublicAlerts(req, res, next) {
  try {
    const {
      page,
      limit,
      category,
      alert_type,
      severity,
      county,
      sub_county,
      utility_service,
      search,
      status
    } = req.query;

    const result = await alertService.listPublicAlerts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      category,
      alert_type,
      severity,
      county,
      sub_county,
      utility_service,
      search,
      status
    });

    return res.status(200).json({
      success: true,
      data: result.alerts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Get single alert detail
 * GET /api/alerts/:id
 */
export async function getPublicAlertById(req, res, next) {
  try {
    const { id } = req.params;
    const alert = await alertService.getPublicAlertDetail(Number(id));

    return res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Citizen: Submit Community Advisory
 * POST /api/alerts/community
 */
export async function createCommunityAdvisory(req, res, next) {
  try {
    const userId = req.user.id;
    const userCounty = req.user.county;
    const data = req.body;

    const result = await alertService.submitCommunityAdvisory({
      userId,
      userCounty,
      data
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
