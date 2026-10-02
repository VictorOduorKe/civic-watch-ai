import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell({ className = '' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const accessibleLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications, no unread notifications';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="relative p-2 text-stone-600 hover:text-navy-950 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
        aria-label={accessibleLabel}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        title={accessibleLabel}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />

        {/* Real unread badge counter */}
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gold-500 text-navy-950 text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Container */}
      <NotificationDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
      />
    </div>
  );
}
