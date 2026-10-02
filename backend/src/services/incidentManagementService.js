import { pool } from '../config/database.js';
import {
  createStatusChangedNotification,
  createReportUpdatedNotification,
  createReportAssignedNotification
} from './notificationService.js';

export const ALLOWED_STATUS_TRANSITIONS = {
  'Submitted': ['Under Review', 'Rejected', 'Dismissed'],
  'Under Review': ['Verified', 'Assigned', 'In Progress', 'Rejected', 'Dismissed', 'Submitted'],
  'Verified': ['Assigned', 'In Progress', 'Under Review', 'Rejected', 'Dismissed'],
  'Assigned': ['In Progress', 'Under Review', 'Verified', 'Rejected', 'Dismissed'],
  'In Progress': ['Resolved', 'Under Review', 'Assigned', 'Rejected', 'Dismissed'],
  'Resolved': ['Closed', 'In Progress', 'Under Review'],
  'Closed': ['Under Review', 'In Progress'], // Reopen with explicit flag
  'Rejected': ['Under Review', 'Submitted'],
  'Dismissed': ['Under Review', 'Submitted']
};

/**
 * Retrieve paginated, filtered, and searched incidents for administrative oversight.
 */
export async function getAdminIncidents({
  page = 1,
  limit = 20,
  status,
  category_id,
  county,
  search,
  assigned = 'all',
  date_from,
  date_to,
  sort = 'updated_at',
  order = 'DESC'
}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (safePage - 1) * safeLimit;

  const validSortCols = {
    updated_at: 'r.updated_at',
    created_at: 'r.created_at',
    incident_date: 'r.incident_date',
    status: 'r.status',
    title: 'r.title'
  };
  const sortCol = validSortCols[sort] || 'r.updated_at';
  const sortDir = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (category_id) {
    conditions.push('r.category_id = ?');
    params.push(category_id);
  }

  if (county) {
    conditions.push('r.county = ?');
    params.push(county);
  }

  if (search) {
    conditions.push('(r.report_reference LIKE ? OR r.title LIKE ? OR r.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (date_from) {
    conditions.push('DATE(r.created_at) >= ?');
    params.push(date_from);
  }

  if (date_to) {
    conditions.push('DATE(r.created_at) <= ?');
    params.push(date_to);
  }

  if (assigned === 'assigned') {
    conditions.push('ra.id IS NOT NULL');
  } else if (assigned === 'unassigned') {
    conditions.push('ra.id IS NULL');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Get total matching count
  const countSql = `
    SELECT COUNT(DISTINCT r.id) AS total
    FROM reports r
    JOIN report_categories c ON r.category_id = c.id
    LEFT JOIN report_assignments ra ON ra.report_id = r.id AND ra.unassigned_at IS NULL
    ${whereClause}
  `;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0]?.total || 0;
  const totalPages = Math.ceil(total / safeLimit) || 1;

  // 2. Fetch incidents page
  const listSql = `
    SELECT
      r.id,
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
      ra.id AS active_assignment_id,
      ra.assigned_at,
      u_assigned.id AS assigned_user_id,
      u_assigned.full_name AS assigned_user_name,
      u_assigned.role AS assigned_user_role,
      (SELECT COUNT(*) FROM report_attachments a WHERE a.report_id = r.id) AS attachment_count
    FROM reports r
    JOIN report_categories c ON r.category_id = c.id
    LEFT JOIN report_assignments ra ON ra.report_id = r.id AND ra.unassigned_at IS NULL
    LEFT JOIN users u_assigned ON ra.assigned_to_user_id = u_assigned.id
    ${whereClause}
    ORDER BY ${sortCol} ${sortDir}, r.id ${sortDir}
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, safeLimit, offset];
  const [rows] = await pool.query(listSql, queryParams);

  const incidents = rows.map((row) => ({
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
    updated_at: row.updated_at,
    assigned_to: row.active_assignment_id
      ? {
          id: row.assigned_user_id,
          name: row.assigned_user_name,
          role: row.assigned_user_role
        }
      : null
  }));

  return {
    incidents,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages
    }
  };
}

/**
 * Retrieve list of active staff members eligible for incident assignment.
 */
export async function getEligibleAssignees() {
  const [users] = await pool.query(
    `SELECT id, full_name, email, role, county
     FROM users
     WHERE role IN ('Admin', 'Moderator', 'Analyst') AND is_active = TRUE
     ORDER BY full_name ASC`
  );
  return users.map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: u.role,
    county: u.county
  }));
}

/**
 * Retrieve full administrative incident details.
 * Implements privacy boundaries: hides citizen personal details if is_anonymous = true.
 */
export async function getAdminIncidentDetail(reference) {
  // 1. Fetch report with category and submitter info
  const [reports] = await pool.query(
    `SELECT
      r.id,
      r.report_reference AS reference,
      r.user_id,
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
      c.description AS category_description,
      u.full_name AS submitter_name,
      u.email AS submitter_email,
      u.phone AS submitter_phone
    FROM reports r
    JOIN report_categories c ON r.category_id = c.id
    JOIN users u ON r.user_id = u.id
    WHERE r.report_reference = ?`,
    [reference]
  );

  if (reports.length === 0) {
    return null;
  }

  const row = reports[0];
  const reportId = row.id;

  // 2. Fetch attachments
  const [attachments] = await pool.query(
    `SELECT id, original_name, mime_type, size_bytes, created_at
     FROM report_attachments
     WHERE report_id = ?
     ORDER BY id ASC`,
    [reportId]
  );

  // 3. Fetch active assignment
  const [activeAssignments] = await pool.query(
    `SELECT
      ra.id,
      ra.assignment_note,
      ra.assigned_at,
      u_to.id AS assigned_to_id,
      u_to.full_name AS assigned_to_name,
      u_to.role AS assigned_to_role,
      u_by.id AS assigned_by_id,
      u_by.full_name AS assigned_by_name,
      u_by.role AS assigned_by_role
    FROM report_assignments ra
    JOIN users u_to ON ra.assigned_to_user_id = u_to.id
    JOIN users u_by ON ra.assigned_by_user_id = u_by.id
    WHERE ra.report_id = ? AND ra.unassigned_at IS NULL
    ORDER BY ra.assigned_at DESC, ra.id DESC
    LIMIT 1`,
    [reportId]
  );

  const activeAssignment = activeAssignments.length > 0 ? {
    id: activeAssignments[0].id,
    assignment_note: activeAssignments[0].assignment_note,
    assigned_at: activeAssignments[0].assigned_at,
    assigned_to: {
      id: activeAssignments[0].assigned_to_id,
      name: activeAssignments[0].assigned_to_name,
      role: activeAssignments[0].assigned_to_role
    },
    assigned_by: {
      id: activeAssignments[0].assigned_by_id,
      name: activeAssignments[0].assigned_by_name,
      role: activeAssignments[0].assigned_by_role
    }
  } : null;

  // 4. Fetch assignment history
  const [assignmentHistoryRows] = await pool.query(
    `SELECT
      ra.id,
      ra.assignment_note,
      ra.assigned_at,
      ra.unassigned_at,
      u_to.id AS assigned_to_id,
      u_to.full_name AS assigned_to_name,
      u_to.role AS assigned_to_role,
      u_by.id AS assigned_by_id,
      u_by.full_name AS assigned_by_name,
      u_by.role AS assigned_by_role
    FROM report_assignments ra
    JOIN users u_to ON ra.assigned_to_user_id = u_to.id
    JOIN users u_by ON ra.assigned_by_user_id = u_by.id
    WHERE ra.report_id = ?
    ORDER BY ra.assigned_at DESC, ra.id DESC`,
    [reportId]
  );

  const assignment_history = assignmentHistoryRows.map((r) => ({
    id: r.id,
    assignment_note: r.assignment_note,
    assigned_at: r.assigned_at,
    unassigned_at: r.unassigned_at,
    assigned_to: {
      id: r.assigned_to_id,
      name: r.assigned_to_name,
      role: r.assigned_to_role
    },
    assigned_by: {
      id: r.assigned_by_id,
      name: r.assigned_by_name,
      role: r.assigned_by_role
    }
  }));

  // 5. Fetch full status history
  const [statusHistoryRows] = await pool.query(
    `SELECT
      rsh.id,
      rsh.status,
      rsh.note,
      rsh.visible_to_citizen,
      rsh.created_at,
      u.id AS changed_by_id,
      u.full_name AS changed_by_name,
      u.role AS changed_by_role
    FROM report_status_history rsh
    LEFT JOIN users u ON rsh.changed_by_user_id = u.id
    WHERE rsh.report_id = ?
    ORDER BY rsh.created_at DESC, rsh.id DESC`,
    [reportId]
  );

  const status_history = statusHistoryRows.map((r) => ({
    id: r.id,
    status: r.status,
    note: r.note,
    visible_to_citizen: Boolean(r.visible_to_citizen),
    created_at: r.created_at,
    changed_by: r.changed_by_id
      ? {
          id: r.changed_by_id,
          name: r.changed_by_name,
          role: r.changed_by_role
        }
      : null
  }));

  // 6. Fetch internal notes (admin only)
  const [internalNoteRows] = await pool.query(
    `SELECT
      rin.id,
      rin.note,
      rin.created_at,
      rin.updated_at,
      u.id AS author_id,
      u.full_name AS author_name,
      u.role AS author_role
    FROM report_internal_notes rin
    JOIN users u ON rin.author_user_id = u.id
    WHERE rin.report_id = ?
    ORDER BY rin.created_at DESC, rin.id DESC`,
    [reportId]
  );

  const internal_notes = internalNoteRows.map((r) => ({
    id: r.id,
    note: r.note,
    created_at: r.created_at,
    updated_at: r.updated_at,
    author: {
      id: r.author_id,
      name: r.author_name,
      role: r.author_role
    }
  }));

  // 7. Fetch published citizen updates
  const [updateRows] = await pool.query(
    `SELECT
      ru.id,
      ru.message,
      ru.created_at,
      ru.updated_at,
      u.id AS author_id,
      u.full_name AS author_name,
      u.role AS author_role
    FROM report_updates ru
    JOIN users u ON ru.author_user_id = u.id
    WHERE ru.report_id = ?
    ORDER BY ru.created_at DESC, ru.id DESC`,
    [reportId]
  );

  const citizen_updates = updateRows.map((r) => ({
    id: r.id,
    message: r.message,
    created_at: r.created_at,
    updated_at: r.updated_at,
    author: {
      id: r.author_id,
      name: r.author_name,
      role: r.author_role
    }
  }));

  // 8. Fetch referrals
  const [referralRows] = await pool.query(
    `SELECT
      rr.id,
      rr.referral_type,
      rr.organization_name,
      rr.reason,
      rr.status,
      rr.created_at,
      rr.updated_at,
      u.id AS referred_by_id,
      u.full_name AS referred_by_name,
      u.role AS referred_by_role
    FROM report_referrals rr
    JOIN users u ON rr.referred_by_user_id = u.id
    WHERE rr.report_id = ?
    ORDER BY rr.created_at DESC, rr.id DESC`,
    [reportId]
  );

  const referrals = referralRows.map((r) => ({
    id: r.id,
    referral_type: r.referral_type,
    organization_name: r.organization_name,
    reason: r.reason,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    referred_by: {
      id: r.referred_by_id,
      name: r.referred_by_name,
      role: r.referred_by_role
    }
  }));

  // Privacy boundary enforcement: Anonymous reports never expose citizen identity
  const isAnonymous = Boolean(row.is_anonymous);
  const submitter = isAnonymous
    ? {
        is_anonymous: true,
        display_label: 'Submitted anonymously'
      }
    : {
        is_anonymous: false,
        name: row.submitter_name,
        email: row.submitter_email,
        phone: row.submitter_phone
      };

  return {
    reference: row.reference,
    title: row.title,
    description: row.description,
    category: {
      id: row.category_id,
      name: row.category_name,
      description: row.category_description
    },
    county: row.county,
    sub_county: row.sub_county,
    ward: row.ward,
    location_text: row.location_text,
    latitude: row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== null ? Number(row.longitude) : null,
    incident_date: row.incident_date,
    incident_time: row.incident_time,
    is_anonymous: isAnonymous,
    preferred_contact: row.preferred_contact,
    status: row.status,
    submitter,
    created_at: row.created_at,
    updated_at: row.updated_at,
    attachments,
    active_assignment: activeAssignment,
    assignment_history,
    status_history,
    internal_notes,
    citizen_updates,
    referrals
  };
}

/**
 * Execute a transaction-safe report status change.
 * Validates transition rules, checks closed status boundaries, and logs status history.
 */
export async function changeIncidentStatus({
  reference,
  status: newStatus,
  note = '',
  reopen = false,
  visible_to_citizen = true,
  publish_citizen_update = false,
  citizen_message = '',
  user
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch current status with lock and reporter user_id
    const [reports] = await connection.query(
      'SELECT id, status, report_reference, user_id FROM reports WHERE report_reference = ? FOR UPDATE',
      [reference]
    );

    if (reports.length === 0) {
      await connection.rollback();
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }

    const report = reports[0];
    const reportId = report.id;
    const currentStatus = report.status;

    // If identical status requested, return without changing
    if (currentStatus === newStatus) {
      await connection.rollback();
      return {
        success: true,
        reference,
        status: currentStatus,
        message: 'Report is already in this status'
      };
    }

    // 2. Closed reports safeguard
    if (currentStatus === 'Closed' && !reopen) {
      await connection.rollback();
      const err = new Error('Report is closed and finalized. Reopening requires explicit confirmation.');
      err.status = 409;
      throw err;
    }

    // 3. Status transition validity check
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      await connection.rollback();
      const err = new Error(`Invalid status transition from "${currentStatus}" to "${newStatus}".`);
      err.status = 422;
      throw err;
    }

    // 4. Update reports table
    await connection.query(
      'UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, reportId]
    );

    // 5. Insert report_status_history
    const historyNote = note ? note.trim() : `Status changed to ${newStatus}.`;
    const isVisibleToCitizen = visible_to_citizen !== false;
    const [historyResult] = await connection.query(
      `INSERT INTO report_status_history (report_id, status, note, changed_by_user_id, visible_to_citizen)
       VALUES (?, ?, ?, ?, ?)`,
      [reportId, newStatus, historyNote, user.id, isVisibleToCitizen]
    );

    // 6. Optionally publish citizen update if requested
    let updateResult = null;
    if (publish_citizen_update && citizen_message && citizen_message.trim()) {
      [updateResult] = await connection.query(
        `INSERT INTO report_updates (report_id, author_user_id, message)
         VALUES (?, ?, ?)`,
        [reportId, user.id, citizen_message.trim()]
      );
    }

    await connection.commit();

    // Milestone 8: Trigger citizen notification if status is citizen-visible
    if (isVisibleToCitizen && report.user_id) {
      await createStatusChangedNotification({
        recipientUserId: report.user_id,
        reportId,
        reportReference: reference,
        newStatus,
        historyId: historyResult?.insertId
      });
    }

    // Milestone 8: If companion citizen update was published, notify citizen
    if (publish_citizen_update && updateResult?.insertId && report.user_id) {
      await createReportUpdatedNotification({
        recipientUserId: report.user_id,
        reportId,
        reportReference: reference,
        updateId: updateResult.insertId
      });
    }

    return {
      success: true,
      reference,
      previousStatus: currentStatus,
      status: newStatus,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Assign or reassign an incident report.
 * Preserves historical assignments by setting unassigned_at on previously active records.
 */
export async function assignIncident({
  reference,
  assigned_to_user_id,
  assignment_note = '',
  update_status_to_assigned = true,
  user
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch report
    const [reports] = await connection.query(
      'SELECT id, status, report_reference FROM reports WHERE report_reference = ? FOR UPDATE',
      [reference]
    );

    if (reports.length === 0) {
      await connection.rollback();
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }

    const report = reports[0];
    const reportId = report.id;

    // 2. Validate target user
    const [targetUsers] = await connection.query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = ?',
      [assigned_to_user_id]
    );

    if (targetUsers.length === 0 || !targetUsers[0].is_active) {
      await connection.rollback();
      const err = new Error('Target assignee does not exist or is inactive.');
      err.status = 422;
      throw err;
    }

    const targetUser = targetUsers[0];
    if (targetUser.role === 'Citizen') {
      await connection.rollback();
      const err = new Error('Citizens cannot be assigned to manage incidents.');
      err.status = 422;
      throw err;
    }

    // 3. Mark previous active assignment as unassigned
    await connection.query(
      `UPDATE report_assignments
       SET unassigned_at = CURRENT_TIMESTAMP
       WHERE report_id = ? AND unassigned_at IS NULL`,
      [reportId]
    );

    // 4. Create new assignment record
    const noteText = assignment_note ? assignment_note.trim() : null;
    await connection.query(
      `INSERT INTO report_assignments (report_id, assigned_to_user_id, assigned_by_user_id, assignment_note, assigned_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [reportId, targetUser.id, user.id, noteText]
    );

    // 5. Update status to 'Assigned' if requested and report is in early stage
    let statusChanged = false;
    if (update_status_to_assigned && ['Submitted', 'Under Review', 'Verified'].includes(report.status)) {
      await connection.query(
        'UPDATE reports SET status = "Assigned", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [reportId]
      );
      await connection.query(
        `INSERT INTO report_status_history (report_id, status, note, changed_by_user_id, visible_to_citizen)
         VALUES (?, 'Assigned', ?, ?, TRUE)`,
        [reportId, `Assigned to ${targetUser.full_name} (${targetUser.role}).`, user.id]
      );
      statusChanged = true;
    }

    await connection.commit();

    // Milestone 8: Trigger in-app notification for assigned staff member
    await createReportAssignedNotification({
      assignedToUserId: targetUser.id,
      reportId,
      reportReference: reference
    });

    return {
      success: true,
      reference,
      assigned_to: {
        id: targetUser.id,
        name: targetUser.full_name,
        role: targetUser.role
      },
      status: statusChanged ? 'Assigned' : report.status,
      assigned_at: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Remove active assignment without deleting historical records.
 */
export async function unassignIncident({ reference, reason = '', user }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [reports] = await connection.query(
      'SELECT id, status FROM reports WHERE report_reference = ? FOR UPDATE',
      [reference]
    );

    if (reports.length === 0) {
      await connection.rollback();
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }

    const reportId = reports[0].id;

    // Check if there is an active assignment
    const [active] = await connection.query(
      `SELECT ra.id, u.full_name
       FROM report_assignments ra
       JOIN users u ON ra.assigned_to_user_id = u.id
       WHERE ra.report_id = ? AND ra.unassigned_at IS NULL`,
      [reportId]
    );

    if (active.length === 0) {
      await connection.rollback();
      const err = new Error('Incident is not currently assigned.');
      err.status = 409;
      throw err;
    }

    const prevAssigneeName = active[0].full_name;

    await connection.query(
      `UPDATE report_assignments
       SET unassigned_at = CURRENT_TIMESTAMP
       WHERE report_id = ? AND unassigned_at IS NULL`,
      [reportId]
    );

    // Add internal note about unassignment
    const noteText = reason ? reason.trim() : `Unassigned from ${prevAssigneeName}.`;
    await connection.query(
      `INSERT INTO report_internal_notes (report_id, author_user_id, note)
       VALUES (?, ?, ?)`,
      [reportId, user.id, `Incident unassigned. Reason: ${noteText}`]
    );

    await connection.commit();

    return {
      success: true,
      reference,
      unassigned_at: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Add an internal note (admin-only, never returned to citizen).
 */
export async function addInternalNote({ reference, note, user }) {
  const [reports] = await pool.query(
    'SELECT id FROM reports WHERE report_reference = ?',
    [reference]
  );

  if (reports.length === 0) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  const reportId = reports[0].id;

  const [result] = await pool.query(
    `INSERT INTO report_internal_notes (report_id, author_user_id, note)
     VALUES (?, ?, ?)`,
    [reportId, user.id, note.trim()]
  );

  return {
    id: result.insertId,
    note: note.trim(),
    created_at: new Date().toISOString(),
    author: {
      id: user.id,
      name: user.full_name,
      role: user.role
    }
  };
}

/**
 * Add a citizen-visible update message.
 */
export async function addCitizenUpdate({ reference, message, user }) {
  const [reports] = await pool.query(
    'SELECT id, user_id, report_reference FROM reports WHERE report_reference = ?',
    [reference]
  );

  if (reports.length === 0) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  const reportId = reports[0].id;
  const citizenUserId = reports[0].user_id;

  const [result] = await pool.query(
    `INSERT INTO report_updates (report_id, author_user_id, message)
     VALUES (?, ?, ?)`,
    [reportId, user.id, message.trim()]
  );

  // Milestone 8: Trigger in-app notification for the citizen reporter
  if (citizenUserId) {
    await createReportUpdatedNotification({
      recipientUserId: citizenUserId,
      reportId,
      reportReference: reference,
      updateId: result.insertId
    });
  }

  return {
    id: result.insertId,
    message: message.trim(),
    created_at: new Date().toISOString(),
    author: {
      id: user.id,
      name: user.full_name,
      role: user.role
    }
  };
}

/**
 * Create a referral for an incident report.
 */
export async function createReferral({
  reference,
  referral_type,
  organization_name,
  reason,
  user
}) {
  const [reports] = await pool.query(
    'SELECT id FROM reports WHERE report_reference = ?',
    [reference]
  );

  if (reports.length === 0) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  const reportId = reports[0].id;

  const [result] = await pool.query(
    `INSERT INTO report_referrals (report_id, referral_type, organization_name, reason, status, referred_by_user_id)
     VALUES (?, ?, ?, ?, 'Pending', ?)`,
    [reportId, referral_type.trim(), organization_name.trim(), reason.trim(), user.id]
  );

  return {
    id: result.insertId,
    referral_type: referral_type.trim(),
    organization_name: organization_name.trim(),
    reason: reason.trim(),
    status: 'Pending',
    created_at: new Date().toISOString(),
    referred_by: {
      id: user.id,
      name: user.full_name,
      role: user.role
    }
  };
}

/**
 * Update the status of an existing referral.
 */
export async function updateReferralStatus({ reference, referralId, status, user }) {
  const [referrals] = await pool.query(
    `SELECT rr.id, rr.report_id
     FROM report_referrals rr
     JOIN reports r ON rr.report_id = r.id
     WHERE r.report_reference = ? AND rr.id = ?`,
    [reference, referralId]
  );

  if (referrals.length === 0) {
    const err = new Error('Referral not found for this incident');
    err.status = 404;
    throw err;
  }

  await pool.query(
    'UPDATE report_referrals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, referralId]
  );

  return {
    id: referralId,
    status,
    updated_at: new Date().toISOString()
  };
}

/**
 * Retrieve attachment file metadata for an administrative user.
 */
export async function getAttachmentForAdmin({ reference, attachmentId }) {
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
    WHERE r.report_reference = ? AND a.id = ?`,
    [reference, attachmentId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}
