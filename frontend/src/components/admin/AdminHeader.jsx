import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ExternalLink, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

export default function AdminHeader({ onMobileToggle, onFeaturePreview }) {
  const { user } = useAuth();

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Analyst':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-navy-100 text-navy-800 border-navy-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Mobile hamburger & Workspace Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileToggle}
            className="lg:hidden p-2 text-stone-600 hover:text-navy-900 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-navy-900 font-serif tracking-tight">
                OCL Administrative Workspace
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gold-100 text-gold-900 border border-gold-300">
                Milestone 6
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              Open Civic Lab Kenya • Real-time nationwide civic incident surveillance
            </p>
          </div>
        </div>

        {/* Right: Quick actions & profile summary */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Real In-App Notification Bell & Dropdown (Milestone 8) */}
          <NotificationBell />

          {/* Switch to Citizen View */}
          <Link
            to="/reports"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-navy-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
          >
            <span>Citizen Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-stone-200">
            <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-400 font-bold flex items-center justify-center text-xs shadow-inner">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-navy-900 leading-tight">
                {user?.full_name || 'Admin User'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeClasses(
                    user?.role
                  )}`}
                >
                  {user?.role || 'Staff'}
                </span>
                <span className="text-[11px] text-stone-400 truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
