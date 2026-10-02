import { pool } from '../config/database.js';

/**
 * Insert a new notification.
 * Handles duplicate dedupe_key gracefully (idempotency).
 */
export async function createNotificationRecord({
  recipientUserId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  entityReference = null,
  dedupeKey = null
}) {
  const query = `
    INSERT INTO notifications (
      recipient_user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      entity_reference,
      dedupe_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(query, [
      recipientUserId,
      type,
      title,
      message,
      entityType,
      entityId,
      entityReference,
      dedupeKey
    ]);

    return {
      id: result.insertId,
      recipientUserId,
      type,
      title,
      message,
      entityType,
      entityId,
      entityReference,
      isRead: false,
      readAt: null,
      dedupeKey,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    // If duplicate entry on dedupe_key, return existing notification without throwing error
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      if (dedupeKey) {
        const [existing] = await pool.query(
          'SELECT * FROM notifications WHERE dedupe_key = ? LIMIT 1',
          [dedupeKey]
        );
        if (existing.length > 0) {
          const row = existing[0];
          return {
            id: row.id,
            recipientUserId: row.recipient_user_id,
            type: row.type,
            title: row.title,
            message: row.message,
            entityType: row.entity_type,
            entityId: row.entity_id,
            entityReference: row.entity_reference,
            isRead: Boolean(row.is_read),
            readAt: row.read_at,
            dedupeKey: row.dedupe_key,
            createdAt: row.created_at,
            isDuplicate: true
          };
        }
      }
    }
    throw error;
  }
}

/**
 * Fetch paginated notifications for a specific authenticated user.
 */
export async function getNotificationsForUser({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false
}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (safePage - 1) * safeLimit;

  let whereClause = 'WHERE recipient_user_id = ?';
  const queryParams = [userId];

  if (unreadOnly) {
    whereClause += ' AND is_read = 0';
  }

  // Count total matching notifications
  const countSql = `SELECT COUNT(*) AS total FROM notifications ${whereClause}`;
  const [countRows] = await pool.query(countSql, queryParams);
  const total = countRows[0]?.total || 0;
  const totalPages = Math.ceil(total / safeLimit) || (total === 0 ? 0 : 1);

  // Fetch paginated rows ordered newest first
  const selectSql = `
    SELECT
      id,
      recipient_user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      entity_reference,
      is_read,
      read_at,
      created_at
    FROM notifications
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(selectSql, [...queryParams, safeLimit, offset]);

  const notifications = rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    entityType: r.entity_type,
    entityId: r.entity_id,
    entityReference: r.entity_reference,
    isRead: Boolean(r.is_read),
    readAt: r.read_at,
    createdAt: r.created_at
  }));

  // Also get the user's overall unread count
  const [unreadRows] = await pool.query(
    'SELECT COUNT(*) AS unreadCount FROM notifications WHERE recipient_user_id = ? AND is_read = 0',
    [userId]
  );
  const unreadCount = unreadRows[0]?.unreadCount || 0;

  return {
    notifications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages
    },
    unreadCount
  };
}

/**
 * Get total unread count for an authenticated user.
 */
export async function getUnreadCountForUser(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS unreadCount FROM notifications WHERE recipient_user_id = ? AND is_read = 0',
    [userId]
  );
  return rows[0]?.unreadCount || 0;
}

/**
 * Mark a single notification as read.
 * Strict ownership check: recipient_user_id = userId.
 * Idempotent: if already read, succeeds and returns isRead = true.
 */
export async function markNotificationAsRead({ notificationId, userId }) {
  // First check if notification exists and belongs to user
  const [existing] = await pool.query(
    'SELECT id, recipient_user_id, is_read, read_at FROM notifications WHERE id = ?',
    [notificationId]
  );

  if (existing.length === 0) {
    return { found: false, owned: false };
  }

  const notification = existing[0];
  if (notification.recipient_user_id !== userId) {
    return { found: true, owned: false };
  }

  if (!notification.is_read) {
    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_user_id = ?',
      [notificationId, userId]
    );
  }

  // Fetch updated notification row
  const [updated] = await pool.query(
    'SELECT id, type, title, message, entity_type, entity_id, entity_reference, is_read, read_at, created_at FROM notifications WHERE id = ?',
    [notificationId]
  );

  const row = updated[0];
  return {
    found: true,
    owned: true,
    notification: {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      entityType: row.entity_type,
      entityId: row.entity_id,
      entityReference: row.entity_reference,
      isRead: Boolean(row.is_read),
      readAt: row.read_at,
      createdAt: row.created_at
    }
  };
}

/**
 * Mark all notifications for a specific user as read.
 * Strict ownership: only updates notifications WHERE recipient_user_id = userId.
 */
export async function markAllNotificationsAsRead(userId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE recipient_user_id = ? AND is_read = 0',
    [userId]
  );

  return {
    affectedRows: result.affectedRows
  };
}
