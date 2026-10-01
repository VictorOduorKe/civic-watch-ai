import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Sidebar Navigation for Authenticated Citizen Workspace.
 */
export default function DashboardSidebar({
  mobileOpen,
  onMobileClose,
  onFeaturePreview
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard',
      action: null
    },
    {
      name: 'My Reports',
      path: null,
      icon: FileText,
      active: false,
      badge: 'M5',
      action: () =>
        onFeaturePreview({
          title: 'My Reports & Tracking',
          milestone: 'Milestone 5',
          icon: <FileText className="w-5 h-5 text-emerald-900" />,
          description:
            'A centralized incident tracking center where you can follow public response timelines, official agency correspondence, and citizen verification statuses.',
          plannedCapabilities: [
            'Real-time status updates (Under Review, Investigating, Resolved)',
            'Agency correspondence and official action notices',
            'Interactive incident map and community verification upvotes',
            'Exportable PDF case dossiers for community advocacy'
          ]
        })
    },
    {
      name: 'Report an Issue',
      path: null,
      icon: PlusCircle,
      active: false,
      badge: 'M4',
      action: () =>
        onFeaturePreview({
          title: 'Incident Reporting Engine',
          milestone: 'Milestone 4',
          icon: <PlusCircle className="w-5 h-5 text-emerald-900" />,
          description:
            'A structured public incident intake flow enabling citizens across all 47 counties to report infrastructure breakdowns, public service delays, environmental hazards, and governance concerns.',
          plannedCapabilities: [
            'Geo-tagged Kenyan location picker with ward & constituency resolution',
            'Photo & video evidence upload with EXIF metadata preservation',
            'AI-assisted severity classification and department routing',
            'Anonymous submission mode with privacy preservation'
          ]
        })
    },
    {
      name: 'Notifications',
      path: null,
      icon: Bell,
      active: false,
      badge: 'M8',
      action: () =>
        onFeaturePreview({
          title: 'Citizen Notification Center',
          milestone: 'Milestone 8',
          icon: <Bell className="w-5 h-5 text-emerald-900" />,
          description:
            'Multi-channel alerts delivering timely notifications regarding your submitted reports, county emergency alerts, and community petition updates.',
          plannedCapabilities: [
            'In-app notification feed with unread counters',
            'Email and SMS delivery preferences',
            'County-level civic emergency broadcasts',
            'Status change alerts for subscribed community issues'
          ]
        })
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      active: location.pathname === '/profile',
      action: null
    }
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'CW';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-2xs"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-stone-900 text-stone-100 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Citizen Navigation"
      >
        {/* Top: Branding & Close Button */}
        <div>
          <div className="h-16 px-5 border-b border-stone-800 flex items-center justify-between">
            <Link
              to="/dashboard"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
            >
              <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs">
                CW
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wide text-white leading-tight">
                  CIVICWATCH <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                  Open Civic Lab
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Citizen Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.path) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onMobileClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                      item.active
                        ? 'bg-emerald-900 text-white shadow-2xs'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-stone-400'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    if (onMobileClose) onMobileClose();
                    if (item.action) item.action();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-stone-500" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Citizen Profile card & Real Logout */}
        <div className="p-3 border-t border-stone-800">
          <div className="bg-stone-800/80 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || 'Citizen User'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {user?.county || 'Kenya'}
                  {user?.ward ? ` • ${user.ward}` : ''}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-stone-700/60 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Shield className="w-3 h-3" />
                <span>{user?.role || 'Citizen'}</span>
              </span>
              <span className="text-stone-400">ID #{user?.id || 1}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-stone-300 hover:text-red-400 hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
