import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const pollingTimerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Fetch current unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await notificationService.getUnreadNotificationCount();
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Gracefully ignore network errors during periodic polling
    }
  }, [user]);

  // Fetch top 5 recent notifications for dropdown
  const fetchRecentNotifications = useCallback(async () => {
    if (!user) {
      setRecentNotifications([]);
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingRecent(true);
    try {
      const data = await notificationService.getNotifications({ page: 1, limit: 5 });
      if (data && Array.isArray(data.notifications)) {
        setRecentNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch {
      // Gracefully handle error
    } finally {
      setLoadingRecent(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const result = await notificationService.markNotificationRead(notificationId);
      // Synchronize recent notifications
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      if (typeof result.unreadCount === 'number') {
        setUnreadCount(result.unreadCount);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return result;
    } catch (err) {
      console.error('[NotificationContext] Failed to mark read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllNotificationsRead();
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      return result;
    } catch (err) {
      console.error('[NotificationContext] Failed to mark all read:', err);
      throw err;
    }
  }, []);

  // Periodic polling setup (every 45 seconds when user is authenticated)
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setRecentNotifications([]);
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    // 45-second polling interval
    pollingTimerRef.current = setInterval(() => {
      // Only poll when page tab is visible
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    }, 45000);

    // Refresh count when user switches back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchUnreadCount]);

  const value = {
    unreadCount,
    recentNotifications,
    loadingRecent,
    fetchUnreadCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
