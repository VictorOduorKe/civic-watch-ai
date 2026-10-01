import fs from 'fs';
import path from 'path';
import {
  getActiveCategories,
  createReport as createReportService,
  listCitizenReports,
  getCitizenReportDetail,
  getAttachmentForCitizen,
  getCitizenReportSummary,
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
 * GET /api/reports/my
 * Milestone 5: Retrieves paginated reports submitted by the authenticated citizen.
 */
export async function getMyReports(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, status, category_id, search, sort, order } = req.query;

    const result = await listCitizenReports({
      userId,
      page,
      limit,
      status,
      category_id,
      search,
      sort,
      order
    });

    return res.status(200).json({
      success: true,
      reports: result.reports,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/my/summary
 * Milestone 5: Retrieves real status counts for the authenticated citizen.
 */
export async function getMySummary(req, res, next) {
  try {
    const userId = req.user.id;
    const summary = await getCitizenReportSummary(userId);

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/my/:reference
 * Milestone 5: Retrieves citizen-safe details, attachments metadata, and visible status history.
 * Generic 404 returned if report does not exist or belongs to another user.
 */
export async function getMyReportDetail(req, res, next) {
  try {
    const userId = req.user.id;
    const { reference } = req.params;

    const report = await getCitizenReportDetail({ userId, reference });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/my/:reference/attachments/:attachmentId
 * Milestone 5: Safely serves/downloads an attachment file after verifying full user-report-attachment ownership chain.
 */
export async function downloadAttachment(req, res, next) {
  try {
    const userId = req.user.id;
    const { reference, attachmentId } = req.params;

    const attachment = await getAttachmentForCitizen({
      userId,
      reference,
      attachmentId
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const absolutePath = path.resolve(attachment.storage_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Attachment file is unavailable on storage'
      });
    }

    // Set secure download headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    
    // Safely send the file with original name
    return res.download(absolutePath, attachment.original_name);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/stats/me
 * Retrieves current user's report statistics (real counts from database).
 */
export async function getMyStats(req, res, next) {
  try {
    const userId = req.user.id;
    const summary = await getCitizenReportSummary(userId);

    return res.status(200).json({
      success: true,
      stats: {
        submitted: summary.submitted,
        underReview: summary.underReview,
        inProgress: summary.inProgress,
        resolved: summary.resolved,
        total: summary.total
      }
    });
  } catch (error) {
    next(error);
  }
}
