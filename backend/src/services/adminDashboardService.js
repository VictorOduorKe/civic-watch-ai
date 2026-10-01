import { pool } from '../config/database.js';

/**
 * Retrieve comprehensive overview statistics and aggregations for the OCL Admin Dashboard.
 * Strictly uses real database queries with parameterized statements.
 * Never exposes individual citizen personally identifiable information (PII).
 *
 * @param {Object} options
 * @param {string} options.range - Time window for trend analysis ('7d', '30d', '90d', 'year', 'all')
 */
export async function getAdminDashboardSummary({ range = '30d' } = {}) {
  // 1. Report Status Breakdown & Totals
  const [statusRows] = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM reports
    GROUP BY status
  `);

  const summary = {
    total_reports: 0,
    submitted_reports: 0,
    under_review_reports: 0,
    verified_reports: 0,
    assigned_reports: 0,
    in_progress_reports: 0,
    resolved_reports: 0,
    closed_reports: 0,
    rejected_reports: 0,
    total_users: 0,
    active_users: 0,
    citizens_count: 0,
    admins_count: 0,
    moderators_count: 0,
    analysts_count: 0
  };

  const statusCountMap = {
    'Submitted': 0,
    'Under Review': 0,
    'Verified': 0,
    'Assigned': 0,
    'In Progress': 0,
    'Resolved': 0,
    'Closed': 0,
    'Rejected': 0
  };

  for (const row of statusRows) {
    const count = Number(row.count) || 0;
    summary.total_reports += count;

    if (row.status === 'Submitted') {
      summary.submitted_reports = count;
      statusCountMap['Submitted'] = count;
    } else if (row.status === 'Under Review') {
      summary.under_review_reports = count;
      statusCountMap['Under Review'] = count;
    } else if (row.status === 'Verified') {
      summary.verified_reports = count;
      statusCountMap['Verified'] = count;
    } else if (row.status === 'Assigned') {
      summary.assigned_reports = count;
      statusCountMap['Assigned'] = count;
    } else if (row.status === 'In Progress') {
      summary.in_progress_reports = count;
      statusCountMap['In Progress'] = count;
    } else if (row.status === 'Resolved') {
      summary.resolved_reports = count;
      statusCountMap['Resolved'] = count;
    } else if (row.status === 'Closed') {
      summary.closed_reports = count;
      statusCountMap['Closed'] = count;
    } else if (row.status === 'Rejected' || row.status === 'Dismissed') {
      summary.rejected_reports += count;
      statusCountMap['Rejected'] += count;
    }
  }

  const reports_by_status = [
    { status: 'Submitted', count: statusCountMap['Submitted'] },
    { status: 'Under Review', count: statusCountMap['Under Review'] },
    { status: 'Verified', count: statusCountMap['Verified'] },
    { status: 'Assigned', count: statusCountMap['Assigned'] },
    { status: 'In Progress', count: statusCountMap['In Progress'] },
    { status: 'Resolved', count: statusCountMap['Resolved'] },
    { status: 'Closed', count: statusCountMap['Closed'] },
    { status: 'Rejected', count: statusCountMap['Rejected'] }
  ];

  // 2. User Statistics (Aggregated from users table)
  const [userRoleRows] = await pool.query(`
    SELECT role, is_active, COUNT(*) AS count
    FROM users
    GROUP BY role, is_active
  `);

  for (const row of userRoleRows) {
    const count = Number(row.count) || 0;
    summary.total_users += count;
    if (row.is_active) {
      summary.active_users += count;
    }

    if (row.role === 'Citizen') summary.citizens_count += count;
    else if (row.role === 'Admin') summary.admins_count += count;
    else if (row.role === 'Moderator') summary.moderators_count += count;
    else if (row.role === 'Analyst') summary.analysts_count += count;
  }

  // 3. Category Breakdown (Joining report_categories to include zero-count categories)
  const [categoryRows] = await pool.query(`
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      COUNT(r.id) AS count
    FROM report_categories c
    LEFT JOIN reports r ON r.category_id = c.id
    WHERE c.is_active = TRUE
    GROUP BY c.id, c.name
    ORDER BY count DESC, c.name ASC
  `);

  const reports_by_category = categoryRows.map((row) => ({
    category_id: row.category_id,
    category_name: row.category_name,
    count: Number(row.count) || 0
  }));

  // 4. County Breakdown (Top 10 reporting counties)
  const [countyRows] = await pool.query(`
    SELECT county, COUNT(*) AS count
    FROM reports
    WHERE county IS NOT NULL AND county != ''
    GROUP BY county
    ORDER BY count DESC, county ASC
    LIMIT 10
  `);

  const reports_by_county = countyRows.map((row) => ({
    county: row.county,
    count: Number(row.count) || 0
  }));

  // 5. Reports Activity Over Time (Bounded by range parameter)
  let dateFilter = '';
  let dateFormat = '%Y-%m-%d';
  const queryParams = [];

  if (range === '7d') {
    dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    dateFormat = '%Y-%m-%d';
  } else if (range === '30d') {
    dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    dateFormat = '%Y-%m-%d';
  } else if (range === '90d') {
    dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    dateFormat = '%Y-%m-%d';
  } else if (range === 'year') {
    dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    dateFormat = '%Y-%m';
  } else {
    // 'all'
    dateFilter = '';
    dateFormat = '%Y-%m';
  }

  const [trendRows] = await pool.query(`
    SELECT
      DATE_FORMAT(created_at, '${dateFormat}') AS period,
      COUNT(*) AS count
    FROM reports
    ${dateFilter}
    GROUP BY period
    ORDER BY period ASC
  `);

  const reports_over_time = trendRows.map((row) => ({
    period: row.period,
    count: Number(row.count) || 0
  }));

  return {
    summary,
    reports_by_status,
    reports_by_category,
    reports_by_county,
    reports_over_time,
    meta: {
      range,
      calculated_at: new Date().toISOString()
    }
  };
}
