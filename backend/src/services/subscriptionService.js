import {
  getUserNotificationPreferences,
  upsertUserNotificationPreferences,
  getUserSubscriptions,
  createSubscriptionRecord,
  updateSubscriptionRecord,
  deleteSubscriptionRecord,
  unsubscribeByFilter,
  findMatchingSubscribersForAlert
} from '../models/subscriptionModel.js';
import { safeCreateNotification } from './notificationService.js';
import { pool } from '../config/database.js';

/**
 * M13 — Citizen Notifications & Subscriptions: Service
 */

export async function getPreferences(userId) {
  return await getUserNotificationPreferences(userId);
}

export async function updatePreferences(userId, data) {
  return await upsertUserNotificationPreferences(userId, data);
}

export async function getSubscriptions(userId) {
  return await getUserSubscriptions(userId);
}

export async function createSubscription(userId, data) {
  return await createSubscriptionRecord(userId, data);
}

export async function updateSubscription(subscriptionId, userId, data) {
  const result = await updateSubscriptionRecord(subscriptionId, userId, data);
  if (!result.found) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }
  if (!result.owned) {
    const error = new Error('You do not have permission to modify this subscription');
    error.status = 403;
    throw error;
  }
  return result.subscription;
}

export async function deleteSubscription(subscriptionId, userId) {
  const result = await deleteSubscriptionRecord(subscriptionId, userId);
  if (!result.found) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }
  if (!result.owned) {
    const error = new Error('You do not have permission to delete this subscription');
    error.status = 403;
    throw error;
  }
  return { success: true, message: 'Subscription removed successfully' };
}

export async function unsubscribe(userId, filter) {
  const result = await unsubscribeByFilter(userId, filter);
  if (!result.found) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }
  if (!result.owned) {
    const error = new Error('Unauthorized');
    error.status = 403;
    throw error;
  }
  return { success: true, message: 'Successfully unsubscribed' };
}

/**
 * Notification Matching & Dispatch Engine:
 * When an alert is published or activated, matches all eligible citizen subscribers
 * and dispatches deduplicated in-app notifications.
 *
 * Rules:
 * - Alert must be ACTIVE and public (DRAFT, PENDING_REVIEW, EXPIRED, ARCHIVED do not trigger notifications)
 * - Strict server-side deduplication using dedupeKey: `alert-published:${alert.id}:${userId}`
 */
export async function dispatchAlertNotifications(alertInput) {
  try {
    let alert = alertInput;

    // If only partial alert or ID passed, fetch complete alert row
    if (!alert.alert_type || alert.severity === undefined) {
      const [rows] = await pool.query('SELECT * FROM civic_alerts WHERE id = ?', [alert.id]);
      if (rows.length === 0) return { matched: 0, dispatched: 0 };
      alert = rows[0];
    }

    // Guard: Only ACTIVE alerts trigger notifications (Section 14: Drafts must NOT trigger notifications)
    if (alert.status !== 'ACTIVE') {
      return { matched: 0, dispatched: 0, reason: 'Alert is not active' };
    }

    // Find all matching subscriber user IDs
    const matchedUserIds = await findMatchingSubscribersForAlert(alert);

    let dispatchedCount = 0;
    for (const userId of matchedUserIds) {
      const notif = await safeCreateNotification({
        recipientUserId: userId,
        type: 'ALERT_PUBLISHED',
        title: `[${alert.severity}] ${alert.title}`,
        message: alert.summary || alert.description?.substring(0, 200) || alert.title,
        entityType: 'alert',
        entityId: alert.id,
        entityReference: `ALT-${alert.id}`,
        dedupeKey: `alert-published:${alert.id}:${userId}`
      });

      if (notif && !notif.isDuplicate) {
        dispatchedCount++;
      }
    }

    return {
      matched: matchedUserIds.length,
      dispatched: dispatchedCount
    };
  } catch (error) {
    console.error('[SubscriptionService] Failed to dispatch alert notifications:', error.message);
    return { matched: 0, dispatched: 0, error: error.message };
  }
}
