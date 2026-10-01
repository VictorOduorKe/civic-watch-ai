import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  ShieldCheck,
  BarChart3,
  Radio,
  Vote,
  Bell,
  FileSpreadsheet,
  Settings,
  LogOut,
  Shield,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpg';

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
  onFeaturePreview
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          name: 'Dashboard',
          path: '/admin',
          icon: LayoutDashboard,
          active: location.pathname === '/admin',
          badge: null,
          action: null
        }
      ]
    },
    {
      group: 'Operations',
      items: [
        {
          name: 'Incidents',
          path: null,
          icon: AlertTriangle,
          active: false,
          badge: 'M7',
          action: () =>
            onFeaturePreview({
              title: 'Incident Review & Assignment',
              milestone: 'Milestone 7',
              icon: <AlertTriangle className="w-5 h-5 text-gold-500" />,
              description:
                'Full administrative triage, operational assignment to county departments, status mutation controls, internal case notes, and official public updates will be activated in Milestone 7.',
              plannedCapabilities: [
                'Triage queue for new citizen reports',
                'Status progression controls (Under Review -> In Progress -> Resolved)',
                'County department & liaison assignment',
                'Internal staff investigation notes & referral records'
              ]
            })
        },
        {
          name: 'Users',
          path: null,
          icon: Users,
          active: false,
          badge: 'M14',
          action: () =>
            onFeaturePreview({
              title: 'User & Role Management',
              milestone: 'Milestone 14',
              icon: <Users className="w-5 h-5 text-gold-500" />,
              description:
                'Administrative user lifecycle management, role promotion, county liaison onboarding, and account suspension controls belong to Milestone 14.',
              plannedCapabilities: [
                'Role-based access management (Citizen, Moderator, Analyst, Admin)',
                'Staff onboarding and county liaison provisioning',
                'Account suspension and activation controls',
                'Identity verification and audit history'
              ]
            })
        }
      ]
    },
    {
      group: 'Intelligence',
      items: [
        {
          name: 'Verification',
          path: null,
          icon: ShieldCheck,
          active: false,
          badge: 'M9',
          action: () =>
            onFeaturePreview({
              title: 'AI Civic Fact-Checking',
              milestone: 'Milestone 9',
              icon: <ShieldCheck className="w-5 h-5 text-gold-500" />,
              description:
                'Gemini AI fact-checking engine cross-referencing national statutes, Kenya Gazettes, and county budgets will be introduced in Milestone 9.',
              plannedCapabilities: [
                'Statute and gazette database integration',
                'Automated veracity assessment of civic claims',
                'Public myth-busting alerts'
              ]
            })
        },
        {
          name: 'Analytics',
          path: '/admin',
          icon: BarChart3,
          active: false,
          badge: null,
          action: () => {
            const el = document.getElementById('analytics-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      ]
    },
    {
      group: 'Engagement',
      items: [
        {
          name: 'Alerts',
          path: null,
          icon: Radio,
          active: false,
          badge: 'M11',
          action: () =>
            onFeaturePreview({
              title: 'Civic Alerts & Advisories',
              milestone: 'Milestone 11',
              icon: <Radio className="w-5 h-5 text-gold-500" />,
              description:
                'Official county alerts, utility downtime broadcasts, and community advisories will launch in Milestone 11.',
              plannedCapabilities: [
                'County emergency broadcasts',
                'Geo-targeted flood & utility advisories',
                'Multi-channel SMS delivery'
              ]
            })
        },
        {
          name: 'Participation',
          path: null,
          icon: Vote,
          active: false,
          badge: 'M12',
          action: () =>
            onFeaturePreview({
              title: 'Civic Participation & Petitions',
              milestone: 'Milestone 12',
              icon: <Vote className="w-5 h-5 text-gold-500" />,
              description:
                'Public participation hearings, citizen petitions, and county budget consultation forums belong to Milestone 12.',
              plannedCapabilities: [
                'Online petition management with verified signature quorum',
                'County budget hearing schedules',
                'Citizen legislative feedback'
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
              title: 'Administrative Notification Center',
              milestone: 'Milestone 8',
              icon: <Bell className="w-5 h-5 text-gold-500" />,
              description:
                'Real-time automated incident escalation alerts and agency response notifications will be implemented in Milestone 8.',
              plannedCapabilities: [
                'Triage queue escalation notifications',
                'Daily digest emails for county oversight teams',
                'Multi-channel delivery logs'
              ]
            })
        }
      ]
    },
    {
      group: 'Governance',
      items: [
        {
          name: 'Audit Logs',
          path: null,
          icon: FileSpreadsheet,
          active: false,
          badge: 'M16',
          action: () =>
            onFeaturePreview({
              title: 'System Audit Logging',
              milestone: 'Milestone 16',
              icon: <FileSpreadsheet className="w-5 h-5 text-gold-500" />,
              description:
                'Comprehensive tamper-evident security audit trails tracking administrative record changes and logins will launch in Milestone 16.',
              plannedCapabilities: [
                'Immutable action audit trail',
                'Exportable compliance reports',
                'Security intrusion monitoring'
              ]
            })
        },
        {
          name: 'Settings',
          path: null,
          icon: Settings,
          active: false,
          badge: 'M16',
          action: () =>
            onFeaturePreview({
              title: 'Platform Governance Settings',
              milestone: 'Milestone 16',
              icon: <Settings className="w-5 h-5 text-gold-500" />,
              description:
                'Global platform configurations, category definitions, and integration settings belong to Milestone 16.',
              plannedCapabilities: [
                'Category schema management',
                'API key & webhook management',
                'Security policy configurations'
              ]
            })
        }
      ]
    }
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'AD';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-2xs"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-950 text-stone-100 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-navy-900 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Administrative Navigation"
      >
        {/* Top: Branding */}
        <div className="overflow-y-auto">
          <div className="h-16 px-4 border-b border-navy-900 flex items-center justify-between">
            <Link
              to="/admin"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded"
            >
              <img
                src={logo}
                alt="Open Civic Lab"
                className="w-8 h-8 rounded-full object-cover border border-gold-400 shadow-xs shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-wide text-white leading-tight">
                    CIVIC<span className="text-gold-500">WATCH</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                  OCL Administration
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-navy-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              aria-label="Close administrative sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Groups */}
          <nav className="p-3 space-y-4">
            {navGroups.map((group) => (
              <div key={group.group}>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {group.group}
                </div>
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    if (item.path && !item.action) {
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={onMobileClose}
                          className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                            item.active
                              ? 'bg-navy-900 text-white shadow-2xs border-l-2 border-gold-500 font-bold'
                              : 'text-stone-300 hover:bg-navy-900/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 ${
                                item.active ? 'text-gold-400' : 'text-stone-400'
                              }`}
                            />
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
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-stone-400 hover:bg-navy-900/60 hover:text-stone-200 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-stone-500" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-navy-900 text-stone-400 border border-navy-800">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Admin identity & Citizen Portal link */}
        <div className="p-3 border-t border-navy-900 bg-navy-950/80">
          <div className="bg-navy-900/80 rounded-lg p-3 mb-2 border border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-navy-950 text-gold-400 border border-gold-500/40 font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || 'Administrator'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {user?.email || 'admin@civicwatch.ke'}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-navy-800 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 text-gold-400 font-semibold">
                <Shield className="w-3 h-3 text-gold-500" />
                <span>{user?.role || 'Admin'}</span>
              </span>
              <span className="text-stone-500 font-mono text-[10px]">OCL Staff</span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-stone-400 hover:text-white hover:bg-navy-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-gold-500" />
                <span>Citizen Workspace</span>
              </span>
              <ChevronRight className="w-3 h-3 text-stone-500" />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-stone-300 hover:text-red-400 hover:bg-navy-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
