import { pool } from '../config/database.js';

/**
 * M14 — Verification & Trust Layer: Database Model
 */

/**
 * List Sources with pagination, filtering, and role-conscious column exposure
 */
export async function listSources({
  page = 1,
  limit = 20,
  source_type,
  status,
  is_official,
  search,
  isPublic = true
} = {}) {
  const offset = (page - 1) * limit;
  const whereClauses = ['s.is_active = TRUE'];
  const params = [];

  if (source_type) {
    whereClauses.push('s.source_type = ?');
    params.push(source_type);
  }

  if (status) {
    whereClauses.push('s.verification_status = ?');
    params.push(status);
  }

  if (is_official !== undefined) {
    whereClauses.push('s.is_official = ?');
    params.push(is_official ? 1 : 0);
  }

  if (search) {
    whereClauses.push('(s.name LIKE ? OR s.organization LIKE ? OR s.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM sources s ${whereSql}`,
    params
  );
  const total = countRows[0]?.total || 0;

  // Contact info is withheld from public queries (Section 4 & Section 25)
  const contactColumns = isPublic
    ? ''
    : ', s.contact_email, s.contact_phone';

  const [rows] = await pool.query(
    `SELECT 
       s.id,
       s.name,
       s.organization,
       s.source_type,
       s.website,
       s.description,
       s.verification_status,
       s.verified_at,
       s.verified_by,
       s.is_official,
       s.is_active,
       s.created_at,
       s.updated_at,
       u.full_name AS verifier_name,
       u.role AS verifier_role
       ${contactColumns}
     FROM sources s
     LEFT JOIN users u ON s.verified_by = u.id
     ${whereSql}
     ORDER BY s.is_official DESC, s.name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    sources: rows.map(formatSourceRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get Source By ID
 */
export async function getSourceById(id, isPublic = true) {
  const contactColumns = isPublic ? '' : ', s.contact_email, s.contact_phone';

  const [rows] = await pool.query(
    `SELECT 
       s.id,
       s.name,
       s.organization,
       s.source_type,
       s.website,
       s.description,
       s.verification_status,
       s.verified_at,
       s.verified_by,
       s.is_official,
       s.is_active,
       s.created_at,
       s.updated_at,
       u.full_name AS verifier_name,
       u.role AS verifier_role
       ${contactColumns}
     FROM sources s
     LEFT JOIN users u ON s.verified_by = u.id
     WHERE s.id = ?`,
    [id]
  );

  if (rows.length === 0) return null;
  const source = formatSourceRow(rows[0]);

  // Load attached references
  source.references = await getEntityReferences('SOURCE', id);
  return source;
}

/**
 * Create Source Record
 */
export async function createSourceRecord(data, userId) {
  const {
    name,
    organization = null,
    source_type = 'COMMUNITY',
    website = null,
    description = null,
    contact_email = null,
    contact_phone = null,
    is_official = false
  } = data;

  const [result] = await pool.query(
    `INSERT INTO sources (
       name, organization, source_type, website, description,
       contact_email, contact_phone, is_official, verification_status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNVERIFIED')`,
    [
      name,
      organization,
      source_type,
      website || null,
      description,
      contact_email || null,
      contact_phone || null,
      Boolean(is_official)
    ]
  );

  return await getSourceById(result.insertId, false);
}

/**
 * Update Source Record
 */
export async function updateSourceRecord(id, data) {
  const fields = [];
  const params = [];

  const allowed = [
    'name', 'organization', 'source_type', 'website',
    'description', 'contact_email', 'contact_phone',
    'is_official', 'is_active'
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return await getSourceById(id, false);

  params.push(id);
  await pool.query(`UPDATE sources SET ${fields.join(', ')} WHERE id = ?`, params);
  return await getSourceById(id, false);
}

/**
 * Verification Records: Append-only audit record creation
 */
export async function createVerificationAudit({
  entity_type,
  entity_id,
  action,
  previous_status,
  new_status,
  verified_by,
  reason = null,
  evidence_summary = null
}) {
  const [result] = await pool.query(
    `INSERT INTO verification_records (
       entity_type, entity_id, action, previous_status, new_status,
       verified_by, reason, evidence_summary
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entity_type,
      entity_id,
      action,
      previous_status || null,
      new_status,
      verified_by,
      reason,
      evidence_summary
    ]
  );

  return result.insertId;
}

/**
 * Create Verification Reference Record
 */
export async function createVerificationReferenceRecord({
  verification_record_id = null,
  entity_type,
  entity_id,
  title,
  reference_url,
  description = null,
  source_type = null,
  created_by
}) {
  const [result] = await pool.query(
    `INSERT INTO verification_references (
       verification_record_id, entity_type, entity_id, title,
       reference_url, description, source_type, created_by
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      verification_record_id,
      entity_type,
      entity_id,
      title,
      reference_url,
      description,
      source_type,
      created_by
    ]
  );

  return result.insertId;
}

/**
 * Get References for an entity
 */
export async function getEntityReferences(entityType, entityId) {
  const [rows] = await pool.query(
    `SELECT 
       r.id,
       r.entity_type,
       r.entity_id,
       r.title,
       r.reference_url,
       r.description,
       r.source_type,
       r.created_at,
       u.full_name AS added_by_name,
       u.role AS added_by_role
     FROM verification_references r
     LEFT JOIN users u ON r.created_by = u.id
     WHERE r.entity_type = ? AND r.entity_id = ?
     ORDER BY r.created_at ASC`,
    [entityType, entityId]
  );

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: row.title,
    referenceUrl: row.reference_url,
    description: row.description,
    sourceType: row.source_type,
    addedBy: {
      name: row.added_by_name || 'System Reviewer',
      role: row.added_by_role || 'Staff'
    },
    createdAt: row.created_at
  }));
}

/**
 * Get Append-Only Verification History for an entity
 */
export async function getEntityVerificationHistory(entityType, entityId) {
  const [rows] = await pool.query(
    `SELECT 
       v.id,
       v.entity_type,
       v.entity_id,
       v.action,
       v.previous_status,
       v.new_status,
       v.reason,
       v.evidence_summary,
       v.created_at,
       u.full_name AS verifier_name,
       u.role AS verifier_role
     FROM verification_records v
     LEFT JOIN users u ON v.verified_by = u.id
     WHERE v.entity_type = ? AND v.entity_id = ?
     ORDER BY v.created_at DESC`,
    [entityType, entityId]
  );

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    reason: row.reason,
    evidenceSummary: row.evidence_summary,
    createdAt: row.created_at,
    verifier: {
      name: row.verifier_name || 'Authorized Staff',
      role: row.verifier_role || 'Staff'
    }
  }));
}

/**
 * Get Entity Current Status & Details
 */
export async function getEntityDetails(entityType, entityId) {
  if (entityType === 'SOURCE') {
    const [rows] = await pool.query(
      `SELECT id, name AS title, verification_status, verified_by, verified_at, is_official, source_type
       FROM sources WHERE id = ?`,
      [entityId]
    );
    return rows[0] || null;
  }

  if (entityType === 'ALERT') {
    const [rows] = await pool.query(
      `SELECT a.id, a.title, a.verification_status, a.verified_by, a.verified_at, a.is_official,
              a.source_name, a.source_type, a.source_id, a.status, s.name AS linked_source_name
       FROM civic_alerts a
       LEFT JOIN sources s ON a.source_id = s.id
       WHERE a.id = ?`,
      [entityId]
    );
    return rows[0] || null;
  }

  if (entityType === 'REPORT') {
    const [rows] = await pool.query(
      `SELECT r.id, r.report_reference, r.title, r.verification_status, r.verified_by, r.verified_at,
              r.status AS case_status, r.is_anonymous, r.source_id, s.name AS linked_source_name
       FROM reports r
       LEFT JOIN sources s ON r.source_id = s.id
       WHERE r.id = ?`,
      [entityId]
    );
    return rows[0] || null;
  }

  return null;
}

/**
 * Update Entity Verification Status
 */
export async function updateEntityVerificationStatus(entityType, entityId, newStatus, verifiedBy) {
  if (entityType === 'SOURCE') {
    await pool.query(
      `UPDATE sources 
       SET verification_status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, verifiedBy, entityId]
    );
    return true;
  }

  if (entityType === 'ALERT') {
    await pool.query(
      `UPDATE civic_alerts 
       SET verification_status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, verifiedBy, entityId]
    );
    return true;
  }

  if (entityType === 'REPORT') {
    await pool.query(
      `UPDATE reports 
       SET verification_status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, verifiedBy, entityId]
    );
    return true;
  }

  return false;
}

/**
 * Get Verification Queue: items requiring review (sources, alerts, reports)
 */
export async function getVerificationQueue({
  page = 1,
  limit = 20,
  entity_type,
  status,
  search
} = {}) {
  const offset = (page - 1) * limit;

  // We query across SOURCE, ALERT, and REPORT
  const queries = [];
  const params = [];

  // 1. Sources
  if (!entity_type || entity_type === 'SOURCE') {
    let sWhere = ['s.is_active = TRUE'];
    if (status) {
      sWhere.push('s.verification_status = ?');
      params.push(status);
    } else {
      sWhere.push("s.verification_status IN ('UNVERIFIED', 'UNDER_REVIEW', 'DISPUTED')");
    }
    if (search) {
      sWhere.push('(s.name LIKE ? OR s.organization LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    queries.push(`
      SELECT 
        'SOURCE' AS entity_type,
        s.id AS entity_id,
        s.name AS title,
        s.verification_status,
        s.source_type,
        s.is_official,
        s.created_at,
        s.updated_at
      FROM sources s
      WHERE ${sWhere.join(' AND ')}
    `);
  }

  // 2. Alerts
  if (!entity_type || entity_type === 'ALERT') {
    let aWhere = ["a.status != 'ARCHIVED'"];
    if (status) {
      aWhere.push('a.verification_status = ?');
      params.push(status);
    } else {
      aWhere.push("a.verification_status IN ('PENDING', 'UNVERIFIED', 'UNDER_REVIEW', 'DISPUTED')");
    }
    if (search) {
      aWhere.push('(a.title LIKE ? OR a.summary LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    queries.push(`
      SELECT 
        'ALERT' AS entity_type,
        a.id AS entity_id,
        a.title,
        a.verification_status,
        a.source_type,
        a.is_official,
        a.created_at,
        a.updated_at
      FROM civic_alerts a
      WHERE ${aWhere.join(' AND ')}
    `);
  }

  // 3. Reports
  if (!entity_type || entity_type === 'REPORT') {
    let rWhere = ["r.status NOT IN ('Resolved', 'Dismissed')"];
    if (status) {
      rWhere.push('r.verification_status = ?');
      params.push(status);
    } else {
      rWhere.push("r.verification_status IN ('UNVERIFIED', 'UNDER_REVIEW', 'DISPUTED')");
    }
    if (search) {
      rWhere.push('(r.title LIKE ? OR r.report_reference LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    queries.push(`
      SELECT 
        'REPORT' AS entity_type,
        r.id AS entity_id,
        r.title,
        r.verification_status,
        'COMMUNITY' AS source_type,
        FALSE AS is_official,
        r.created_at,
        r.updated_at
      FROM reports r
      WHERE ${rWhere.join(' AND ')}
    `);
  }

  if (queries.length === 0) {
    return { queue: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }

  const combinedSql = queries.join(' UNION ALL ');
  const countSql = `SELECT COUNT(*) AS total FROM (${combinedSql}) AS q`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0]?.total || 0;

  const dataSql = `
    SELECT * FROM (${combinedSql}) AS q
    ORDER BY 
      CASE 
        WHEN verification_status = 'DISPUTED' THEN 1
        WHEN verification_status = 'UNDER_REVIEW' THEN 2
        WHEN verification_status = 'UNVERIFIED' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(dataSql, [...params, limit, offset]);

  return {
    queue: rows.map((r) => ({
      entityType: r.entity_type,
      entityId: r.entity_id,
      title: r.title,
      verificationStatus: r.verification_status,
      sourceType: r.source_type,
      isOfficial: Boolean(r.is_official),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get Verification Stats
 */
export async function getVerificationStats() {
  const [sourceStats] = await pool.query(`
    SELECT verification_status, COUNT(*) AS count
    FROM sources
    WHERE is_active = TRUE
    GROUP BY verification_status
  `);

  const [alertStats] = await pool.query(`
    SELECT verification_status, COUNT(*) AS count
    FROM civic_alerts
    WHERE status != 'ARCHIVED'
    GROUP BY verification_status
  `);

  const [reportStats] = await pool.query(`
    SELECT verification_status, COUNT(*) AS count
    FROM reports
    GROUP BY verification_status
  `);

  const aggregate = {
    UNVERIFIED: 0,
    UNDER_REVIEW: 0,
    VERIFIED: 0,
    DISPUTED: 0,
    CORRECTED: 0,
    WITHDRAWN: 0
  };

  const tally = (rows) => {
    for (const r of rows) {
      const st = r.verification_status === 'PENDING' ? 'UNDER_REVIEW' : r.verification_status;
      if (aggregate[st] !== undefined) aggregate[st] += r.count;
    }
  };

  tally(sourceStats);
  tally(alertStats);
  tally(reportStats);

  return {
    counts: aggregate,
    totalTracked: Object.values(aggregate).reduce((a, b) => a + b, 0),
    breakdown: {
      sources: sourceStats,
      alerts: alertStats,
      reports: reportStats
    }
  };
}

function formatSourceRow(row) {
  return {
    id: row.id,
    name: row.name,
    organization: row.organization,
    sourceType: row.source_type,
    website: row.website,
    description: row.description,
    verificationStatus: row.verification_status,
    verifiedAt: row.verified_at,
    verifiedBy: row.verified_by,
    isOfficial: Boolean(row.is_official),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    verifier: row.verified_by
      ? { name: row.verifier_name || 'Authorized Staff', role: row.verifier_role || 'Staff' }
      : null,
    contactEmail: row.contact_email !== undefined ? row.contact_email : undefined,
    contactPhone: row.contact_phone !== undefined ? row.contact_phone : undefined
  };
}
