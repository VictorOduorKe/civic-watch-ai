import crypto from 'crypto';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { pool } from '../config/database.js';
import auditService from './auditService.js';

/**
 * SSRF Protection Validator.
 * Rejects private IP ranges, loopback addresses, localhosts, and non-HTTP(S) protocols.
 */
function validateSafeExternalUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are permitted for webhooks');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost / loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('SSRF Protection: Loopback and local hostnames are strictly disallowed');
  }

  // Check IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);

    if (
      oct1 === 10 || // 10.0.0.0/8
      (oct1 === 172 && oct2 >= 16 && oct2 <= 31) || // 172.16.0.0/12
      (oct1 === 192 && oct2 === 168) || // 192.168.0.0/16
      (oct1 === 169 && oct2 === 254) || // 169.254.0.0/16 link-local
      oct1 === 127 // 127.0.0.0/8
    ) {
      throw new Error('SSRF Protection: Private and link-local IP addresses are strictly disallowed');
    }
  }

  return parsed;
}

class GovernanceService {
  // ==========================================
  // 1. CATEGORY SCHEMA MANAGEMENT
  // ==========================================

  async listCategories({ module = null, status = null, search = null } = {}) {
    const conditions = [];
    const params = [];

    if (module) {
      conditions.push('module = ?');
      params.push(module);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, name, description, is_active, status, module, display_order, parent_id, metadata, created_at, updated_at
       FROM report_categories
       ${whereClause}
       ORDER BY display_order ASC, name ASC`,
      params
    );

    return rows.map(r => ({
      ...r,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
    }));
  }

  async getCategoryById(id) {
    const [rows] = await pool.query('SELECT * FROM report_categories WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const cat = rows[0];
    cat.metadata = typeof cat.metadata === 'string' ? JSON.parse(cat.metadata) : cat.metadata;
    return cat;
  }

  async createCategory({
    name,
    description,
    module = 'REPORT',
    displayOrder = 0,
    parentId = null,
    metadata = null,
    actorId = null,
    actorEmail = null,
    actorRole = null
  }) {
    if (!name || !description) {
      throw new Error('Category name and description are required.');
    }

    // Check duplicate name
    const [existing] = await pool.query('SELECT id FROM report_categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      const err = new Error(`Category "${name}" already exists.`);
      err.status = 409;
      throw err;
    }

    const [result] = await pool.query(
      `INSERT INTO report_categories (name, description, is_active, status, module, display_order, parent_id, metadata)
       VALUES (?, ?, TRUE, 'ACTIVE', ?, ?, ?, ?)`,
      [
        name.trim(),
        description.trim(),
        module,
        parseInt(displayOrder, 10) || 0,
        parentId || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    const categoryId = result.insertId;

    // Audit category creation
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'CATEGORY_CREATED',
      resourceType: 'PLATFORM_CATEGORY',
      resourceId: String(categoryId),
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: { name, module, displayOrder }
    });

    return this.getCategoryById(categoryId);
  }

  async updateCategory(
    id,
    { name, description, status, module, displayOrder, parentId, metadata },
    actorId = null,
    actorEmail = null,
    actorRole = null
  ) {
    const current = await this.getCategoryById(id);
    if (!current) {
      const err = new Error('Category not found');
      err.status = 404;
      throw err;
    }

    const newName = name !== undefined ? name.trim() : current.name;
    const newDesc = description !== undefined ? description.trim() : current.description;
    const newStatus = status !== undefined ? status : current.status;
    const newModule = module !== undefined ? module : current.module;
    const newOrder = displayOrder !== undefined ? parseInt(displayOrder, 10) : current.display_order;
    const newParent = parentId !== undefined ? parentId : current.parent_id;
    const newMeta = metadata !== undefined ? metadata : current.metadata;
    const isActive = newStatus === 'ACTIVE';

    await pool.query(
      `UPDATE report_categories 
       SET name = ?, description = ?, is_active = ?, status = ?, module = ?, display_order = ?, parent_id = ?, metadata = ?
       WHERE id = ?`,
      [
        newName,
        newDesc,
        isActive,
        newStatus,
        newModule,
        newOrder,
        newParent,
        newMeta ? JSON.stringify(newMeta) : null,
        id
      ]
    );

    // Audit category modification
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'CATEGORY_UPDATED',
      resourceType: 'PLATFORM_CATEGORY',
      resourceId: String(id),
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: {
        previousState: { name: current.name, status: current.status },
        newState: { name: newName, status: newStatus }
      }
    });

    return this.getCategoryById(id);
  }

  async archiveCategory(id, actorId = null, actorEmail = null, actorRole = null) {
    return this.updateCategory(
      id,
      { status: 'ARCHIVED' },
      actorId,
      actorEmail,
      actorRole
    );
  }

  // ==========================================
  // 2. API KEY MANAGEMENT
  // ==========================================

  async listApiKeys({ userId = null, status = null, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('ak.user_id = ?');
      params.push(userId);
    }
    if (status) {
      conditions.push('ak.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM api_keys ak ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT 
         ak.id,
         ak.key_id,
         ak.name,
         ak.key_prefix,
         ak.scopes,
         ak.user_id,
         ak.status,
         ak.last_used_at,
         ak.expires_at,
         ak.created_at,
         ak.updated_at,
         u.email as owner_email,
         u.full_name as owner_name
       FROM api_keys ak
       LEFT JOIN users u ON ak.user_id = u.id
       ${whereClause}
       ORDER BY ak.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return {
      keys: rows.map(k => ({
        ...k,
        scopes: typeof k.scopes === 'string' ? JSON.parse(k.scopes) : k.scopes
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async createApiKey({
    name,
    scopes = ['reports:read', 'alerts:read'],
    userId,
    actorEmail = null,
    actorRole = null,
    expiresInDays = 90
  }) {
    if (!name || !userId) {
      throw new Error('Key name and owner userId are required.');
    }

    const rawKeyId = `cwk_live_${crypto.randomBytes(8).toString('hex')}`;
    const rawSecret = `cwk_sec_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKeyId.substring(0, 16);
    const secretHash = crypto.createHash('sha512').update(rawSecret).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(expiresInDays, 10) || 90));

    const [result] = await pool.query(
      `INSERT INTO api_keys (key_id, name, key_prefix, secret_hash, scopes, user_id, status, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        rawKeyId,
        name.trim(),
        keyPrefix,
        secretHash,
        JSON.stringify(scopes),
        userId,
        expiresAt
      ]
    );

    // Audit key creation (NEVER record the rawSecret!)
    await auditService.recordAuditEvent({
      actorId: userId,
      actorEmail,
      actorRole,
      action: 'API_KEY_CREATED',
      resourceType: 'API_KEY',
      resourceId: rawKeyId,
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: { name, keyPrefix, scopes, expiresAt }
    });

    return {
      id: result.insertId,
      keyId: rawKeyId,
      name,
      keyPrefix,
      scopes,
      expiresAt,
      // Revealed ONCE at generation time
      secret: rawSecret,
      notice: 'Store this secret securely. It will NEVER be displayed again.'
    };
  }

  async rotateApiKey(keyId, actorId = null, actorEmail = null, actorRole = null) {
    const [rows] = await pool.query('SELECT * FROM api_keys WHERE key_id = ?', [keyId]);
    if (rows.length === 0) {
      const err = new Error('API key not found');
      err.status = 404;
      throw err;
    }

    const rawSecret = `cwk_sec_${crypto.randomBytes(32).toString('hex')}`;
    const secretHash = crypto.createHash('sha512').update(rawSecret).digest('hex');

    await pool.query(
      `UPDATE api_keys 
       SET secret_hash = ?, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP 
       WHERE key_id = ?`,
      [secretHash, keyId]
    );

    // Audit key rotation
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'API_KEY_ROTATED',
      resourceType: 'API_KEY',
      resourceId: keyId,
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: { keyId }
    });

    return {
      keyId,
      secret: rawSecret,
      notice: 'New secret generated. Old secret is permanently invalidated.'
    };
  }

  async revokeApiKey(keyId, actorId = null, actorEmail = null, actorRole = null) {
    const [rows] = await pool.query('SELECT * FROM api_keys WHERE key_id = ?', [keyId]);
    if (rows.length === 0) {
      const err = new Error('API key not found');
      err.status = 404;
      throw err;
    }

    await pool.query(
      `UPDATE api_keys SET status = 'REVOKED', updated_at = CURRENT_TIMESTAMP WHERE key_id = ?`,
      [keyId]
    );

    // Audit key revocation
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'API_KEY_REVOKED',
      resourceType: 'API_KEY',
      resourceId: keyId,
      outcome: 'SUCCESS',
      severity: 'WARNING',
      metadata: { keyId }
    });

    return { success: true, message: `API Key ${keyId} revoked.` };
  }

  // ==========================================
  // 3. WEBHOOK MANAGEMENT
  // ==========================================

  async listWebhooks({ userId = null, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('w.user_id = ?');
      params.push(userId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM webhooks w ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT 
         w.id,
         w.name,
         w.endpoint_url,
         w.event_subscriptions,
         w.status,
         w.failure_count,
         w.last_delivery_at,
         w.user_id,
         w.created_at,
         w.updated_at,
         u.email as owner_email
       FROM webhooks w
       LEFT JOIN users u ON w.user_id = u.id
       ${whereClause}
       ORDER BY w.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return {
      webhooks: rows.map(w => ({
        ...w,
        event_subscriptions: typeof w.event_subscriptions === 'string' ? JSON.parse(w.event_subscriptions) : w.event_subscriptions
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getWebhookById(id) {
    const [rows] = await pool.query('SELECT * FROM webhooks WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const w = rows[0];
    w.event_subscriptions = typeof w.event_subscriptions === 'string' ? JSON.parse(w.event_subscriptions) : w.event_subscriptions;
    return w;
  }

  async createWebhook({
    name,
    endpointUrl,
    eventSubscriptions = ['report.created', 'alert.published'],
    userId,
    actorEmail = null,
    actorRole = null
  }) {
    if (!name || !endpointUrl || !userId) {
      throw new Error('Webhook name, endpointUrl, and userId are required.');
    }

    // SSRF Validation
    validateSafeExternalUrl(endpointUrl);

    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const [result] = await pool.query(
      `INSERT INTO webhooks (name, endpoint_url, event_subscriptions, secret_hash, status, user_id)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        name.trim(),
        endpointUrl.trim(),
        JSON.stringify(eventSubscriptions),
        secretHash,
        userId
      ]
    );

    const webhookId = result.insertId;

    // Audit webhook creation
    await auditService.recordAuditEvent({
      actorId: userId,
      actorEmail,
      actorRole,
      action: 'WEBHOOK_CREATED',
      resourceType: 'WEBHOOK',
      resourceId: String(webhookId),
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: { name, endpointUrl, eventSubscriptions }
    });

    return {
      id: webhookId,
      name,
      endpointUrl,
      eventSubscriptions,
      signingSecret: secret,
      notice: 'Signing secret is displayed ONCE. Use it to verify HMAC signatures.'
    };
  }

  async updateWebhook(
    id,
    { name, endpointUrl, eventSubscriptions, status },
    actorId = null,
    actorEmail = null,
    actorRole = null
  ) {
    const current = await this.getWebhookById(id);
    if (!current) {
      const err = new Error('Webhook not found');
      err.status = 404;
      throw err;
    }

    if (endpointUrl) {
      validateSafeExternalUrl(endpointUrl);
    }

    const newName = name !== undefined ? name.trim() : current.name;
    const newUrl = endpointUrl !== undefined ? endpointUrl.trim() : current.endpoint_url;
    const newEvents = eventSubscriptions !== undefined ? eventSubscriptions : current.event_subscriptions;
    const newStatus = status !== undefined ? status : current.status;

    await pool.query(
      `UPDATE webhooks 
       SET name = ?, endpoint_url = ?, event_subscriptions = ?, status = ?
       WHERE id = ?`,
      [newName, newUrl, JSON.stringify(newEvents), newStatus, id]
    );

    // Audit webhook modification
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'WEBHOOK_UPDATED',
      resourceType: 'WEBHOOK',
      resourceId: String(id),
      outcome: 'SUCCESS',
      severity: 'NOTICE',
      metadata: {
        previousState: { name: current.name, url: current.endpoint_url },
        newState: { name: newName, url: newUrl }
      }
    });

    return this.getWebhookById(id);
  }

  async testWebhook(id, actorId = null, actorEmail = null, actorRole = null) {
    const webhook = await this.getWebhookById(id);
    if (!webhook) {
      const err = new Error('Webhook not found');
      err.status = 404;
      throw err;
    }

    const parsedUrl = validateSafeExternalUrl(webhook.endpoint_url);
    const testPayload = {
      event: 'ping.test',
      timestamp: new Date().toISOString(),
      platform: 'CivicWatch AI Kenya',
      webhookId: webhook.id
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = crypto.createHmac('sha256', webhook.secret_hash).update(payloadString).digest('hex');

    const startTime = Date.now();
    let statusCode = null;
    let deliveryStatus = 'FAILED';
    let errorMessage = null;

    try {
      // Execute test request with 5000ms timeout
      await new Promise((resolve, reject) => {
        const client = parsedUrl.protocol === 'https:' ? https : http;
        const req = client.request(
          parsedUrl,
          {
            method: 'POST',
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payloadString),
              'User-Agent': 'CivicWatch-Webhook-Dispatcher/1.0',
              'X-CivicWatch-Signature': `sha256=${signature}`,
              'X-CivicWatch-Event': 'ping.test',
              'X-CivicWatch-Timestamp': String(Math.floor(Date.now() / 1000))
            }
          },
          (res) => {
            statusCode = res.statusCode;
            deliveryStatus = statusCode >= 200 && statusCode < 300 ? 'SUCCESS' : 'FAILED';
            resolve();
          }
        );

        req.on('error', (err) => {
          errorMessage = err.message;
          reject(err);
        });
        req.on('timeout', () => {
          req.destroy();
          errorMessage = 'Delivery timed out after 5000ms';
          reject(new Error(errorMessage));
        });

        req.write(payloadString);
        req.end();
      });
    } catch (e) {
      errorMessage = errorMessage || e.message;
      deliveryStatus = 'FAILED';
    }

    const duration = Date.now() - startTime;

    // Record delivery history
    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event_type, payload_summary, status_code, response_time_ms, status, error_message)
       VALUES (?, 'ping.test', ?, ?, ?, ?, ?)`,
      [
        webhook.id,
        JSON.stringify({ event: 'ping.test', simulated: true }),
        statusCode,
        duration,
        deliveryStatus,
        errorMessage
      ]
    );

    // Update last delivery on webhook
    await pool.query(
      `UPDATE webhooks 
       SET last_delivery_at = CURRENT_TIMESTAMP, 
           failure_count = CASE WHEN ? = 'FAILED' THEN failure_count + 1 ELSE failure_count END 
       WHERE id = ?`,
      [deliveryStatus, webhook.id]
    );

    // Audit test ping
    await auditService.recordAuditEvent({
      actorId,
      actorEmail,
      actorRole,
      action: 'WEBHOOK_TESTED',
      resourceType: 'WEBHOOK',
      resourceId: String(webhook.id),
      outcome: deliveryStatus === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
      severity: 'NOTICE',
      metadata: {
        statusCode,
        durationMs: duration,
        status: deliveryStatus,
        error: errorMessage
      }
    });

    return {
      webhookId: webhook.id,
      endpointUrl: webhook.endpoint_url,
      deliveryStatus,
      statusCode,
      responseTimeMs: duration,
      errorMessage
    };
  }

  async getWebhookDeliveries(webhookId, page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM webhook_deliveries WHERE webhook_id = ?',
      [webhookId]
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM webhook_deliveries 
       WHERE webhook_id = ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
      [webhookId, limitNum, offset]
    );

    return {
      deliveries: rows.map(d => ({
        ...d,
        payload_summary: typeof d.payload_summary === 'string' ? JSON.parse(d.payload_summary) : d.payload_summary
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  // ==========================================
  // 4. SECURITY POLICY CONFIGURATIONS
  // ==========================================

  async getSecurityPolicies() {
    const [rows] = await pool.query(
      'SELECT * FROM security_policies ORDER BY category ASC, policy_key ASC'
    );
    return rows.map(r => ({
      ...r,
      policy_value: r.data_type === 'INTEGER' ? parseInt(r.policy_value, 10) : r.policy_value
    }));
  }

  async updateSecurityPolicy(
    key,
    newValue,
    actorId = null,
    actorEmail = null,
    actorRole = null,
    reason = 'Administrative policy update'
  ) {
    const [rows] = await pool.query('SELECT * FROM security_policies WHERE policy_key = ?', [key]);
    if (rows.length === 0) {
      const err = new Error(`Security policy "${key}" does not exist in configuration schema.`);
      err.status = 404;
      throw err;
    }

    const policy = rows[0];
    if (!policy.is_editable) {
      const err = new Error(`Security policy "${key}" is protected and cannot be edited dynamically.`);
      err.status = 403;
      throw err;
    }

    let parsedValue = newValue;
    if (policy.data_type === 'INTEGER') {
      parsedValue = parseInt(newValue, 10);
      if (isNaN(parsedValue)) {
        throw new Error(`Policy "${key}" requires an integer value.`);
      }
      if (policy.min_value !== null && parsedValue < policy.min_value) {
        throw new Error(`Policy "${key}" value must be at least ${policy.min_value}.`);
      }
      if (policy.max_value !== null && parsedValue > policy.max_value) {
        throw new Error(`Policy "${key}" value cannot exceed ${policy.max_value}.`);
      }
    }

    const previousValue = policy.policy_value;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update policy
      await connection.query(
        `UPDATE security_policies 
         SET policy_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE policy_key = ?`,
        [JSON.stringify(parsedValue), actorId, key]
      );

      // Record history
      await connection.query(
        `INSERT INTO security_policy_history (policy_key, previous_value, new_value, changed_by, change_reason)
         VALUES (?, ?, ?, ?, ?)`,
        [key, JSON.stringify(previousValue), JSON.stringify(parsedValue), actorId, reason]
      );

      await connection.commit();

      // Audit policy change
      await auditService.recordAuditEvent({
        actorId,
        actorEmail,
        actorRole,
        action: 'SECURITY_POLICY_CHANGED',
        resourceType: 'SECURITY_POLICY',
        resourceId: key,
        outcome: 'SUCCESS',
        severity: 'NOTICE',
        metadata: {
          policyKey: key,
          previousValue,
          newValue: parsedValue,
          reason
        }
      });

      return {
        policyKey: key,
        previousValue,
        newValue: parsedValue,
        reason
      };
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  }

  async getSecurityPolicyHistory(key = null) {
    let query = `
      SELECT sph.*, u.full_name as changer_name, u.email as changer_email
      FROM security_policy_history sph
      LEFT JOIN users u ON sph.changed_by = u.id
    `;
    const params = [];
    if (key) {
      query += ' WHERE sph.policy_key = ?';
      params.push(key);
    }
    query += ' ORDER BY sph.id DESC LIMIT 50';

    const [rows] = await pool.query(query, params);
    return rows.map(r => ({
      ...r,
      previous_value: typeof r.previous_value === 'string' ? JSON.parse(r.previous_value) : r.previous_value,
      new_value: typeof r.new_value === 'string' ? JSON.parse(r.new_value) : r.new_value
    }));
  }
}

export default new GovernanceService();
