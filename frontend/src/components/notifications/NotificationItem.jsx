import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Activity,
  UserCheck,
  MessageSquareText,
  Info,
  Bell,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Format relative time in a human-friendly format.
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
}

export default function NotificationItem({
  notification,
  onMarkRead,
  compact = false,
  onItemClick
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'REPORT_RECEIVED':
        return <FileCheck2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />;
      case 'REPORT_STATUS_CHANGED':
        return <Activity className="w-4 h-4 text-gold-600" aria-hidden="true" />;
      case 'REPORT_ASSIGNED':
        return <UserCheck className="w-4 h-4 text-navy-800" aria-hidden="true" />;
      case 'REPORT_UPDATED':
        return <MessageSquareText className="w-4 h-4 text-blue-700" aria-hidden="true" />;
      case 'SYSTEM_NOTIFICATION':
      default:
        return <Info className="w-4 h-4 text-stone-600" aria-hidden="true" />;
    }
  };

  const getTypeBadgeLabel = () => {
    switch (notification.type) {
      case 'REPORT_RECEIVED':
        return 'Received';
      case 'REPORT_STATUS_CHANGED':
        return 'Status';
      case 'REPORT_ASSIGNED':
        return 'Assignment';
      case 'REPORT_UPDATED':
        return 'Update';
      case 'SYSTEM_NOTIFICATION':
        return 'Notice';
      default:
        return 'Alert';
    }
  };

  const handleClick = async () => {
    // 1. Mark as read if currently unread
    if (!notification.isRead && onMarkRead) {
      try {
        await onMarkRead(notification.id);
      } catch (err) {
        console.error('Failed to mark read on click:', err);
      }
    }

    if (onItemClick) {
      onItemClick();
    }

    // 2. Safe navigation using entity reference
    if (notification.entityType === 'report' && notification.entityReference) {
      const isAdminUser = ['Admin', 'Moderator', 'Analyst'].includes(user?.role);
      if (notification.type === 'REPORT_ASSIGNED' || (isAdminUser && window.location.pathname.startsWith('/admin'))) {
        navigate(`/admin/incidents/${notification.entityReference}`);
      } else {
        navigate(`/reports/${notification.entityReference}`);
      }
    }
  };

  const isUnread = !notification.isRead;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative transition-all duration-150 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-lg ${
        compact
          ? 'p-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0'
          : `p-4 mb-2.5 bg-white rounded-xl border ${
              isUnread
                ? 'border-gold-300 bg-amber-50/20 shadow-xs'
                : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
            }`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon Badge */}
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
            isUnread
              ? 'bg-gold-50 border-gold-200'
              : 'bg-stone-100 border-stone-200'
          }`}
        >
          {getTypeIcon()}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-navy-950 font-serif leading-tight">
                {notification.title}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                {getTypeBadgeLabel()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-stone-400">
                {formatRelativeTime(notification.createdAt)}
              </span>
              {/* Unread Visual Indicator Dot */}
              {isUnread && (
                <span
                  className="w-2 h-2 rounded-full bg-gold-500 ring-2 ring-gold-200"
                  title="Unread notification"
                  aria-label="Unread"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed break-words line-clamp-2">
            {notification.message}
          </p>

          {/* Reference pill if entity exists */}
          {notification.entityReference && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-navy-800 bg-navy-50/60 px-2 py-0.5 rounded border border-navy-100 group-hover:bg-navy-100/60 transition-colors">
                <span>{notification.entityReference}</span>
                <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-navy-800" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
