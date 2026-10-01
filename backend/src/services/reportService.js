import fs from 'fs';
import { pool } from '../config/database.js';

/**
 * Retrieve all active report categories.
 */
export async function getActiveCategories() {
  const [categories] = await pool.query(
    'SELECT id, name, description FROM report_categories WHERE is_active = TRUE ORDER BY id ASC'
  );
  return categories;
}

/**
 * Create a new incident report with atomic transaction, initial status history, and attachments.
 */
export async function createReport({ userId, reportData, files = [] }) {
  // 1. Verify category is valid and active
  const [categories] = await pool.query(
    'SELECT id, name FROM report_categories WHERE id = ? AND is_active = TRUE',
    [reportData.category_id]
  );

  if (categories.length === 0) {
    cleanupFiles(files);
    const err = new Error('Selected incident category is invalid or inactive.');
    err.status = 400;
    throw err;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 2. Insert base report record
    const insertSql = `
      INSERT INTO reports (
        user_id,
        category_id,
        title,
        description,
        county,
        sub_county,
        ward,
        location_text,
        latitude,
        longitude,
        incident_date,
        incident_time,
        is_anonymous,
        preferred_contact,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
    `;

    const [insertResult] = await conn.execute(insertSql, [
      userId,
      reportData.category_id,
      reportData.title,
      reportData.description,
      reportData.county,
      reportData.sub_county || null,
      reportData.ward || null,
      reportData.location_text || null,
      reportData.latitude !== undefined && reportData.latitude !== null ? reportData.latitude : null,
      reportData.longitude !== undefined && reportData.longitude !== null ? reportData.longitude : null,
      reportData.incident_date || null,
      reportData.incident_time || null,
      reportData.is_anonymous ? 1 : 0,
      reportData.preferred_contact || 'none'
    ]);

    const reportId = insertResult.insertId;

    // 3. Generate unique server-side reference: CWK-YYYY-XXXXXX
    const currentYear = new Date().getFullYear();
    const reference = `CWK-${currentYear}-${String(reportId).padStart(6, '0')}`;

    await conn.execute(
      'UPDATE reports SET report_reference = ? WHERE id = ?',
      [reference, reportId]
    );

    // 4. Milestone 5: Record initial status history entry
    await conn.execute(
      `INSERT INTO report_status_history (
        report_id,
        status,
        note,
        visible_to_citizen
      ) VALUES (?, 'Submitted', 'Report submitted by citizen.', TRUE)`,
      [reportId]
    );

    // 5. Record attachments if any
    if (files && files.length > 0) {
      const attachmentSql = `
        INSERT INTO report_attachments (
          report_id,
          original_name,
          stored_name,
          mime_type,
          size_bytes,
          storage_path
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const file of files) {
        await conn.execute(attachmentSql, [
          reportId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          file.path
        ]);
      }
    }

    await conn.commit();

    return {
      reference,
      status: 'Submitted',
      category: categories[0].name,
      title: reportData.title,
      county: reportData.county,
      isAnonymous: Boolean(reportData.is_anonymous),
      attachmentCount: files.length,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    await conn.rollback();
    cleanupFiles(files);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Helper to safely remove uploaded files if a transaction fails
 */
function cleanupFiles(files) {
  if (!files || !Array.isArray(files)) return;
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error(`[Upload] Failed to clean up file ${file.path}:`, e.message);
      }
    }
  }
}

/**
 * Milestone 5: List reports submitted by the authenticated citizen with search, filtering, and pagination.
 */
export async function listCitizenReports({
  userId,
  page = 1,
  limit = 10,
  status,
  category_id,
  search,
  sort = 'updated_at',
  order = 'DESC'
}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (safePage - 1) * safeLimit;

  // Whitelist sort fields
  const allowedSortMap = {
    updated_at: 'r.updated_at',
    created_at: 'r.created_at',
    incident_date: 'r.incident_date'
  };
  const sortCol = allowedSortMap[sort] || 'r.updated_at';
  const sortDir = order === 'ASC' ? 'ASC' : 'DESC';

  // Base conditions - always scoped strictly to req.user.id
  const conditions = ['r.user_id = ?'];
  const params = [userId];

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (category_id) {
    conditions.push('r.category_id = ?');
    params.push(category_id);
  }

  if (search) {
    conditions.push('(r.report_reference LIKE ? OR r.title LIKE ? OR r.description LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // 1. Get total matching count
  const countSql = `SELECT COUNT(*) AS total FROM reports r ${whereClause}`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0]?.total || 0;
  const totalPages = Math.ceil(total / safeLimit) || 1;

  // 2. Fetch reports page
  const listSql = `
    SELECT
      r.report_reference AS reference,
      r.title,
      r.county,
      r.sub_county,
      r.ward,
      r.status,
      r.is_anonymous,
      r.incident_date,
      r.created_at,
      r.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      (SELECT COUNT(*) FROM report_attachments a WHERE a.report_id = r.id) AS attachment_count
    FROM reports r
    JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    ORDER BY ${sortCol} ${sortDir}, r.id ${sortDir}
    LIMIT ? OFFSET ?
  `;

  // Use pool.query with LIMIT & OFFSET integers
  const queryParams = [...params, safeLimit, offset];
  const [rows] = await pool.query(listSql, queryParams);

  const reports = rows.map((row) => ({
    reference: row.reference,
    title: row.title,
    category: {
      id: row.category_id,
      name: row.category_name
    },
    county: row.county,
    sub_county: row.sub_county,
    ward: row.ward,
    status: row.status,
    is_anonymous: Boolean(row.is_anonymous),
    attachment_count: Number(row.attachment_count),
    incident_date: row.incident_date,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));

  return {
    reports,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages
    }
  };
}

/**
 * Milestone 5: Retrieve a specific report's citizen-safe details, attachments, and status history.
 * Enforces ownership: only returns data if report belongs to userId.
 */
export async function getCitizenReportDetail({ userId, reference }) {
  // 1. Fetch base report with category
  const [reports] = await pool.query(
    `SELECT
      r.id,
      r.report_reference AS reference,
      r.title,
      r.description,
      r.county,
      r.sub_county,
      r.ward,
      r.location_text,
      r.latitude,
      r.longitude,
      r.incident_date,
      r.incident_time,
      r.is_anonymous,
      r.preferred_contact,
      r.status,
      r.created_at,
      r.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      c.description AS category_description
    FROM reports r
    JOIN report_categories c ON r.category_id = c.id
    WHERE r.report_reference = ? AND r.user_id = ?`,
    [reference, userId]
  );

  if (reports.length === 0) {
    return null;
  }

  const reportRow = reports[0];
  const reportId = reportRow.id;

  // 2. Fetch attachments (only safe metadata, no storage paths)
  const [attachmentRows] = await pool.query(
    `SELECT
      id,
      original_name,
      mime_type,
      size_bytes,
      created_at
    FROM report_attachments
    WHERE report_id = ?
    ORDER BY id ASC`,
    [reportId]
  );

  // 3. Fetch citizen-visible status history (visible_to_citizen = TRUE)
  const [historyRows] = await pool.query(
    `SELECT
      id,
      status,
      note,
      created_at
    FROM report_status_history
    WHERE report_id = ? AND visible_to_citizen = TRUE
    ORDER BY created_at ASC, id ASC`,
    [reportId]
  );

  // 4. Fetch published citizen updates (Milestone 7 integration)
  const [updateRows] = await pool.query(
    `SELECT
      id,
      message,
      created_at
    FROM report_updates
    WHERE report_id = ?
    ORDER BY created_at ASC, id ASC`,
    [reportId]
  );

  return {
    reference: reportRow.reference,
    title: reportRow.title,
    description: reportRow.description,
    category: {
      id: reportRow.category_id,
      name: reportRow.category_name,
      description: reportRow.category_description
    },
    county: reportRow.county,
    sub_county: reportRow.sub_county,
    ward: reportRow.ward,
    location_text: reportRow.location_text,
    latitude: reportRow.latitude !== null ? Number(reportRow.latitude) : null,
    longitude: reportRow.longitude !== null ? Number(reportRow.longitude) : null,
    incident_date: reportRow.incident_date,
    incident_time: reportRow.incident_time,
    is_anonymous: Boolean(reportRow.is_anonymous),
    preferred_contact: reportRow.preferred_contact,
    status: reportRow.status,
    created_at: reportRow.created_at,
    updated_at: reportRow.updated_at,
    attachments: attachmentRows.map((att) => ({
      id: att.id,
      original_name: att.original_name,
      mime_type: att.mime_type,
      size_bytes: att.size_bytes,
      created_at: att.created_at
    })),
    status_history: historyRows.map((hist) => ({
      id: hist.id,
      status: hist.status,
      note: hist.note,
      created_at: hist.created_at
    })),
    citizen_updates: updateRows.map((upd) => ({
      id: upd.id,
      message: upd.message,
      created_at: upd.created_at
    }))
  };
}

/**
 * Milestone 5: Retrieve verified file attachment record for the citizen, verifying complete ownership chain.
 */
export async function getAttachmentForCitizen({ userId, reference, attachmentId }) {
  const [rows] = await pool.query(
    `SELECT
      a.id,
      a.original_name,
      a.stored_name,
      a.mime_type,
      a.size_bytes,
      a.storage_path
    FROM report_attachments a
    JOIN reports r ON a.report_id = r.id
    WHERE r.report_reference = ? AND r.user_id = ? AND a.id = ?`,
    [reference, userId, attachmentId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

/**
 * Milestone 5: Retrieve real database statistics for the authenticated citizen.
 */
export async function getCitizenReportSummary(userId) {
  // Query status counts grouped by status for this user
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM reports
     WHERE user_id = ?
     GROUP BY status`,
    [userId]
  );

  const counts = {
    total: 0,
    submitted: 0,
    underReview: 0,
    verified: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0
  };

  for (const row of rows) {
    const count = Number(row.count) || 0;
    counts.total += count;
    switch (row.status) {
      case 'Submitted':
        counts.submitted = count;
        break;
      case 'Under Review':
        counts.underReview = count;
        break;
      case 'Verified':
        counts.verified = count;
        break;
      case 'Assigned':
        counts.assigned = count;
        break;
      case 'In Progress':
        counts.inProgress = count;
        break;
      case 'Resolved':
        counts.resolved = count;
        break;
      case 'Closed':
        counts.closed = count;
        break;
      case 'Rejected':
      case 'Dismissed':
        counts.rejected = count;
        break;
      default:
        break;
    }
  }

  return counts;
}

/**
 * Get total reports submitted by a specific user (backwards compatible helper)
 */
export async function getUserReportCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM reports WHERE user_id = ?',
    [userId]
  );
  return rows[0]?.total || 0;
}
