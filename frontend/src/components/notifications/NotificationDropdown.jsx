import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCheck, ArrowRight, Loader2, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    recentNotifications,
    loadingRecent,
    unreadCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Load recent notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen, fetchRecentNotifications]);

  // Click outside to dismiss
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Esc key to dismiss
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-label="Recent notifications"
      >
        {/* Dropdown Header */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-navy-950 font-serif">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gold-500 text-navy-950 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await markAllAsRead();
                } catch (err) {
                  console.error(err);
                }
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              <CheckCheck className="w-3.5 h-3.5 text-gold-600" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Dropdown Body */}
        <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
          {loadingRecent ? (
            <div className="py-8 flex flex-col items-center justify-center text-stone-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-gold-600" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-navy-900">No notifications yet</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Real incident updates and alerts will appear here.
              </p>
            </div>
          ) : (
            recentNotifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={markAsRead}
                compact={true}
                onItemClick={onClose}
              />
            ))
          )}
        </div>

        {/* Dropdown Footer */}
        <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-navy-900 hover:text-gold-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors shadow-2xs"
          >
            <span>View All Notifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
