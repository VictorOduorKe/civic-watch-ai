import { apiClient } from './api.js';

/**
 * CivicWatch AI Kenya — Frontend Notification Service (Milestone 8)
 * Communicates with the in-app notification endpoints using secure credentials.
 */
export const notificationService = {
  /**
   * Fetch paginated notifications with optional unread filter.
   */
  async getNotifications({ page = 1, limit = 20, unread } = {}) {
    const params = { page, limit };
    if (typeof unread === 'boolean') {
      params.unread = unread;
    }
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Fetch real-time total unread notification count.
   */
  async getUnreadNotificationCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  async markNotificationRead(notificationId) {
    const response = await apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/read`);
    return response.data;
  },

  /**
   * Mark all notifications for current user as read.
   */
  async markAllNotificationsRead() {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
