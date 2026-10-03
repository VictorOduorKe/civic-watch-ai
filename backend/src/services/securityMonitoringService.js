import { pool } from '../config/database.js';
import auditService from './auditService.js';

class SecurityMonitoringService {
  /**
   * Retrieves security threshold policies from the database.
   */
  async getPolicyValue(policyKey, fallbackValue) {
    try {
      const [rows] = await pool.query(
        'SELECT policy_value, data_type FROM security_policies WHERE policy_key = ?',
        [policyKey]
      );
      if (rows.length === 0) return fallbackValue;
      const raw = rows[0].policy_value;
      if (rows[0].data_type === 'INTEGER') return parseInt(raw, 10);
      if (rows[0].data_type === 'BOOLEAN') return Boolean(raw);
      return raw;
    } catch {
      return fallbackValue;
    }
  }

  /**
   * Records a detected potential security intrusion event.
   */
  async recordSecurityEvent({
    eventCode,
    title,
    description,
    severity = 'SECURITY',
    sourceIp = null,
    userId = null,
    thresholdDetails = null,
    relatedEventIds = null
  }) {
    // Check alert cooldown to avoid flooding alerts for identical IP/eventCode
    const cooldownMins = await this.getPolicyValue('security_alert_cooldown_mins', 30);
    const [recent] = await pool.query(
      `SELECT id FROM security_events 
       WHERE event_code = ? AND (source_ip = ? OR (user_id IS NOT NULL AND user_id = ?))
         AND created_at >= NOW() - INTERVAL ? MINUTE
       LIMIT 1`,
      [eventCode, sourceIp || '0.0.0.0', userId || -1, cooldownMins]
    );

    if (recent.length > 0) {
      // Within cooldown period — suppress duplicate alert
      return { suppressed: true, existingId: recent[0].id };
    }

    const [result] = await pool.query(
      `INSERT INTO security_events 
        (event_code, title, description, severity, status, source_ip, user_id, threshold_details, related_event_ids) 
       VALUES (?, ?, ?, ?, 'DETECTED', ?, ?, ?, ?)`,
      [
        eventCode,
        title,
        description,
        severity,
        sourceIp,
        userId,
        thresholdDetails ? JSON.stringify(thresholdDetails) : null,
        relatedEventIds ? JSON.stringify(relatedEventIds) : null
      ]
    );

    // Audit the creation of the security incident
    await auditService.recordAuditEvent({
      actorId: userId,
      actorEmail: null,
      actorRole: 'SECURITY_MONITOR',
      action: 'SECURITY_INTRUSION_DETECTED',
      resourceType: 'SECURITY_EVENT',
      resourceId: String(result.insertId),
      outcome: 'SUCCESS',
      severity: severity === 'CRITICAL' ? 'CRITICAL' : 'SECURITY',
      ipAddress: sourceIp,
      metadata: {
        eventCode,
        title,
        thresholdDetails
      }
    });

    return {
      id: result.insertId,
      eventCode,
      status: 'DETECTED',
      severity
    };
  }

  /**
   * Evaluates authentication or request failures for automated intrusion detection.
   */
  async evaluateFailedLogin({ email, ipAddress, userAgent }) {
    const threshold = await this.getPolicyValue('failed_login_threshold', 5);

    // Check failed logins in last 15 minutes for this IP or email
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count, GROUP_CONCAT(event_id) as event_ids 
       FROM audit_events 
       WHERE action = 'USER_LOGIN' AND outcome = 'FAILURE'
         AND (ip_address = ? OR actor_email = ?)
         AND created_at >= NOW() - INTERVAL 15 MINUTE`,
      [ipAddress || '0.0.0.0', email || '']
    );

    const failCount = rows[0]?.count || 0;
    if (failCount >= threshold) {
      const eventIds = rows[0]?.event_ids ? rows[0].event_ids.split(',').slice(0, 10) : [];
      return this.recordSecurityEvent({
        eventCode: 'FAILED_LOGIN_BURST',
        title: 'Repeated Authentication Failures Detected',
        description: `Source generated ${failCount} failed login attempts within 15 minutes (Threshold: ${threshold}).`,
        severity: failCount >= threshold * 2 ? 'CRITICAL' : 'SECURITY',
        sourceIp: ipAddress,
        thresholdDetails: { failCount, threshold, windowMins: 15, targetEmail: email },
        relatedEventIds: eventIds
      });
    }

    return null;
  }

  /**
   * Evaluates unauthorized (401/403) request bursts for intrusion detection.
   */
  async evaluateUnauthorizedBurst({ ipAddress, userId, resourceType }) {
    const threshold = await this.getPolicyValue('unauthorized_request_threshold', 10);

    const [rows] = await pool.query(
      `SELECT COUNT(*) as count, GROUP_CONCAT(event_id) as event_ids 
       FROM audit_events 
       WHERE outcome IN ('DENIED', 'BLOCKED')
         AND (ip_address = ? OR (actor_id IS NOT NULL AND actor_id = ?))
         AND created_at >= NOW() - INTERVAL 5 MINUTE`,
      [ipAddress || '0.0.0.0', userId || -1]
    );

    const deniedCount = rows[0]?.count || 0;
    if (deniedCount >= threshold) {
      const eventIds = rows[0]?.event_ids ? rows[0].event_ids.split(',').slice(0, 10) : [];
      return this.recordSecurityEvent({
        eventCode: 'UNAUTHORIZED_REQUEST_BURST',
        title: 'Repeated Unauthorized Access Attempts',
        description: `Source generated ${deniedCount} denied requests within 5 minutes (Threshold: ${threshold}).`,
        severity: 'WARNING',
        sourceIp: ipAddress,
        userId,
        thresholdDetails: { deniedCount, threshold, windowMins: 5, targetResource: resourceType },
        relatedEventIds: eventIds
      });
    }

    return null;
  }

  /**
   * Retrieves paginated list of security events.
   */
  async getSecurityEvents({
    status = null,
    severity = null,
    eventCode = null,
    page = 1,
    limit = 20
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('se.status = ?');
      params.push(status);
    }
    if (severity) {
      conditions.push('se.severity = ?');
      params.push(severity);
    }
    if (eventCode) {
      conditions.push('se.event_code = ?');
      params.push(eventCode);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM security_events se ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [events] = await pool.query(
      `SELECT 
         se.id,
         se.event_code,
         se.title,
         se.description,
         se.severity,
         se.status,
         se.source_ip,
         se.user_id,
         se.threshold_details,
         se.related_event_ids,
         se.reviewed_by,
         se.reviewed_at,
         se.resolution_note,
         se.created_at,
         se.updated_at,
         u.full_name as user_name,
         u.email as user_email,
         r.full_name as reviewer_name
       FROM security_events se
       LEFT JOIN users u ON se.user_id = u.id
       LEFT JOIN users r ON se.reviewed_by = r.id
       ${whereClause}
       ORDER BY se.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return {
      events: events.map(e => ({
        ...e,
        threshold_details: typeof e.threshold_details === 'string' ? JSON.parse(e.threshold_details) : e.threshold_details,
        related_event_ids: typeof e.related_event_ids === 'string' ? JSON.parse(e.related_event_ids) : e.related_event_ids
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Retrieves single security event by ID.
   */
  async getSecurityEventById(id) {
    const [rows] = await pool.query(
      `SELECT 
         se.*,
         u.full_name as user_name,
         u.email as user_email,
         r.full_name as reviewer_name
       FROM security_events se
       LEFT JOIN users u ON se.user_id = u.id
       LEFT JOIN users r ON se.reviewed_by = r.id
       WHERE se.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const e = rows[0];
    e.threshold_details = typeof e.threshold_details === 'string' ? JSON.parse(e.threshold_details) : e.threshold_details;
    e.related_event_ids = typeof e.related_event_ids === 'string' ? JSON.parse(e.related_event_ids) : e.related_event_ids;
    return e;
  }

  /**
   * Updates status of a security event (e.g. REVIEWING, CONFIRMED, DISMISSED, RESOLVED).
   */
  async updateSecurityEventStatus({
    id,
    status,
    reviewedBy,
    reviewerEmail,
    reviewerRole,
    resolutionNote = null
  }) {
    const allowedStatuses = ['DETECTED', 'REVIEWING', 'CONFIRMED', 'DISMISSED', 'RESOLVED'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid security event status: ${status}`);
    }

    const current = await this.getSecurityEventById(id);
    if (!current) {
      const err = new Error('Security event not found');
      err.status = 404;
      throw err;
    }

    await pool.query(
      `UPDATE security_events 
       SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, resolution_note = ? 
       WHERE id = ?`,
      [status, reviewedBy, resolutionNote, id]
    );

    // Audit the review action
    await auditService.recordAuditEvent({
      actorId: reviewedBy,
      actorEmail: reviewerEmail,
      actorRole: reviewerRole,
      action: 'SECURITY_EVENT_REVIEWED',
      resourceType: 'SECURITY_EVENT',
      resourceId: String(id),
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: {
        previousStatus: current.status,
        newStatus: status,
        resolutionNote
      }
    });

    return this.getSecurityEventById(id);
  }

  /**
   * Retrieves security monitoring summary statistics.
   */
  async getSecurityMonitoringStats() {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM security_events');
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM security_events GROUP BY status'
    );
    const [severityRows] = await pool.query(
      'SELECT severity, COUNT(*) as count FROM security_events GROUP BY severity'
    );

    const statusMap = { DETECTED: 0, REVIEWING: 0, CONFIRMED: 0, DISMISSED: 0, RESOLVED: 0 };
    for (const r of statusRows) statusMap[r.status] = r.count;

    const severityMap = { WARNING: 0, SECURITY: 0, CRITICAL: 0 };
    for (const r of severityRows) severityMap[r.severity] = r.count;

    return {
      totalSecurityEvents: totalRows[0].total,
      byStatus: statusMap,
      bySeverity: severityMap,
      activeUnresolvedCount: statusMap.DETECTED + statusMap.REVIEWING + statusMap.CONFIRMED
    };
  }
}

export default new SecurityMonitoringService();
