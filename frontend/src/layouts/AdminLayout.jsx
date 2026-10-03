import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminComingSoonModal from '../components/admin/AdminComingSoonModal';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewFeature, setPreviewFeature] = useState(null);

  const handleOpenPreview = (feature) => {
    setPreviewFeature(feature);
  };

  const handleClosePreview = () => {
    setPreviewFeature(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* OCL Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onFeaturePreview={handleOpenPreview}
      />

      {/* Main Content Area offset by fixed sidebar width on desktop (lg:pl-64) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-200">
        {/* Sticky Admin Header */}
        <AdminHeader
          onMobileToggle={() => setMobileOpen((prev) => !prev)}
          onFeaturePreview={handleOpenPreview}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet context={{ onFeaturePreview: handleOpenPreview }} />
        </main>
      </div>

      {/* Milestone Roadmap Feature Modal */}
      <AdminComingSoonModal
        isOpen={Boolean(previewFeature)}
        onClose={handleClosePreview}
        feature={previewFeature}
      />
    </div>
  );
}
