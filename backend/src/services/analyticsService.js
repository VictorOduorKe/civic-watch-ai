import { pool } from '../config/database.js';

/**
 * M12 — Civic Intelligence & Insights: Analytics Service
 *
 * PRIVACY RULES:
 *  - Public endpoints: anonymous reports are included in aggregate counts
 *    but geographic groups with < MIN_PUBLIC_COUNT records are omitted.
 *  - No PII (name, email, phone, addresses, coordinates) in any aggregated output.
 *  - Admin endpoints: authenticated + authorized; full aggregates including anonymous.
 *
 * SECURITY: All queries use parameterized statements. No string interpolation of user input.
 */

// Minimum record count required before a geographic group is shown publicly.
// Configurable — change here and restart.
export const MIN_PUBLIC_COUNT = 5;

// ─── Date Filter Helper ───────────────────────────────────────────────────────

/**
 * Builds a safe SQL date-range fragment and params array.
 * Column name is a trusted internal constant, NOT user input.
 *
 * @param {string} column - Trusted SQL column expression (e.g. 'r.created_at')
 * @param {object} opts   - { range, start_date, end_date }
 * @returns {{ clause: string, params: any[] }}
 */
function buildDateFilter(column, { range, start_date, end_date } = {}) {
  const params = [];
  let clause = '';

  // Explicit date range takes precedence over predefined range
  if (start_date || end_date) {
    const conditions = [];
    if (start_date) {
      conditions.push(`${column} >= ?`);
      params.push(new Date(start_date));
    }
    if (end_date) {
      const endOfDay = new Date(end_date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(`${column} <= ?`);
      params.push(endOfDay);
    }
    clause = conditions.join(' AND ');
    return { clause, params };
  }

  // Predefined range
  switch (range) {
    case '7d':
      clause = `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      break;
    case '30d':
      clause = `${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      break;
    case '90d':
      clause = `${column} >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
      break;
    case '12m':
      clause = `${column} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`;
      break;
    default:
      // 'all' or no range — no date restriction
      break;
  }

  return { clause, params };
}

/**
 * Selects an appropriate MySQL DATE_FORMAT string based on span.
 */
function pickDateFormat(range, start_date, end_date) {
  if (range === '7d' || range === '30d' || range === '90d') return '%Y-%m-%d';
  if (range === '12m') return '%Y-%m';
  if (start_date && end_date) {
    const diff = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24);
    return diff <= 90 ? '%Y-%m-%d' : '%Y-%m';
  }
  return '%Y-%m';
}

// ─── Overview Analytics ───────────────────────────────────────────────────────

/**
 * Public-safe overview statistics.
 */
export async function getPublicOverview({ range, start_date, end_date, county, category, status } = {}) {
  const conditions = [];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [overviewRows] = await pool.query(`
    SELECT
      COUNT(r.id) AS total_reports,
      SUM(CASE WHEN r.status IN ('Submitted','Under Review','Verified','Assigned','In Progress') THEN 1 ELSE 0 END) AS active_reports,
      SUM(CASE WHEN r.status IN ('Resolved','Closed') THEN 1 ELSE 0 END)   AS resolved_reports,
      SUM(CASE WHEN r.status IN ('Rejected','Dismissed') THEN 1 ELSE 0 END) AS rejected_reports,
      SUM(CASE WHEN r.status = 'Submitted' THEN 1 ELSE 0 END)  AS submitted_reports,
      SUM(CASE WHEN r.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_reports
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
  `, params);

  const [alertRows] = await pool.query(
    `SELECT COUNT(*) AS active_alerts FROM civic_alerts WHERE status = 'ACTIVE'`
  );

  const row = overviewRows[0] || {};
  return {
    total_reports: Number(row.total_reports) || 0,
    active_reports: Number(row.active_reports) || 0,
    resolved_reports: Number(row.resolved_reports) || 0,
    rejected_reports: Number(row.rejected_reports) || 0,
    submitted_reports: Number(row.submitted_reports) || 0,
    in_progress_reports: Number(row.in_progress_reports) || 0,
    active_alerts: Number(alertRows[0]?.active_alerts) || 0
  };
}

/**
 * Admin-only overview — includes sensitive aggregate counts.
 */
export async function getAdminOverview({ range, start_date, end_date, county, category, status } = {}) {
  const conditions = [];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [overviewRows] = await pool.query(`
    SELECT
      COUNT(r.id) AS total_reports,
      SUM(CASE WHEN r.status IN ('Submitted','Under Review','Verified','Assigned','In Progress') THEN 1 ELSE 0 END) AS active_reports,
      SUM(CASE WHEN r.status IN ('Resolved','Closed') THEN 1 ELSE 0 END)    AS resolved_reports,
      SUM(CASE WHEN r.status IN ('Rejected','Dismissed') THEN 1 ELSE 0 END) AS rejected_reports,
      SUM(CASE WHEN r.status = 'Submitted' THEN 1 ELSE 0 END)   AS submitted_reports,
      SUM(CASE WHEN r.status = 'Under Review' THEN 1 ELSE 0 END) AS under_review_reports,
      SUM(CASE WHEN r.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_reports,
      SUM(CASE WHEN r.is_anonymous = TRUE THEN 1 ELSE 0 END)    AS anonymous_count
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
  `, params);

  const [alertRows] = await pool.query(`
    SELECT
      COUNT(*) AS total_alerts,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END)   AS active_alerts,
      SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END)  AS expired_alerts,
      SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived_alerts,
      SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END)    AS draft_alerts
    FROM civic_alerts
  `);

  const [userRows] = await pool.query(
    `SELECT COUNT(*) AS total_users, SUM(is_active) AS active_users FROM users`
  );

  const r = overviewRows[0] || {};
  const a = alertRows[0] || {};
  const u = userRows[0] || {};

  return {
    total_reports: Number(r.total_reports) || 0,
    active_reports: Number(r.active_reports) || 0,
    resolved_reports: Number(r.resolved_reports) || 0,
    rejected_reports: Number(r.rejected_reports) || 0,
    submitted_reports: Number(r.submitted_reports) || 0,
    under_review_reports: Number(r.under_review_reports) || 0,
    in_progress_reports: Number(r.in_progress_reports) || 0,
    anonymous_reports_count: Number(r.anonymous_count) || 0,
    total_alerts: Number(a.total_alerts) || 0,
    active_alerts: Number(a.active_alerts) || 0,
    expired_alerts: Number(a.expired_alerts) || 0,
    archived_alerts: Number(a.archived_alerts) || 0,
    draft_alerts: Number(a.draft_alerts) || 0,
    total_users: Number(u.total_users) || 0,
    active_users: Number(u.active_users) || 0
  };
}

// ─── Report Trends ────────────────────────────────────────────────────────────

export async function getPublicReportTrends({ range = '30d', start_date, end_date, county, category, status } = {}) {
  const dateFormat = pickDateFormat(range, start_date, end_date);
  const conditions = [];
  const params = [dateFormat];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(r.created_at, ?) AS period,
      COUNT(r.id) AS total,
      SUM(CASE WHEN r.status IN ('Resolved','Closed') THEN 1 ELSE 0 END) AS resolved
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    GROUP BY period
    ORDER BY period ASC
  `, params);

  return rows.map((row) => ({
    period: row.period,
    total: Number(row.total) || 0,
    resolved: Number(row.resolved) || 0
  }));
}

export async function getAdminReportTrends({ range = '30d', start_date, end_date, county, category, status } = {}) {
  const dateFormat = pickDateFormat(range, start_date, end_date);
  const conditions = [];
  const params = [dateFormat];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(r.created_at, ?) AS period,
      COUNT(r.id) AS total,
      SUM(CASE WHEN r.status IN ('Resolved','Closed') THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN r.status IN ('Submitted','Under Review','Verified','Assigned','In Progress') THEN 1 ELSE 0 END) AS active
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    GROUP BY period
    ORDER BY period ASC
  `, params);

  return rows.map((row) => ({
    period: row.period,
    total: Number(row.total) || 0,
    resolved: Number(row.resolved) || 0,
    active: Number(row.active) || 0
  }));
}

// ─── Category Analytics ───────────────────────────────────────────────────────

export async function getPublicCategoryStats({ range, start_date, end_date, county, status } = {}) {
  const conditions = [];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const joinConditions = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT
      c.id   AS category_id,
      c.name AS category_name,
      COUNT(r.id) AS count
    FROM report_categories c
    LEFT JOIN reports r ON r.category_id = c.id ${joinConditions}
    WHERE c.is_active = TRUE
    GROUP BY c.id, c.name
    ORDER BY count DESC, c.name ASC
  `, params);

  const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

  return rows.map((row) => ({
    category_id: row.category_id,
    category_name: row.category_name,
    count: Number(row.count) || 0,
    percentage: total > 0 ? Math.round(((Number(row.count) || 0) / total) * 1000) / 10 : 0
  }));
}

export async function getAdminCategoryStats({ range, start_date, end_date, county, status } = {}) {
  return getPublicCategoryStats({ range, start_date, end_date, county, status });
}

// ─── Status Analytics ─────────────────────────────────────────────────────────

export async function getPublicStatusStats({ range, start_date, end_date, county, category } = {}) {
  const conditions = [];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT r.status, COUNT(r.id) AS count
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    GROUP BY r.status
    ORDER BY count DESC
  `, params);

  const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count) || 0,
    percentage: total > 0 ? Math.round(((Number(row.count) || 0) / total) * 1000) / 10 : 0
  }));
}

export async function getAdminStatusStats({ range, start_date, end_date, county, category } = {}) {
  return getPublicStatusStats({ range, start_date, end_date, county, category });
}

// ─── Geographic Analytics ─────────────────────────────────────────────────────

/**
 * Public geographic breakdown.
 * MIN_PUBLIC_COUNT threshold applied — prevents identifying individuals.
 * No private coordinates or exact addresses exposed.
 */
export async function getPublicGeographyStats({ range, start_date, end_date, county, category, status } = {}) {
  const conditions = ["r.county IS NOT NULL", "r.county != ''"];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(`
    SELECT
      r.county,
      COUNT(r.id) AS count
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    GROUP BY r.county
    HAVING count >= ?
    ORDER BY count DESC
    LIMIT 20
  `, [...params, MIN_PUBLIC_COUNT]);

  return rows.map((row) => ({
    county: row.county,
    count: Number(row.count) || 0
  }));
}

/**
 * Admin geographic breakdown — no threshold.
 * Includes resolved counts. No individual addresses or coordinates exposed.
 */
export async function getAdminGeographyStats({ range, start_date, end_date, county, category, status } = {}) {
  const conditions = ["r.county IS NOT NULL", "r.county != ''"];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('r.created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('r.county = ?'); params.push(county); }
  if (category) { conditions.push('c.name = ?'); params.push(category); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(`
    SELECT
      r.county,
      COUNT(r.id) AS count,
      SUM(CASE WHEN r.status IN ('Resolved','Closed') THEN 1 ELSE 0 END) AS resolved
    FROM reports r
    LEFT JOIN report_categories c ON r.category_id = c.id
    ${whereClause}
    GROUP BY r.county
    ORDER BY count DESC
    LIMIT 30
  `, params);

  return rows.map((row) => ({
    county: row.county,
    count: Number(row.count) || 0,
    resolved: Number(row.resolved) || 0
  }));
}

// ─── Alert Analytics ──────────────────────────────────────────────────────────

export async function getPublicAlertStats({ range, start_date, end_date, county } = {}) {
  const conditions = ["status != 'DRAFT'"];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('county = ?'); params.push(county); }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [summaryRows] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END)   AS active,
      SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END)  AS expired,
      SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived
    FROM civic_alerts
    ${whereClause}
  `, params);

  const [severityRows] = await pool.query(`
    SELECT severity, COUNT(*) AS count
    FROM civic_alerts
    ${whereClause}
    GROUP BY severity
    ORDER BY count DESC
  `, params);

  const s = summaryRows[0] || {};
  return {
    total: Number(s.total) || 0,
    active: Number(s.active) || 0,
    expired: Number(s.expired) || 0,
    archived: Number(s.archived) || 0,
    by_severity: severityRows.map((row) => ({
      severity: row.severity,
      count: Number(row.count) || 0
    }))
  };
}

export async function getAdminAlertStats({ range, start_date, end_date, county } = {}) {
  const conditions = [];
  const params = [];

  const { clause: dateClause, params: dateParams } = buildDateFilter('created_at', { range, start_date, end_date });
  if (dateClause) { conditions.push(dateClause); params.push(...dateParams); }
  if (county) { conditions.push('county = ?'); params.push(county); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [summaryRows] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END)    AS draft,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END)   AS active,
      SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END)  AS expired,
      SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived
    FROM civic_alerts
    ${whereClause}
  `, params);

  const [severityRows] = await pool.query(`
    SELECT severity, COUNT(*) AS count
    FROM civic_alerts
    ${whereClause}
    GROUP BY severity ORDER BY count DESC
  `, params);

  const [categoryRows] = await pool.query(`
    SELECT alert_type AS category, COUNT(*) AS count
    FROM civic_alerts
    ${whereClause}
    GROUP BY alert_type ORDER BY count DESC
  `, params);

  const s = summaryRows[0] || {};
  return {
    total: Number(s.total) || 0,
    draft: Number(s.draft) || 0,
    active: Number(s.active) || 0,
    expired: Number(s.expired) || 0,
    archived: Number(s.archived) || 0,
    by_severity: severityRows.map((row) => ({ severity: row.severity, count: Number(row.count) || 0 })),
    by_category: categoryRows.map((row) => ({ category: row.category, count: Number(row.count) || 0 }))
  };
}
