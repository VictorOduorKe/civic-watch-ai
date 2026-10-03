import { pool } from '../config/database.js';

/**
 * Severity ranking weights for comparison:
 * CRITICAL (4) > HIGH (3) > MODERATE (2) > LOW (1) > INFO (0)
 */
export const SEVERITY_WEIGHTS = {
  INFO: 0,
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4
};

/**
 * Get user notification preferences. If none exist, returns default values.
 */
export async function getUserNotificationPreferences(userId) {
  const [rows] = await pool.query(
    'SELECT user_id, in_app_enabled, email_enabled, min_severity, created_at, updated_at FROM user_notification_preferences WHERE user_id = ?',
    [userId]
  );

  if (rows.length > 0) {
    const row = rows[0];
    return {
      userId: row.user_id,
      inAppEnabled: Boolean(row.in_app_enabled),
      emailEnabled: Boolean(row.email_enabled),
      minSeverity: row.min_severity,
      emailConfigured: false, // Informs client that email provider is not enabled
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Return default preferences
  return {
    userId,
    inAppEnabled: true,
    emailEnabled: false,
    minSeverity: 'LOW',
    emailConfigured: false,
    createdAt: null,
    updatedAt: null
  };
}

/**
 * Upsert user notification preferences.
 */
export async function upsertUserNotificationPreferences(userId, { in_app_enabled, email_enabled, min_severity }) {
  const current = await getUserNotificationPreferences(userId);

  const inApp = in_app_enabled !== undefined ? in_app_enabled : current.inAppEnabled;
  const email = email_enabled !== undefined ? email_enabled : current.emailEnabled;
  const minSev = min_severity !== undefined ? min_severity : current.minSeverity;

  const query = `
    INSERT INTO user_notification_preferences (user_id, in_app_enabled, email_enabled, min_severity)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      in_app_enabled = VALUES(in_app_enabled),
      email_enabled = VALUES(email_enabled),
      min_severity = VALUES(min_severity)
  `;

  await pool.query(query, [userId, inApp, email, minSev]);

  return await getUserNotificationPreferences(userId);
}

/**
 * List all alert subscriptions for a user.
 */
export async function getUserSubscriptions(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, alert_type, utility_service, county, sub_county, ward, min_severity, channel, is_active, created_at, updated_at
     FROM alert_subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    alertType: r.alert_type,
    utilityService: r.utility_service,
    county: r.county,
    subCounty: r.sub_county,
    ward: r.ward,
    minSeverity: r.min_severity,
    channel: r.channel,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

/**
 * Create a new alert subscription.
 * Deduplicates exact identical active subscriptions for the user.
 */
export async function createSubscriptionRecord(userId, {
  alert_type = null,
  utility_service = null,
  county = null,
  sub_county = null,
  ward = null,
  min_severity = null,
  channel = 'IN_APP',
  is_active = true
}) {
  // Check for existing identical active subscription
  const [existing] = await pool.query(
    `SELECT * FROM alert_subscriptions
     WHERE user_id = ?
       AND (alert_type <=> ?)
       AND (utility_service <=> ?)
       AND (county <=> ?)
       AND (sub_county <=> ?)
       AND (ward <=> ?)
       AND (min_severity <=> ?)
     LIMIT 1`,
    [userId, alert_type, utility_service, county, sub_county, ward, min_severity]
  );

  if (existing.length > 0) {
    const row = existing[0];
    // If it was inactive, reactivate it
    if (!row.is_active && is_active) {
      await pool.query(
        'UPDATE alert_subscriptions SET is_active = TRUE, channel = ? WHERE id = ?',
        [channel, row.id]
      );
    }
    return {
      id: row.id,
      userId: row.user_id,
      alertType: row.alert_type,
      utilityService: row.utility_service,
      county: row.county,
      subCounty: row.sub_county,
      ward: row.ward,
      minSeverity: row.min_severity,
      channel: channel || row.channel,
      isActive: true,
      createdAt: row.created_at,
      updatedAt: new Date().toISOString(),
      isDuplicate: true
    };
  }

  const [result] = await pool.query(
    `INSERT INTO alert_subscriptions (
      user_id, alert_type, utility_service, county, sub_county, ward, min_severity, channel, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, alert_type, utility_service, county, sub_county, ward, min_severity, channel, is_active]
  );

  return {
    id: result.insertId,
    userId,
    alertType: alert_type,
    utilityService: utility_service,
    county,
    subCounty: sub_county,
    ward,
    minSeverity: min_severity,
    channel,
    isActive: is_active,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update an existing subscription. Enforces ownership: user_id = userId.
 */
export async function updateSubscriptionRecord(subscriptionId, userId, data) {
  const [existing] = await pool.query(
    'SELECT * FROM alert_subscriptions WHERE id = ?',
    [subscriptionId]
  );

  if (existing.length === 0) {
    return { found: false, owned: false };
  }

  if (existing[0].user_id !== userId) {
    return { found: true, owned: false };
  }

  const fields = [];
  const params = [];

  if (data.alert_type !== undefined) { fields.push('alert_type = ?'); params.push(data.alert_type); }
  if (data.utility_service !== undefined) { fields.push('utility_service = ?'); params.push(data.utility_service); }
  if (data.county !== undefined) { fields.push('county = ?'); params.push(data.county); }
  if (data.sub_county !== undefined) { fields.push('sub_county = ?'); params.push(data.sub_county); }
  if (data.ward !== undefined) { fields.push('ward = ?'); params.push(data.ward); }
  if (data.min_severity !== undefined) { fields.push('min_severity = ?'); params.push(data.min_severity); }
  if (data.channel !== undefined) { fields.push('channel = ?'); params.push(data.channel); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active); }

  if (fields.length > 0) {
    params.push(subscriptionId, userId);
    await pool.query(
      `UPDATE alert_subscriptions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
  }

  const [updated] = await pool.query(
    'SELECT * FROM alert_subscriptions WHERE id = ?',
    [subscriptionId]
  );

  const r = updated[0];
  return {
    found: true,
    owned: true,
    subscription: {
      id: r.id,
      userId: r.user_id,
      alertType: r.alert_type,
      utilityService: r.utility_service,
      county: r.county,
      subCounty: r.sub_county,
      ward: r.ward,
      minSeverity: r.min_severity,
      channel: r.channel,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  };
}

/**
 * Delete a subscription. Enforces ownership: user_id = userId.
 */
export async function deleteSubscriptionRecord(subscriptionId, userId) {
  const [existing] = await pool.query(
    'SELECT * FROM alert_subscriptions WHERE id = ?',
    [subscriptionId]
  );

  if (existing.length === 0) {
    return { found: false, owned: false };
  }

  if (existing[0].user_id !== userId) {
    return { found: true, owned: false };
  }

  await pool.query(
    'DELETE FROM alert_subscriptions WHERE id = ? AND user_id = ?',
    [subscriptionId, userId]
  );

  return { found: true, owned: true };
}

/**
 * Unsubscribe by specific alert_type or county.
 */
export async function unsubscribeByFilter(userId, { subscription_id, alert_type, county }) {
  if (subscription_id) {
    return await deleteSubscriptionRecord(subscription_id, userId);
  }

  const conditions = ['user_id = ?'];
  const params = [userId];

  if (alert_type) {
    conditions.push('alert_type = ?');
    params.push(alert_type);
  }
  if (county) {
    conditions.push('county = ?');
    params.push(county);
  }

  const [result] = await pool.query(
    `DELETE FROM alert_subscriptions WHERE ${conditions.join(' AND ')}`,
    params
  );

  return { found: true, owned: true, affectedRows: result.affectedRows };
}

/**
 * M13 Notification Matching Engine:
 * Finds all active users who should receive an alert notification based on subscriptions and preferences.
 */
export async function findMatchingSubscribersForAlert(alert) {
  const alertWeight = SEVERITY_WEIGHTS[alert.severity] ?? 1;

  // 1. Fetch all candidate users matching subscriptions
  // Rules:
  // - Subscriptions: active = 1
  // - Alert type matches OR subscription alert_type IS NULL (all categories)
  // - County matches OR subscription county IS NULL (all counties) OR alert is 'National'
  // - Sub-county matches OR subscription sub_county IS NULL
  // - Utility service matches OR subscription utility_service IS NULL
  const [subscriptionUsers] = await pool.query(`
    SELECT DISTINCT s.user_id, s.min_severity AS sub_min_severity
    FROM alert_subscriptions s
    JOIN users u ON s.user_id = u.id
    WHERE s.is_active = TRUE
      AND u.is_active = TRUE
      AND (s.alert_type IS NULL OR s.alert_type = ?)
      AND (s.county IS NULL OR s.county = ? OR ? = 'National')
      AND (s.sub_county IS NULL OR s.sub_county = ? OR ? IS NULL)
      AND (s.utility_service IS NULL OR s.utility_service = ? OR ? IS NULL)
  `, [
    alert.alert_type || null,
    alert.county || null,
    alert.county || '',
    alert.sub_county || null,
    alert.sub_county || null,
    alert.utility_service || null,
    alert.utility_service || null
  ]);

  // 2. Also match active users whose primary profile county matches the alert county (or National alerts)
  // and admins/moderators who should always receive alerts
  const [profileUsers] = await pool.query(`
    SELECT id AS user_id, 'LOW' AS sub_min_severity
    FROM users
    WHERE is_active = TRUE
      AND (
        role IN ('Admin', 'Moderator')
        OR (? = 'National')
        OR (county IS NOT NULL AND county = ?)
      )
  `, [
    alert.county || '',
    alert.county || ''
  ]);

  // Combine and deduplicate candidates
  const candidateMap = new Map();
  for (const row of [...subscriptionUsers, ...profileUsers]) {
    if (!candidateMap.has(row.user_id)) {
      candidateMap.set(row.user_id, row.sub_min_severity);
    }
  }

  if (candidateMap.size === 0) {
    return [];
  }

  const userIds = Array.from(candidateMap.keys());

  // 3. Fetch user notification preferences for all candidate users
  const [prefRows] = await pool.query(
    `SELECT user_id, in_app_enabled, email_enabled, min_severity
     FROM user_notification_preferences
     WHERE user_id IN (?)`,
    [userIds]
  );

  const prefMap = new Map();
  for (const pref of prefRows) {
    prefMap.set(pref.user_id, {
      inAppEnabled: Boolean(pref.in_app_enabled),
      emailEnabled: Boolean(pref.email_enabled),
      minSeverity: pref.min_severity
    });
  }

  // 4. Filter candidates based on preferences & severity threshold
  const matchedUserIds = [];

  for (const userId of userIds) {
    const prefs = prefMap.get(userId) || { inAppEnabled: true, emailEnabled: false, minSeverity: 'LOW' };

    // If user has explicitly disabled in-app notifications, skip
    if (!prefs.inAppEnabled) {
      continue;
    }

    // Determine the minimum required severity (subscription specific takes precedence or fallback to global pref)
    const subMinSev = candidateMap.get(userId);
    const requiredSeverity = subMinSev || prefs.minSeverity || 'LOW';
    const requiredWeight = SEVERITY_WEIGHTS[requiredSeverity] ?? 1;

    // Check if alert severity meets or exceeds threshold
    if (alertWeight >= requiredWeight) {
      matchedUserIds.push(userId);
    }
  }

  return matchedUserIds;
}
