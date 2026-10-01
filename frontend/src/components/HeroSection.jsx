import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onOpenUpcoming }) {
  const navigate = useNavigate();

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleReportClick() {
    navigate('/reports/new');
  }

  return (
    <section id="hero" className="bg-stone-50 border-b border-stone-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy-50 border border-navy-200 rounded-full text-xs font-semibold text-navy-900 uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-500"></span>
            Independent Civic Technology Initiative • Open Civic Lab
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
            <span className="text-navy-900">YOUR VOICE.</span> <br />
            <span>YOUR COMMUNITY.</span> <br />
            <span className="text-gold-600">YOUR KENYA.</span>
          </h1>

          {/* Supporting Core Message */}
          <p className="text-lg sm:text-xl text-stone-700 font-normal leading-relaxed mb-8">
            CivicWatch AI Kenya helps citizens connect civic concerns, trusted information, public participation, and community action in one place.
          </p>

          {/* Citizen action bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-sm text-stone-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Raise community & public-service concerns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Follow public-service issues with transparency</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Access reliable civic information & context</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Verify information and public claims</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Participate in surveys, petitions & dialogues</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Receive timely, relevant civic notices</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <button
              type="button"
              onClick={handleReportClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-navy-900 hover:bg-navy-950 text-white font-semibold text-base rounded-lg border-b-2 border-gold-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-navy-800 transition-colors"
            >
              <FileText className="w-5 h-5 text-gold-400" />
              Report an Issue
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-gold-50 text-navy-900 border border-stone-300 font-semibold text-base rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-navy-800 transition-colors"
            >
              Explore Capabilities
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </button>
          </div>

          {/* Honest Roadmap Context note */}
          <p className="text-xs text-stone-500 italic">
            * Milestone 4 Incident Reporting is active. Community alerts, participation forums, and AI assistance will activate in subsequent milestones.
          </p>
        </div>
      </div>
    </section>
  );
}
