import * as alertService from '../services/alertService.js';

/**
 * Admin: List alerts with administrative filtering
 * GET /api/admin/alerts
 */
export async function getAdminAlerts(req, res, next) {
  try {
    const {
      page,
      limit,
      status,
      alert_type,
      severity,
      verification_status,
      county,
      source_type,
      search
    } = req.query;

    const result = await alertService.listAdminAlerts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      alert_type,
      severity,
      verification_status,
      county,
      source_type,
      search
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
 * Admin: Get summary statistics for alert management
 * GET /api/admin/alerts/summary
 */
export async function getAdminAlertStats(req, res, next) {
  try {
    const stats = await alertService.getAdminAlertSummaryStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get alert detail with full audit trail
 * GET /api/admin/alerts/:id
 */
export async function getAdminAlertById(req, res, next) {
  try {
    const { id } = req.params;
    const detail = await alertService.getAdminAlertDetail(Number(id));

    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create a new alert
 * POST /api/admin/alerts
 */
export async function createAdminAlert(req, res, next) {
  try {
    const userId = req.user.id;
    const data = req.body;

    const created = await alertService.createAdminAlert({ userId, data });

    return res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update existing alert
 * PUT /api/admin/alerts/:id
 */
export async function updateAdminAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    const updated = await alertService.updateAdminAlert({
      id: Number(id),
      userId,
      data
    });

    return res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Verify or reject alert
 * POST /api/admin/alerts/:id/verify
 */
export async function verifyAdminAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { verification_status, is_official, notes } = req.body;

    const verified = await alertService.verifyAlert({
      id: Number(id),
      userId,
      verification_status,
      is_official,
      notes
    });

    return res.status(200).json({
      success: true,
      message: `Alert ${verification_status.toLowerCase()} successfully`,
      data: verified
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Publish alert immediately or schedule
 * POST /api/admin/alerts/:id/publish
 */
export async function publishAdminAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { schedule_time, notes } = req.body;

    const published = await alertService.publishAlert({
      id: Number(id),
      userId,
      schedule_time,
      notes
    });

    return res.status(200).json({
      success: true,
      message: schedule_time ? 'Alert scheduled successfully' : 'Alert published successfully',
      data: published
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Archive alert
 * POST /api/admin/alerts/:id/archive
 */
export async function archiveAdminAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const archived = await alertService.archiveAlert({
      id: Number(id),
      userId,
      notes
    });

    return res.status(200).json({
      success: true,
      message: 'Alert archived successfully',
      data: archived
    });
  } catch (error) {
    next(error);
  }
}
