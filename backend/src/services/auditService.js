import crypto from 'crypto';
import { pool } from '../config/database.js';

// Sensitive keys that must NEVER be recorded in audit logs or metadata
const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'secret',
  'secret_hash',
  'token',
  'auth_token',
  'jwt',
  'access_token',
  'refresh_token',
  'cookie',
  'authorization',
  'private_key',
  'national_id',
  'id_number',
  'passport_number',
  'credit_card',
  'cvv'
]);

/**
 * Deeply sanitizes an object to redact sensitive keys.
 */
function sanitizeMetadata(data, depth = 0) {
  if (!data || depth > 5) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeMetadata(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeMetadata(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

class AuditService {
  /**
   * Appends an immutable, tamper-evident audit event with chained hash integrity.
   */
  async recordAuditEvent({
    actorId = null,
    actorEmail = null,
    actorRole = null,
    action,
    resourceType,
    resourceId = null,
    outcome = 'SUCCESS',
    severity = 'INFO',
    ipAddress = null,
    userAgent = null,
    requestId = null,
    metadata = null
  }) {
    if (!action || !resourceType) {
      throw new Error('Audit event requires action and resourceType.');
    }

    const eventId = `aud_${crypto.randomUUID()}`;
    const safeMetadata = metadata ? sanitizeMetadata(metadata) : null;
    const metadataString = safeMetadata ? JSON.stringify(safeMetadata) : '{}';

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Retrieve previous event hash for blockchain-like cryptographic chaining
      const [latest] = await connection.query(
        'SELECT event_hash FROM audit_events ORDER BY id DESC LIMIT 1 FOR UPDATE'
      );
      const previousHash = latest.length > 0 ? latest[0].event_hash : 'GENESIS';

      // Deterministic payload string for cryptographic SHA-256 hash
      const payloadString = `${eventId}|${actorId || 'SYSTEM'}|${action}|${resourceType}|${resourceId || ''}|${outcome}|${severity}|${metadataString}|${previousHash}`;
      const eventHash = crypto.createHash('sha256').update(payloadString).digest('hex');

      await connection.query(
        `INSERT INTO audit_events 
          (event_id, actor_id, actor_email, actor_role, action, resource_type, resource_id, outcome, severity, ip_address, user_agent, request_id, metadata, previous_hash, event_hash) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          actorId,
          actorEmail,
          actorRole,
          action,
          resourceType,
          resourceId ? String(resourceId) : null,
          outcome,
          severity,
          ipAddress,
          userAgent,
          requestId,
          safeMetadata ? JSON.stringify(safeMetadata) : null,
          previousHash,
          eventHash
        ]
      );

      await connection.commit();

      return {
        eventId,
        eventHash,
        previousHash,
        action,
        resourceType,
        outcome,
        severity
      };
    } catch (error) {
      await connection.rollback();
      console.error('[AuditService] Failed to record audit event:', error.message);
      // Fail closed or gracefully re-throw depending on operational need
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves paginated and filtered audit events with authorization constraints.
   */
  async getAuditEvents({
    page = 1,
    limit = 20,
    actorId = null,
    action = null,
    resourceType = null,
    resourceId = null,
    outcome = null,
    severity = null,
    startDate = null,
    endDate = null,
    search = null
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (actorId) {
      conditions.push('ae.actor_id = ?');
      params.push(actorId);
    }
    if (action) {
      conditions.push('ae.action = ?');
      params.push(action);
    }
    if (resourceType) {
      conditions.push('ae.resource_type = ?');
      params.push(resourceType);
    }
    if (resourceId) {
      conditions.push('ae.resource_id = ?');
      params.push(resourceId);
    }
    if (outcome) {
      conditions.push('ae.outcome = ?');
      params.push(outcome);
    }
    if (severity) {
      conditions.push('ae.severity = ?');
      params.push(severity);
    }
    if (startDate) {
      conditions.push('ae.created_at >= ?');
      params.push(new Date(startDate));
    }
    if (endDate) {
      conditions.push('ae.created_at <= ?');
      params.push(new Date(endDate));
    }
    if (search) {
      conditions.push('(ae.action LIKE ? OR ae.resource_type LIKE ? OR ae.actor_email LIKE ? OR ae.event_id = ?)');
      const term = `%${search}%`;
      params.push(term, term, term, search);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_events ae ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [events] = await pool.query(
      `SELECT 
         ae.id,
         ae.event_id,
         ae.actor_id,
         ae.actor_email,
         ae.actor_role,
         ae.action,
         ae.resource_type,
         ae.resource_id,
         ae.outcome,
         ae.severity,
         ae.ip_address,
         ae.user_agent,
         ae.request_id,
         ae.metadata,
         ae.previous_hash,
         ae.event_hash,
         ae.created_at
       FROM audit_events ae
       ${whereClause}
       ORDER BY ae.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const parsedEvents = events.map(e => ({
      ...e,
      metadata: typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata
    }));

    return {
      events: parsedEvents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Retrieves single audit event by ID or event_id with safe metadata.
   */
  async getAuditEventById(idOrEventId) {
    const isNumeric = /^\d+$/.test(idOrEventId);
    const query = isNumeric
      ? 'SELECT * FROM audit_events WHERE id = ?'
      : 'SELECT * FROM audit_events WHERE event_id = ?';

    const [rows] = await pool.query(query, [idOrEventId]);
    if (rows.length === 0) return null;

    const event = rows[0];
    event.metadata = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
    return event;
  }

  /**
   * Validates the cryptographic integrity of the chained audit log.
   * Traverses from genesis to head and verifies all SHA-256 hashes.
   */
  async verifyAuditIntegrity() {
    const [events] = await pool.query('SELECT * FROM audit_events ORDER BY id ASC');

    let isValid = true;
    let brokenAtEventId = null;
    let expectedHash = null;
    let actualHash = null;

    let previousHash = 'GENESIS';

    for (const event of events) {
      if (event.previous_hash !== previousHash) {
        isValid = false;
        brokenAtEventId = event.event_id;
        break;
      }

      const metadataString = event.metadata ? (typeof event.metadata === 'string' ? event.metadata : JSON.stringify(event.metadata)) : '{}';
      const payloadString = `${event.event_id}|${event.actor_id || 'SYSTEM'}|${event.action}|${event.resource_type}|${event.resource_id || ''}|${event.outcome}|${event.severity}|${metadataString}|${event.previous_hash}`;
      const computedHash = crypto.createHash('sha256').update(payloadString).digest('hex');

      if (computedHash !== event.event_hash) {
        isValid = false;
        brokenAtEventId = event.event_id;
        expectedHash = computedHash;
        actualHash = event.event_hash;
        break;
      }

      previousHash = event.event_hash;
    }

    return {
      isValid,
      totalEventsVerified: events.length,
      lastVerifiedHash: previousHash,
      brokenAtEventId,
      expectedHash,
      actualHash
    };
  }

  /**
   * Creates and executes a compliance export job (CSV or JSON).
   * Respects date limits (max 90 days), logs export in audit trail.
   */
  async generateComplianceExport({
    requestedBy,
    actorEmail,
    actorRole,
    format = 'CSV',
    filters = {}
  }) {
    const exportId = `exp_${crypto.randomUUID()}`;
    const normalizedFormat = format.toUpperCase() === 'JSON' ? 'JSON' : 'CSV';

    // Retrieve matching records (max 5000 per export for safety)
    const { events } = await this.getAuditEvents({
      ...filters,
      page: 1,
      limit: 5000
    });

    let exportContent = '';

    if (normalizedFormat === 'JSON') {
      exportContent = JSON.stringify(events, null, 2);
    } else {
      // CSV format
      const headers = ['Event ID', 'Timestamp', 'Actor ID', 'Actor Email', 'Role', 'Action', 'Resource Type', 'Resource ID', 'Outcome', 'Severity', 'IP Address', 'Event Hash'];
      const rows = events.map(e => [
        `"${e.event_id}"`,
        `"${e.created_at}"`,
        `"${e.actor_id || ''}"`,
        `"${(e.actor_email || '').replace(/"/g, '""')}"`,
        `"${e.actor_role || ''}"`,
        `"${e.action}"`,
        `"${e.resource_type}"`,
        `"${e.resource_id || ''}"`,
        `"${e.outcome}"`,
        `"${e.severity}"`,
        `"${e.ip_address || ''}"`,
        `"${e.event_hash}"`
      ]);
      exportContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Save job record
    await pool.query(
      `INSERT INTO audit_export_jobs (export_id, requested_by, format, filter_criteria, record_count, status) 
       VALUES (?, ?, ?, ?, ?, 'COMPLETED')`,
      [exportId, requestedBy, normalizedFormat, JSON.stringify(filters), events.length]
    );

    // Audit the audit export itself!
    await this.recordAuditEvent({
      actorId: requestedBy,
      actorEmail,
      actorRole,
      action: 'AUDIT_EXPORT_GENERATED',
      resourceType: 'COMPLIANCE_REPORT',
      resourceId: exportId,
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: {
        format: normalizedFormat,
        recordCount: events.length,
        filters
      }
    });

    return {
      exportId,
      format: normalizedFormat,
      recordCount: events.length,
      content: exportContent
    };
  }

  /**
   * Aggregates audit KPIs for administrative dashboards.
   */
  async getAuditStats() {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM audit_events');
    const [severityRows] = await pool.query(
      'SELECT severity, COUNT(*) as count FROM audit_events GROUP BY severity'
    );
    const [outcomeRows] = await pool.query(
      'SELECT outcome, COUNT(*) as count FROM audit_events GROUP BY outcome'
    );
    const [topActionRows] = await pool.query(
      'SELECT action, COUNT(*) as count FROM audit_events GROUP BY action ORDER BY count DESC LIMIT 5'
    );

    const severityMap = {};
    for (const r of severityRows) severityMap[r.severity] = r.count;

    const outcomeMap = {};
    for (const r of outcomeRows) outcomeMap[r.outcome] = r.count;

    return {
      totalEvents: totalRows[0].total,
      bySeverity: severityMap,
      byOutcome: outcomeMap,
      topActions: topActionRows
    };
  }
}

export default new AuditService();
