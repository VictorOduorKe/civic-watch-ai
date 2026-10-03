import crypto from 'crypto';
import { pool } from '../config/database.js';

/**
 * Retrieve paginated user listing with filters and search.
 * Strictly excludes password_hash and internal credentials.
 */
export async function getUsersList({
  page = 1,
  limit = 20,
  search = '',
  role,
  status,
  identity_status,
  county,
  is_county_liaison
}) {
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const params = [];

  if (search && search.trim() !== '') {
    whereClauses.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.county LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (role) {
    whereClauses.push('u.role = ?');
    params.push(role);
  }

  if (status) {
    whereClauses.push('u.status = ?');
    params.push(status);
  }

  if (identity_status) {
    whereClauses.push('u.identity_status = ?');
    params.push(identity_status);
  }

  if (county) {
    whereClauses.push('u.county = ?');
    params.push(county);
  }

  if (typeof is_county_liaison === 'boolean') {
    whereClauses.push('u.is_county_liaison = ?');
    params.push(is_county_liaison ? 1 : 0);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching
  const countSql = `SELECT COUNT(*) as total FROM users u ${whereSql}`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0].total;

  // Retrieve paginated records
  const querySql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.county,
      u.ward,
      u.role,
      u.is_active,
      u.status,
      u.identity_status,
      u.is_county_liaison,
      u.liaison_county,
      u.liaison_sub_county,
      u.created_at,
      u.updated_at,
      u.last_login_at
    FROM users u
    ${whereSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(querySql, [...params, limit, offset]);

  return {
    users: rows.map(formatUserSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

/**
 * Retrieve detailed user profile by ID with full lifecycle and verification audit history.
 */
export async function getUserDetailsById(id) {
  const [rows] = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.county,
      u.ward,
      u.role,
      u.is_active,
      u.status,
      u.identity_status,
      u.is_county_liaison,
      u.liaison_county,
      u.liaison_sub_county,
      u.suspension_reason,
      u.suspended_at,
      u.suspended_by,
      susp_admin.full_name as suspended_by_name,
      u.created_at,
      u.updated_at,
      u.last_login_at
    FROM users u
    LEFT JOIN users susp_admin ON u.suspended_by = susp_admin.id
    WHERE u.id = ? LIMIT 1`,
    [id]
  );

  if (rows.length === 0) return null;
  const user = formatUserSummary(rows[0]);
  user.suspensionReason = rows[0].suspension_reason;
  user.suspendedAt = rows[0].suspended_at;
  user.suspendedBy = rows[0].suspended_by;
  user.suspendedByName = rows[0].suspended_by_name;

  // Fetch lifecycle audit records for this user
  const [historyRows] = await pool.query(
    `SELECT
      a.id,
      a.action,
      a.actor_id,
      actor.full_name as actor_name,
      actor.role as actor_role,
      a.previous_state,
      a.new_state,
      a.reason,
      a.created_at
    FROM user_management_audits a
    LEFT JOIN users actor ON a.actor_id = actor.id
    WHERE a.target_user_id = ?
    ORDER BY a.created_at DESC`,
    [id]
  );

  // Fetch identity verification history
  const [idHistory] = await pool.query(
    `SELECT
      ivr.id,
      ivr.status,
      ivr.verified_by,
      v.full_name as verified_by_name,
      ivr.verified_at,
      ivr.reason,
      ivr.id_document_type,
      ivr.id_document_ref,
      ivr.created_at
    FROM identity_verification_records ivr
    LEFT JOIN users v ON ivr.verified_by = v.id
    WHERE ivr.user_id = ?
    ORDER BY ivr.created_at DESC`,
    [id]
  );

  user.auditHistory = historyRows.map((h) => ({
    id: h.id,
    action: h.action,
    actorId: h.actor_id,
    actorName: h.actor_name,
    actorRole: h.actor_role,
    previousState: parseJson(h.previous_state),
    newState: parseJson(h.new_state),
    reason: h.reason,
    createdAt: h.created_at
  }));

  user.identityHistory = idHistory.map((i) => ({
    id: i.id,
    status: i.status,
    verifiedBy: i.verified_by,
    verifiedByName: i.verified_by_name,
    verifiedAt: i.verified_at,
    reason: i.reason,
    idDocumentType: i.id_document_type,
    idDocumentRef: i.id_document_ref,
    createdAt: i.created_at
  }));

  return user;
}

/**
 * Update user role with Last-Admin protection and self-promotion safeguards.
 */
export async function updateUserRole({ userId, newRole, actorId, reason }) {
  const [targetRows] = await pool.query('SELECT id, role, is_active, status FROM users WHERE id = ?', [userId]);
  if (targetRows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const target = targetRows[0];
  const oldRole = target.role;

  if (oldRole === newRole) {
    return { unchanged: true, role: oldRole };
  }

  // Last-Admin Protection: If demoting an Admin, verify there is at least one OTHER active admin
  if (oldRole === 'Admin' && newRole !== 'Admin') {
    const [adminCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'Admin' AND is_active = 1 AND id != ?",
      [userId]
    );
    if (adminCount[0].count === 0) {
      const err = new Error('Cannot demote the last active administrator. At least one active administrator is required.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Self-promotion block: Actor cannot promote themselves to Admin
  if (actorId === userId && newRole === 'Admin' && oldRole !== 'Admin') {
    const err = new Error('Self-promotion to Administrator is prohibited. Another administrator must approve this role change.');
    err.statusCode = 403;
    throw err;
  }

  // Apply role change
  await pool.query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [newRole, userId]);

  // Insert audit record
  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, previous_state, new_state, reason
    ) VALUES (?, ?, 'USER_ROLE_CHANGED', ?, ?, ?)`,
    [
      actorId,
      userId,
      JSON.stringify({ role: oldRole }),
      JSON.stringify({ role: newRole }),
      reason
    ]
  );

  return {
    userId,
    previousRole: oldRole,
    newRole,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Suspend user account with Last-Admin protection and mandatory justification reason.
 */
export async function suspendUser({ userId, actorId, reason }) {
  const [targetRows] = await pool.query('SELECT id, role, is_active, status FROM users WHERE id = ?', [userId]);
  if (targetRows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const target = targetRows[0];

  // Last-Admin Protection: Cannot suspend the last active administrator
  if (target.role === 'Admin') {
    const [adminCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'Admin' AND is_active = 1 AND id != ?",
      [userId]
    );
    if (adminCount[0].count === 0) {
      const err = new Error('Cannot suspend the last active administrator. The platform requires at least one active administrator.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Update status and deactivate immediately
  await pool.query(
    `UPDATE users SET
      status = 'SUSPENDED',
      is_active = 0,
      suspension_reason = ?,
      suspended_at = NOW(),
      suspended_by = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [reason, actorId, userId]
  );

  // Insert audit record
  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, previous_state, new_state, reason
    ) VALUES (?, ?, 'USER_SUSPENDED', ?, ?, ?)`,
    [
      actorId,
      userId,
      JSON.stringify({ status: target.status, isActive: Boolean(target.is_active) }),
      JSON.stringify({ status: 'SUSPENDED', isActive: false }),
      reason
    ]
  );

  return {
    userId,
    status: 'SUSPENDED',
    isActive: false,
    reason,
    suspendedAt: new Date().toISOString()
  };
}

/**
 * Reactivate a suspended user account, preserving suspension history.
 */
export async function reactivateUser({ userId, actorId, reason = 'Administrative account reactivation' }) {
  const [targetRows] = await pool.query('SELECT id, status, is_active, suspension_reason FROM users WHERE id = ?', [userId]);
  if (targetRows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const target = targetRows[0];

  await pool.query(
    `UPDATE users SET
      status = 'ACTIVE',
      is_active = 1,
      suspension_reason = NULL,
      suspended_at = NULL,
      suspended_by = NULL,
      updated_at = NOW()
     WHERE id = ?`,
    [userId]
  );

  // Insert audit record
  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, previous_state, new_state, reason
    ) VALUES (?, ?, 'USER_REACTIVATED', ?, ?, ?)`,
    [
      actorId,
      userId,
      JSON.stringify({ status: target.status, isActive: Boolean(target.is_active), priorReason: target.suspension_reason }),
      JSON.stringify({ status: 'ACTIVE', isActive: true }),
      reason
    ]
  );

  return {
    userId,
    status: 'ACTIVE',
    isActive: true,
    reactivatedAt: new Date().toISOString()
  };
}

/**
 * Provision or update county liaison assignment with geographic scope.
 */
export async function provisionCountyLiaison({
  userId,
  actorId,
  isCountyLiaison = true,
  liaisonCounty,
  liaisonSubCounty = null,
  reason = 'County liaison provisioning'
}) {
  const [targetRows] = await pool.query('SELECT id, is_county_liaison, liaison_county, liaison_sub_county FROM users WHERE id = ?', [userId]);
  if (targetRows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const target = targetRows[0];
  const prevState = {
    isCountyLiaison: Boolean(target.is_county_liaison),
    liaisonCounty: target.liaison_county,
    liaisonSubCounty: target.liaison_sub_county
  };

  const newState = {
    isCountyLiaison: Boolean(isCountyLiaison),
    liaisonCounty: isCountyLiaison ? liaisonCounty : null,
    liaisonSubCounty: isCountyLiaison ? liaisonSubCounty : null
  };

  await pool.query(
    `UPDATE users SET
      is_county_liaison = ?,
      liaison_county = ?,
      liaison_sub_county = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [newState.isCountyLiaison ? 1 : 0, newState.liaisonCounty, newState.liaisonSubCounty, userId]
  );

  const action = isCountyLiaison ? 'COUNTY_LIAISON_CREATED' : 'COUNTY_ASSIGNMENT_CHANGED';

  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, previous_state, new_state, reason
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [actorId, userId, action, JSON.stringify(prevState), JSON.stringify(newState), reason]
  );

  return {
    userId,
    ...newState,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update identity verification status and append verification record.
 */
export async function updateIdentityVerification({
  userId,
  actorId,
  status,
  reason = null,
  idDocumentType = null,
  idDocumentRef = null
}) {
  const [targetRows] = await pool.query('SELECT id, identity_status FROM users WHERE id = ?', [userId]);
  if (targetRows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const target = targetRows[0];
  const oldStatus = target.identity_status;

  await pool.query('UPDATE users SET identity_status = ?, updated_at = NOW() WHERE id = ?', [status, userId]);

  // Insert into identity_verification_records
  await pool.query(
    `INSERT INTO identity_verification_records (
      user_id, status, verified_by, verified_at, reason, id_document_type, id_document_ref
    ) VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
    [userId, status, actorId, reason, idDocumentType, idDocumentRef]
  );

  const action = status === 'VERIFIED' ? 'IDENTITY_VERIFIED' : status === 'REJECTED' ? 'IDENTITY_REJECTED' : 'USER_PROFILE_UPDATED';

  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, previous_state, new_state, reason
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      actorId,
      userId,
      action,
      JSON.stringify({ identityStatus: oldStatus }),
      JSON.stringify({ identityStatus: status, idDocumentType }),
      reason
    ]
  );

  return {
    userId,
    previousStatus: oldStatus,
    newStatus: status,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Create a staff invitation with secure random token and expiration.
 */
export async function createStaffInvitation({
  email,
  fullName,
  role,
  isCountyLiaison = false,
  liaisonCounty = null,
  actorId
}) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists with this email
  const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existingUser.length > 0) {
    const err = new Error('A registered user account already exists with this email address.');
    err.statusCode = 409;
    throw err;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [res] = await pool.query(
    `INSERT INTO staff_invitations (
      email, full_name, role, is_county_liaison, liaison_county, invitation_token, status, expires_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
    [normalizedEmail, fullName.trim(), role, isCountyLiaison ? 1 : 0, liaisonCounty, token, expiresAt, actorId]
  );

  await pool.query(
    `INSERT INTO user_management_audits (
      actor_id, target_user_id, action, new_state, reason, metadata
    ) VALUES (?, ?, 'STAFF_INVITED', ?, ?, ?)`,
    [
      actorId,
      actorId, // target is self / invitation
      JSON.stringify({ email: normalizedEmail, fullName: fullName.trim(), role, isCountyLiaison, liaisonCounty }),
      `Staff invitation sent for ${role} role`,
      JSON.stringify({ invitationId: res.insertId, email: normalizedEmail })
    ]
  );

  return {
    invitationId: res.insertId,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role,
    isCountyLiaison,
    liaisonCounty,
    invitationToken: token,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Retrieve administrative audit logs with pagination and filters.
 */
export async function getUserManagementAudits({ page = 1, limit = 20, targetUserId, action }) {
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const params = [];

  if (targetUserId) {
    whereClauses.push('a.target_user_id = ?');
    params.push(targetUserId);
  }

  if (action) {
    whereClauses.push('a.action = ?');
    params.push(action);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM user_management_audits a ${whereSql}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT
      a.id,
      a.action,
      a.actor_id,
      actor.full_name as actor_name,
      actor.email as actor_email,
      actor.role as actor_role,
      a.target_user_id,
      target.full_name as target_user_name,
      target.email as target_user_email,
      target.role as target_user_role,
      a.previous_state,
      a.new_state,
      a.reason,
      a.created_at
    FROM user_management_audits a
    LEFT JOIN users actor ON a.actor_id = actor.id
    LEFT JOIN users target ON a.target_user_id = target.id
    ${whereSql}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    audits: rows.map((r) => ({
      id: r.id,
      action: r.action,
      actor: {
        id: r.actor_id,
        name: r.actor_name,
        email: r.actor_email,
        role: r.actor_role
      },
      target: {
        id: r.target_user_id,
        name: r.target_user_name,
        email: r.target_user_email,
        role: r.target_user_role
      },
      previousState: parseJson(r.previous_state),
      newState: parseJson(r.new_state),
      reason: r.reason,
      createdAt: r.created_at
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

/**
 * Get aggregate metric statistics for user management dashboard.
 */
export async function getUserStats() {
  const [totalRows] = await pool.query('SELECT COUNT(*) as count FROM users');
  const [activeRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE status = 'ACTIVE'");
  const [suspendedRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE status = 'SUSPENDED'");
  const [pendingVerifRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE identity_status = 'PENDING'");
  const [verifiedIdRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE identity_status = 'VERIFIED'");
  const [liaisonRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_county_liaison = 1');

  const [roleRows] = await pool.query(`
    SELECT role, COUNT(*) as count
    FROM users
    GROUP BY role
  `);

  const roles = { Citizen: 0, Moderator: 0, Analyst: 0, Admin: 0 };
  roleRows.forEach((r) => {
    roles[r.role] = r.count;
  });

  return {
    totalUsers: totalRows[0].count,
    activeUsers: activeRows[0].count,
    suspendedUsers: suspendedRows[0].count,
    pendingVerification: pendingVerifRows[0].count,
    verifiedIdentities: verifiedIdRows[0].count,
    countyLiaisons: liaisonRows[0].count,
    roles
  };
}

// Helpers
function formatUserSummary(u) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    county: u.county,
    ward: u.ward,
    role: u.role,
    isActive: Boolean(u.is_active),
    status: u.status,
    identityStatus: u.identity_status,
    isCountyLiaison: Boolean(u.is_county_liaison),
    liaisonCounty: u.liaison_county,
    liaisonSubCounty: u.liaison_sub_county,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    lastLoginAt: u.last_login_at
  };
}

function parseJson(str) {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
