import {
  createNotificationRecord,
  getNotificationsForUser,
  getUnreadCountForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../models/notificationModel.js';
import { createNotificationSchema } from '../validators/notificationValidators.js';

/**
 * CivicWatch AI Kenya — Notification Service (Milestone 8)
 * Core business service for in-app notifications.
 */

/**
 * Generic notification creator. Validates input and persists to database.
 */
export async function createNotification(params) {
  // Validate input parameters
  const validated = createNotificationSchema.parse(params);

  return await createNotificationRecord(validated);
}

/**
 * Safely create a notification without interrupting primary business workflows.
 * Logs error if notification fails, avoiding transaction rollback of user operations.
 */
export async function safeCreateNotification(params) {
  try {
    return await createNotification(params);
  } catch (error) {
    console.error(`[NotificationService Error] Failed to create notification (${params?.type}):`, error.message);
    return null;
  }
}

/**
 * Helper: Create REPORT_RECEIVED notification for the reporting citizen.
 */
export async function createReportReceivedNotification({
  recipientUserId,
  reportId,
  reportReference
}) {
  if (!recipientUserId) return null;

  return await safeCreateNotification({
    recipientUserId,
    type: 'REPORT_RECEIVED',
    title: 'Report Received',
    message: `Your report ${reportReference} has been received.`,
    entityType: 'report',
    entityId: reportId,
    entityReference: reportReference,
    dedupeKey: `report-received:${reportId}:${recipientUserId}`
  });
}

/**
 * Helper: Create REPORT_STATUS_CHANGED notification for citizen when status changes.
 */
export async function createStatusChangedNotification({
  recipientUserId,
  reportId,
  reportReference,
  newStatus,
  historyId = null
}) {
  if (!recipientUserId) return null;

  const dedupeKey = historyId
    ? `status-change:${reportId}:${historyId}`
    : `status-change:${reportId}:${newStatus}`;

  return await safeCreateNotification({
    recipientUserId,
    type: 'REPORT_STATUS_CHANGED',
    title: 'Report Status Updated',
    message: `Your report ${reportReference} is now ${newStatus.toLowerCase()}.`,
    entityType: 'report',
    entityId: reportId,
    entityReference: reportReference,
    dedupeKey
  });
}

/**
 * Helper: Create REPORT_UPDATED notification for citizen when an official citizen update is posted.
 */
export async function createReportUpdatedNotification({
  recipientUserId,
  reportId,
  reportReference,
  updateId
}) {
  if (!recipientUserId) return null;

  return await safeCreateNotification({
    recipientUserId,
    type: 'REPORT_UPDATED',
    title: 'Report Updated',
    message: `There is a new update on your report ${reportReference}.`,
    entityType: 'report',
    entityId: reportId,
    entityReference: reportReference,
    dedupeKey: `report-update:${reportId}:${updateId}`
  });
}

/**
 * Helper: Create REPORT_ASSIGNED notification for assigned staff member.
 */
export async function createReportAssignedNotification({
  assignedToUserId,
  reportId,
  reportReference
}) {
  if (!assignedToUserId) return null;

  return await safeCreateNotification({
    recipientUserId: assignedToUserId,
    type: 'REPORT_ASSIGNED',
    title: 'Report Assigned',
    message: `Report ${reportReference} has been assigned to you for review.`,
    entityType: 'report',
    entityId: reportId,
    entityReference: reportReference,
    dedupeKey: `assignment:${reportId}:${assignedToUserId}`
  });
}

/**
 * Helper: Create generic SYSTEM_NOTIFICATION.
 */
export async function createSystemNotification({
  recipientUserId,
  title,
  message,
  entityType = null,
  entityId = null,
  entityReference = null,
  dedupeKey = null
}) {
  return await safeCreateNotification({
    recipientUserId,
    type: 'SYSTEM_NOTIFICATION',
    title,
    message,
    entityType,
    entityId,
    entityReference,
    dedupeKey
  });
}

/**
 * Query notifications for authenticated user.
 */
export async function getUserNotifications({ userId, page = 1, limit = 20, unreadOnly = false }) {
  return await getNotificationsForUser({ userId, page, limit, unreadOnly });
}

/**
 * Query unread count for authenticated user.
 */
export async function getUserUnreadCount(userId) {
  return await getUnreadCountForUser(userId);
}

/**
 * Mark a single notification as read for authenticated user.
 */
export async function markNotificationRead({ notificationId, userId }) {
  const result = await markNotificationAsRead({ notificationId, userId });

  if (!result.found) {
    const error = new Error('Notification not found');
    error.status = 404;
    throw error;
  }

  if (!result.owned) {
    const error = new Error('You do not have permission to access this notification');
    error.status = 403;
    throw error;
  }

  return result.notification;
}

/**
 * Mark all notifications as read for authenticated user.
 */
export async function markAllNotificationsRead(userId) {
  const result = await markAllNotificationsAsRead(userId);
  return {
    success: true,
    message: 'All notifications marked as read',
    count: result.affectedRows
  };
}
