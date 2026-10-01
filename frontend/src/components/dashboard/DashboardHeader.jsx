import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Top Header for Authenticated Citizen Workspace.
 */
export default function DashboardHeader({ onMobileMenuToggle, onNotificationClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === '/profile') return 'Citizen Profile & Identity';
    return 'Citizen Workspace';
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'CW';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Mobile hamburger & Page Context Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-md text-stone-600 hover:text-navy-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-800"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-navy-950 leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              {user?.county ? `${user.county} County` : 'National Citizen Workspace'}
              {user?.ward ? ` • ${user.ward} Ward` : ''}
            </p>
          </div>
        </div>

        {/* Right: Notifications, User Avatar & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Button */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative p-2 text-stone-500 hover:text-navy-900 hover:bg-stone-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-navy-800"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500"></span>
          </button>

          {/* User Profile Pill / Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-stone-100 text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-800"
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-400 border border-gold-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-navy-950 leading-tight truncate max-w-[120px]">
                  {user?.fullName || 'Citizen User'}
                </span>
                <span className="text-[10px] text-gold-600 font-bold">
                  {user?.role || 'Citizen'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-navy-800">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>{user?.role || 'Citizen'} Account</span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>View Profile</span>
                  </Link>

                  <div className="border-t border-stone-100 my-1"></div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
