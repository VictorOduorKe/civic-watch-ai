import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import ResponsibleTechSection from '../components/ResponsibleTechSection';
import ImpactSection from '../components/ImpactSection';
import OclSection from '../components/OclSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';
import UpcomingModal from '../components/UpcomingModal';

export default function LandingPage() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    milestone: '',
    description: ''
  });

  function handleOpenUpcoming(details) {
    setModalConfig({
      isOpen: true,
      title: details.title,
      milestone: details.milestone,
      description: details.description
    });
  }

  function handleCloseUpcoming() {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-neutral-900 selection:bg-emerald-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenUpcoming={handleOpenUpcoming} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection onOpenUpcoming={handleOpenUpcoming} />
        <FeaturesSection onOpenUpcoming={handleOpenUpcoming} />
        <HowItWorksSection />
        <ResponsibleTechSection />
        <ImpactSection />
        <OclSection />
        <CtaSection onOpenUpcoming={handleOpenUpcoming} />
      </main>

      {/* Bottom Footer */}
      <Footer onOpenUpcoming={handleOpenUpcoming} />

      {/* Upcoming Module Dialog */}
      <UpcomingModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseUpcoming}
        title={modalConfig.title}
        milestone={modalConfig.milestone}
        description={modalConfig.description}
      />
    </div>
  );
}
