import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';
import NotificationItem from '../components/notifications/NotificationItem';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState';
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../layouts/AdminLayout';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { unreadCount, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchPageNotifications = useCallback(
    async (pageToLoad = 1, currentFilter = filter) => {
      setLoading(true);
      setError(null);
      try {
        const isUnreadFilter = currentFilter === 'unread';
        const data = await notificationService.getNotifications({
          page: pageToLoad,
          limit: 20,
          unread: isUnreadFilter ? true : undefined
        });

        if (data && data.success) {
          setNotifications(data.notifications || []);
          setPagination(data.pagination || { page: pageToLoad, limit: 20, total: 0, totalPages: 0 });
          // Synchronize unread count globally
          fetchUnreadCount();
        } else {
          throw new Error(data?.message || 'Failed to load notifications');
        }
      } catch (err) {
        setError(err.message || "We couldn't load your notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filter, fetchUnreadCount]
  );

  useEffect(() => {
    fetchPageNotifications(1, filter);
  }, [filter, fetchPageNotifications]);

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleMarkItemRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      if (filter === 'unread') {
        // If viewing unread filter, remove or refetch
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await markAllAsRead();
      if (filter === 'unread') {
        setNotifications([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      } else {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Action Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy-900 text-gold-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-navy-950 font-serif tracking-tight">
                  Notifications
                </h1>
                <p className="text-xs text-stone-500">
                  Real-time activity and status updates across your civic reports
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchPageNotifications(pagination.page, filter)}
              disabled={loading}
              className="p-2 text-stone-600 hover:text-navy-950 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
              title="Refresh notifications"
              aria-label="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={actionInProgress}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-navy-950 bg-gold-400 hover:bg-gold-500 rounded-lg transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-stone-200 flex items-center gap-6">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
              filter === 'all'
                ? 'text-navy-950 border-b-2 border-gold-500'
                : 'text-stone-500 hover:text-navy-900'
            }`}
          >
            <span>All Notifications</span>
            {filter === 'all' && pagination.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700">
                {pagination.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('unread')}
            className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'text-navy-950 border-b-2 border-gold-500'
                : 'text-stone-500 hover:text-navy-900'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-gold-500 text-navy-950">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Notification List Area */}
      <div>
        {loading ? (
          <div className="py-16 text-center bg-white rounded-xl border border-stone-200 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-500 font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-red-900 font-serif">
                We couldn't load your notifications
              </h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchPageNotifications(pagination.page, filter)}
              className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState filter={filter} />
        ) : (
          <div>
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkItemRead}
                  compact={false}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200 text-xs">
                <div className="text-stone-500">
                  Showing page <span className="font-semibold text-navy-950">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-navy-950">{pagination.totalPages}</span> ({pagination.total} total)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchPageNotifications(pagination.page - 1, filter)}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchPageNotifications(pagination.page + 1, filter)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in appropriate layout matching user role
  const isStaff = ['Admin', 'Moderator', 'Analyst'].includes(user?.role);
  if (isStaff && window.location.pathname.startsWith('/admin')) {
    return <div className="space-y-6">{content}</div>;
  }

  return <CitizenLayout>{content}</CitizenLayout>;
}
