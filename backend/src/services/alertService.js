import pool from '../config/database.js';
import { safeCreateNotification } from './notificationService.js';

/**
 * Helper to convert ISO strings / inputs to MySQL Date objects
 */
function toSqlDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * CivicWatch AI Kenya — Alert & Advisory Service (Milestone 11)
 * Handles official alerts, utility interruptions, and moderated community advisories.
 */

/**
 * Lazy sweep to expire alerts whose end_time has passed
 */
export async function expireOverdueAlerts() {
  try {
    await pool.query(`
      UPDATE civic_alerts
      SET status = 'EXPIRED'
      WHERE status = 'ACTIVE'
        AND end_time IS NOT NULL
        AND end_time < NOW()
    `);
  } catch (err) {
    console.error('[AlertService] Error expiring overdue alerts:', err.message);
  }
}

/**
 * Broadcast notifications for high-priority or official published alerts (Milestone 13 Matching Engine)
 */
async function broadcastAlertNotification(alert) {
  try {
    const { dispatchAlertNotifications } = await import('./subscriptionService.js');
    await dispatchAlertNotifications(alert);
  } catch (err) {
    console.error('[AlertService] Failed to broadcast alert notifications:', err.message);
  }
}

/**
 * Helper to record alert audit logs
 */
export async function recordAlertAudit(alertId, userId, action, changeSummary = null, connection = pool) {
  try {
    await connection.query(
      `INSERT INTO civic_alert_audits (alert_id, user_id, action, change_summary)
       VALUES (?, ?, ?, ?)`,
      [alertId, userId, action, changeSummary]
    );
  } catch (err) {
    console.error('[AlertService] Failed to record alert audit:', err.message);
  }
}

/**
 * Public: List active alerts with filtering and search
 */
export async function listPublicAlerts({
  page = 1,
  limit = 20,
  category,
  alert_type,
  severity,
  county,
  sub_county,
  utility_service,
  search,
  status = 'ACTIVE'
}) {
  await expireOverdueAlerts();

  const offset = (page - 1) * limit;
  const whereClauses = ['a.is_public = TRUE'];
  const params = [];

  // Status filtering for public
  if (status === 'ACTIVE') {
    whereClauses.push("a.status = 'ACTIVE' AND (a.end_time IS NULL OR a.end_time > NOW())");
  } else if (status === 'EXPIRED') {
    whereClauses.push("(a.status = 'EXPIRED' OR (a.end_time IS NOT NULL AND a.end_time <= NOW()))");
  } else if (status === 'ALL') {
    whereClauses.push("a.status IN ('ACTIVE', 'EXPIRED')");
  }

  // Category filter
  if (category) {
    const cat = category.toUpperCase();
    if (cat === 'OFFICIAL') {
      whereClauses.push("(a.is_official = TRUE OR a.alert_type IN ('OFFICIAL_COUNTY_ALERT', 'GOVERNMENT_ADVISORY'))");
    } else if (cat === 'UTILITIES') {
      whereClauses.push("a.alert_type = 'UTILITY_DOWNTIME'");
    } else if (cat === 'SAFETY') {
      whereClauses.push("a.alert_type = 'PUBLIC_SAFETY'");
    } else if (cat === 'WEATHER') {
      whereClauses.push("a.alert_type = 'WEATHER_ENVIRONMENTAL'");
    } else if (cat === 'COMMUNITY') {
      whereClauses.push("a.alert_type = 'COMMUNITY_ADVISORY'");
    }
  }

  if (alert_type) {
    whereClauses.push('a.alert_type = ?');
    params.push(alert_type);
  }

  if (severity) {
    whereClauses.push('a.severity = ?');
    params.push(severity);
  }

  if (county && county !== 'All') {
    whereClauses.push('(a.county = ? OR a.county IS NULL OR a.county = \'National\')');
    params.push(county);
  }

  if (sub_county) {
    whereClauses.push('(a.sub_county = ? OR a.sub_county IS NULL)');
    params.push(sub_county);
  }

  if (utility_service) {
    whereClauses.push('a.utility_service = ?');
    params.push(utility_service);
  }

  if (search) {
    whereClauses.push('(a.title LIKE ? OR a.summary LIKE ? OR a.location_text LIKE ? OR a.source_name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM civic_alerts a ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  // Query alerts ordered by severity priority and publication date
  const [rows] = await pool.query(
    `SELECT 
       a.id,
       a.title,
       a.summary,
       a.alert_type,
       a.severity,
       a.status,
       a.verification_status,
       a.is_official,
       a.source_type,
       a.source_name,
       a.source_reference,
       a.county,
       a.sub_county,
       a.ward,
       a.location_text,
       a.utility_service,
       a.downtime_status,
       a.expected_restoration,
       a.actual_restoration,
       a.start_time,
       a.end_time,
       a.published_at,
       a.is_demo,
       a.created_at,
       a.updated_at
     FROM civic_alerts a
     ${whereSql}
     ORDER BY 
       CASE a.severity
         WHEN 'CRITICAL' THEN 1
         WHEN 'HIGH' THEN 2
         WHEN 'MODERATE' THEN 3
         WHEN 'LOW' THEN 4
         ELSE 5
       END ASC,
       a.published_at DESC,
       a.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    alerts: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Public: Get single alert detail
 */
export async function getPublicAlertDetail(id) {
  await expireOverdueAlerts();

  const [rows] = await pool.query(
    `SELECT 
       a.*,
       u.full_name AS creator_name,
       v.full_name AS verifier_name
     FROM civic_alerts a
     LEFT JOIN users u ON a.created_by = u.id
     LEFT JOIN users v ON a.verified_by = v.id
     WHERE a.id = ? AND a.is_public = TRUE AND a.status != 'DRAFT'`,
    [id]
  );

  if (!rows || rows.length === 0) {
    const error = new Error('Alert not found or is not currently public');
    error.status = 404;
    throw error;
  }

  const alert = rows[0];

  // Return clean public data
  return {
    id: alert.id,
    title: alert.title,
    summary: alert.summary,
    description: alert.description,
    alert_type: alert.alert_type,
    severity: alert.severity,
    status: alert.status,
    verification_status: alert.verification_status,
    is_official: Boolean(alert.is_official),
    source_type: alert.source_type,
    source_name: alert.source_name,
    source_reference: alert.source_reference,
    county: alert.county,
    sub_county: alert.sub_county,
    ward: alert.ward,
    location_text: alert.location_text,
    utility_service: alert.utility_service,
    downtime_status: alert.downtime_status,
    expected_restoration: alert.expected_restoration,
    actual_restoration: alert.actual_restoration,
    recommended_action: alert.recommended_action,
    start_time: alert.start_time,
    end_time: alert.end_time,
    published_at: alert.published_at,
    is_demo: Boolean(alert.is_demo),
    created_at: alert.created_at,
    updated_at: alert.updated_at,
    verifier_name: alert.verification_status === 'VERIFIED' ? alert.verifier_name : null
  };
}

/**
 * Citizen: Submit Community Advisory
 * Safeguards:
 * - is_official is strictly false
 * - source_type is strictly 'COMMUNITY'
 * - severity is clamped (never HIGH or CRITICAL)
 * - status starts in PENDING_REVIEW
 * - is_public is false until approved
 */
export async function submitCommunityAdvisory({ userId, userCounty, data }) {
  const allowedSeverity = ['INFO', 'LOW', 'MODERATE'].includes(data.severity)
    ? data.severity
    : 'LOW';

  const [userRows] = await pool.query('SELECT full_name FROM users WHERE id = ?', [userId]);
  const authorName = userRows[0]?.full_name || 'Community Member';

  const [result] = await pool.query(
    `INSERT INTO civic_alerts (
       title,
       summary,
       description,
       alert_type,
       severity,
       status,
       verification_status,
       is_official,
       source_type,
       source_name,
       county,
       sub_county,
       ward,
       location_text,
       recommended_action,
       start_time,
       created_by,
       is_public,
       is_demo
     ) VALUES (?, ?, ?, ?, ?, 'PENDING_REVIEW', 'PENDING', FALSE, 'COMMUNITY', ?, ?, ?, ?, ?, ?, NOW(), ?, FALSE, TRUE)`,
    [
      data.title,
      data.summary,
      data.description,
      data.alert_type || 'COMMUNITY_ADVISORY',
      allowedSeverity,
      `Community Submission (${authorName})`,
      data.county || userCounty || null,
      data.sub_county || null,
      data.ward || null,
      data.location_text || null,
      data.recommended_action || null,
      userId
    ]
  );

  const alertId = result.insertId;

  await recordAlertAudit(
    alertId,
    userId,
    'COMMUNITY_SUBMITTED',
    'Citizen submitted community advisory for moderation review.'
  );

  return {
    id: alertId,
    title: data.title,
    status: 'PENDING_REVIEW',
    verification_status: 'PENDING',
    is_official: false,
    message: 'Community advisory submitted successfully. It will be reviewed by platform moderators before publication.'
  };
}

/**
 * Admin: List all alerts with comprehensive administrative filters
 */
export async function listAdminAlerts({
  page = 1,
  limit = 20,
  status,
  alert_type,
  severity,
  verification_status,
  county,
  source_type,
  search
}) {
  await expireOverdueAlerts();

  const offset = (page - 1) * limit;
  const whereClauses = [];
  const params = [];

  if (status && status !== 'ALL') {
    whereClauses.push('a.status = ?');
    params.push(status);
  }

  if (alert_type) {
    whereClauses.push('a.alert_type = ?');
    params.push(alert_type);
  }

  if (severity) {
    whereClauses.push('a.severity = ?');
    params.push(severity);
  }

  if (verification_status) {
    whereClauses.push('a.verification_status = ?');
    params.push(verification_status);
  }

  if (county && county !== 'All') {
    whereClauses.push('a.county = ?');
    params.push(county);
  }

  if (source_type) {
    whereClauses.push('a.source_type = ?');
    params.push(source_type);
  }

  if (search) {
    whereClauses.push('(a.title LIKE ? OR a.summary LIKE ? OR a.source_name LIKE ? OR a.location_text LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM civic_alerts a ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const [rows] = await pool.query(
    `SELECT 
       a.*,
       u.full_name AS creator_name,
       v.full_name AS verifier_name
     FROM civic_alerts a
     LEFT JOIN users u ON a.created_by = u.id
     LEFT JOIN users v ON a.verified_by = v.id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    alerts: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Admin: Get KPI Summary Stats for Alert Dashboard
 */
export async function getAdminAlertSummaryStats() {
  await expireOverdueAlerts();

  const [statusCounts] = await pool.query(`
    SELECT 
      SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count,
      SUM(CASE WHEN status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'ACTIVE' AND (end_time IS NULL OR end_time > NOW()) THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END) as scheduled_count,
      SUM(CASE WHEN status = 'EXPIRED' OR (end_time IS NOT NULL AND end_time <= NOW()) THEN 1 ELSE 0 END) as expired_count,
      SUM(CASE WHEN verification_status = 'REJECTED' OR status = 'CANCELLED' THEN 1 ELSE 0 END) as rejected_count,
      SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived_count,
      SUM(CASE WHEN is_official = TRUE THEN 1 ELSE 0 END) as official_count,
      SUM(CASE WHEN is_official = FALSE THEN 1 ELSE 0 END) as community_count,
      COUNT(*) as total_alerts
    FROM civic_alerts
  `);

  const [severityCounts] = await pool.query(`
    SELECT severity, COUNT(*) as count 
    FROM civic_alerts 
    WHERE status = 'ACTIVE'
    GROUP BY severity
  `);

  return {
    summary: {
      draft: Number(statusCounts[0]?.draft_count || 0),
      pending: Number(statusCounts[0]?.pending_count || 0),
      active: Number(statusCounts[0]?.active_count || 0),
      scheduled: Number(statusCounts[0]?.scheduled_count || 0),
      expired: Number(statusCounts[0]?.expired_count || 0),
      rejected: Number(statusCounts[0]?.rejected_count || 0),
      archived: Number(statusCounts[0]?.archived_count || 0),
      official: Number(statusCounts[0]?.official_count || 0),
      community: Number(statusCounts[0]?.community_count || 0),
      total: Number(statusCounts[0]?.total_alerts || 0)
    },
    activeSeverityBreakdown: severityCounts
  };
}

/**
 * Admin: Get single alert detail with full audit trail
 */
export async function getAdminAlertDetail(id) {
  await expireOverdueAlerts();

  const [alertRows] = await pool.query(
    `SELECT 
       a.*,
       u.full_name AS creator_name,
       u.email AS creator_email,
       v.full_name AS verifier_name
     FROM civic_alerts a
     LEFT JOIN users u ON a.created_by = u.id
     LEFT JOIN users v ON a.verified_by = v.id
     WHERE a.id = ?`,
    [id]
  );

  if (!alertRows || alertRows.length === 0) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }

  const [auditRows] = await pool.query(
    `SELECT 
       aud.id,
       aud.action,
       aud.change_summary,
       aud.created_at,
       u.full_name AS user_name,
       u.role AS user_role
     FROM civic_alert_audits aud
     JOIN users u ON aud.user_id = u.id
     WHERE aud.alert_id = ?
     ORDER BY aud.created_at DESC`,
    [id]
  );

  return {
    alert: alertRows[0],
    audits: auditRows
  };
}

/**
 * Admin: Create Alert
 */
export async function createAdminAlert({ userId, data }) {
  const isPublishingNow = data.status === 'ACTIVE';
  const isScheduled = data.status === 'SCHEDULED';
  const verificationStatus = isPublishingNow || isScheduled ? 'VERIFIED' : 'PENDING';
  const verifiedBy = isPublishingNow || isScheduled ? userId : null;
  const verifiedAt = isPublishingNow || isScheduled ? new Date() : null;
  const publishedAt = isPublishingNow ? new Date() : null;
  const isPublic = isPublishingNow;

  const [result] = await pool.query(
    `INSERT INTO civic_alerts (
       title,
       summary,
       description,
       alert_type,
       severity,
       status,
       verification_status,
       is_official,
       source_type,
       source_name,
       source_reference,
       county,
       sub_county,
       ward,
       location_text,
       utility_service,
       downtime_status,
       expected_restoration,
       actual_restoration,
       recommended_action,
       start_time,
       end_time,
       published_at,
       created_by,
       verified_by,
       verified_at,
       is_public,
       is_demo
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.summary,
      data.description,
      data.alert_type,
      data.severity || 'INFO',
      data.status || 'DRAFT',
      verificationStatus,
      data.is_official !== undefined ? Boolean(data.is_official) : true,
      data.source_type,
      data.source_name,
      data.source_reference || null,
      data.county || null,
      data.sub_county || null,
      data.ward || null,
      data.location_text || null,
      data.utility_service || null,
      data.downtime_status || null,
      toSqlDate(data.expected_restoration),
      toSqlDate(data.actual_restoration),
      data.recommended_action || null,
      toSqlDate(data.start_time) || new Date(),
      toSqlDate(data.end_time),
      publishedAt,
      userId,
      verifiedBy,
      verifiedAt,
      isPublic,
      data.is_demo !== undefined ? Boolean(data.is_demo) : true
    ]
  );

  const alertId = result.insertId;

  await recordAlertAudit(
    alertId,
    userId,
    'CREATED',
    `Alert created with initial status '${data.status || 'DRAFT'}'`
  );

  if (isPublishingNow) {
    const alertData = {
      id: alertId,
      title: data.title,
      summary: data.summary,
      severity: data.severity,
      county: data.county
    };
    await broadcastAlertNotification(alertData);
  }

  return {
    id: alertId,
    ...data,
    status: data.status || 'DRAFT',
    verification_status: verificationStatus
  };
}

/**
 * Admin: Update Alert
 */
export async function updateAdminAlert({ id, userId, data }) {
  const [existing] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  if (!existing || existing.length === 0) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }

  const alert = existing[0];
  const fields = [];
  const params = [];

  const updateable = [
    'title',
    'summary',
    'description',
    'alert_type',
    'severity',
    'status',
    'source_type',
    'source_name',
    'source_reference',
    'county',
    'sub_county',
    'ward',
    'location_text',
    'utility_service',
    'downtime_status',
    'expected_restoration',
    'actual_restoration',
    'recommended_action',
    'start_time',
    'end_time',
    'is_official',
    'is_demo'
  ];

  for (const field of updateable) {
    if (data[field] !== undefined) {
      let val = data[field];
      if (['expected_restoration', 'actual_restoration', 'start_time', 'end_time'].includes(field)) {
        val = toSqlDate(val);
      }
      fields.push(`${field} = ?`);
      params.push(val);
    }
  }

  if (fields.length === 0) {
    return alert;
  }

  params.push(id);
  await pool.query(`UPDATE civic_alerts SET ${fields.join(', ')} WHERE id = ?`, params);

  await recordAlertAudit(
    id,
    userId,
    'EDITED',
    data.change_summary || 'Alert updated by administrator'
  );

  const [updated] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  return updated[0];
}

/**
 * Admin: Verify or Reject Alert
 */
export async function verifyAlert({ id, userId, verification_status, is_official, notes }) {
  const [existing] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  if (!existing || existing.length === 0) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }

  const alert = existing[0];
  let newStatus = alert.status;
  let isPublic = alert.is_public;
  let publishedAt = alert.published_at;

  if (verification_status === 'VERIFIED') {
    if (alert.status === 'PENDING_REVIEW' || alert.status === 'DRAFT') {
      newStatus = 'ACTIVE';
      isPublic = true;
      publishedAt = publishedAt || new Date();
    }
  } else if (verification_status === 'REJECTED') {
    newStatus = 'CANCELLED';
    isPublic = false;
  }

  const updateFields = [
    'verification_status = ?',
    'verified_by = ?',
    'verified_at = NOW()',
    'status = ?',
    'is_public = ?',
    'published_at = ?'
  ];
  const updateParams = [
    verification_status,
    userId,
    newStatus,
    isPublic,
    publishedAt
  ];

  if (is_official !== undefined) {
    updateFields.push('is_official = ?');
    updateParams.push(Boolean(is_official));
  }

  updateParams.push(id);

  await pool.query(
    `UPDATE civic_alerts SET ${updateFields.join(', ')} WHERE id = ?`,
    updateParams
  );

  await recordAlertAudit(
    id,
    userId,
    verification_status,
    notes || `Alert marked as ${verification_status}`
  );

  if (verification_status === 'VERIFIED' && newStatus === 'ACTIVE') {
    await broadcastAlertNotification({
      id: alert.id,
      title: alert.title,
      summary: alert.summary,
      severity: alert.severity,
      county: alert.county
    });
  }

  const [updated] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  return updated[0];
}

/**
 * Admin: Publish Alert
 */
export async function publishAlert({ id, userId, schedule_time, notes }) {
  const [existing] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  if (!existing || existing.length === 0) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }

  const alert = existing[0];
  const isScheduled = Boolean(schedule_time);
  const newStatus = isScheduled ? 'SCHEDULED' : 'ACTIVE';
  const startTime = isScheduled ? toSqlDate(schedule_time) : (alert.start_time || new Date());
  const publishedAt = isScheduled ? null : new Date();

  await pool.query(
    `UPDATE civic_alerts
     SET status = ?,
         is_public = ?,
         start_time = ?,
         published_at = ?,
         verification_status = 'VERIFIED',
         verified_by = IF(verified_by IS NULL, ?, verified_by),
         verified_at = IF(verified_at IS NULL, NOW(), verified_at)
     WHERE id = ?`,
    [newStatus, !isScheduled, startTime, publishedAt, userId, id]
  );

  await recordAlertAudit(
    id,
    userId,
    isScheduled ? 'SCHEDULED' : 'PUBLISHED',
    notes || (isScheduled ? `Scheduled for publication at ${schedule_time}` : 'Alert published immediately')
  );

  if (!isScheduled) {
    await broadcastAlertNotification({
      id: alert.id,
      title: alert.title,
      summary: alert.summary,
      severity: alert.severity,
      county: alert.county
    });
  }

  const [updated] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  return updated[0];
}

/**
 * Admin: Archive Alert
 */
export async function archiveAlert({ id, userId, notes }) {
  const [existing] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  if (!existing || existing.length === 0) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }

  await pool.query(
    `UPDATE civic_alerts
     SET status = 'ARCHIVED'
     WHERE id = ?`,
    [id]
  );

  await recordAlertAudit(
    id,
    userId,
    'ARCHIVED',
    notes || 'Alert archived by administrator'
  );

  const [updated] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [id]);
  return updated[0];
}
