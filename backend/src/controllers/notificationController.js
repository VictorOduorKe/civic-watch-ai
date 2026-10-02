import {
  getUserNotifications,
  getUserUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} from '../services/notificationService.js';

/**
 * GET /api/notifications
 * Retrieve paginated notifications for the authenticated user.
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, unread } = req.query;

    const result = await getUserNotifications({
      userId,
      page,
      limit,
      unreadOnly: Boolean(unread)
    });

    return res.status(200).json({
      success: true,
      notifications: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notifications/unread-count
 * Retrieve total unread notifications count for the authenticated user.
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const unreadCount = await getUserUnreadCount(userId);

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read for the authenticated user.
 */
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    const notification = await markNotificationRead({
      notificationId,
      userId
    });

    const unreadCount = await getUserUnreadCount(userId);

    return res.status(200).json({
      success: true,
      notification,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await markAllNotificationsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error) {
    next(error);
  }
}
