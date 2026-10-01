import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ComingSoonModal from '../components/dashboard/ComingSoonModal';

/**
 * CitizenLayout — Authenticated layout shell for Citizen Workspace.
 */
export default function CitizenLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [previewFeature, setPreviewFeature] = useState(null);

  const handleNotificationClick = () => {
    setPreviewFeature({
      title: 'Citizen Notification Center',
      milestone: 'Milestone 8',
      icon: <Bell className="w-5 h-5 text-gold-500" />,
      description:
        'Live notifications for submitted report status changes, agency responses, and county emergency broadcasts will be activated in Milestone 8. Currently, you have 0 pending notifications.',
      plannedCapabilities: [
        'Instant alerts when your submitted reports change status',
        'Official county agency response notices',
        'Email and SMS notification delivery settings',
        'Local community civic petition milestones'
      ]
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased text-neutral-900">
      {/* Desktop & Mobile Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onFeaturePreview={(feature) => setPreviewFeature(feature)}
      />

      {/* Main Layout Area offset by sidebar width on large screens */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
          onNotificationClick={handleNotificationClick}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {typeof children === 'function'
            ? children({ onFeaturePreview: setPreviewFeature })
            : React.cloneElement(children, { onFeaturePreview: setPreviewFeature })}
        </main>

        {/* Global Footer in Citizen Workspace */}
        <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-stone-200 bg-white text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 CivicWatch AI Kenya • Developed for Open Civic Lab (OCL)
          </span>
          <div className="flex items-center gap-4">
            <span>Milestone 3 Authenticated Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            <span>Real Database Connection</span>
          </div>
        </footer>
      </div>

      {/* Roadmap / Coming Soon Modal */}
      <ComingSoonModal
        isOpen={Boolean(previewFeature)}
        onClose={() => setPreviewFeature(null)}
        feature={previewFeature}
      />
    </div>
  );
}
