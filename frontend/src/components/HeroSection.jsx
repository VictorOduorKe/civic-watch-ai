import React from 'react';
import { ArrowRight, FileText, CheckCircle2, Users, Bell, Search, Compass } from 'lucide-react';

export default function HeroSection({ onOpenUpcoming }) {
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleReportClick() {
    onOpenUpcoming({
      title: 'Incident Reporting Module',
      milestone: 'Milestone 4',
      description: 'The citizen incident reporting workflow with geo-location, evidence upload, and tracking will launch in Milestone 4. Full reporting capabilities will become active then.'
    });
  }

  return (
    <section id="hero" className="bg-stone-50 border-b border-stone-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 border border-stone-300 rounded text-xs font-semibold text-stone-800 uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
            Independent Civic Technology Initiative • Open Civic Lab
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
            YOUR VOICE. <br />
            YOUR COMMUNITY. <br />
            <span className="text-emerald-900">YOUR KENYA.</span>
          </h1>

          {/* Supporting Core Message */}
          <p className="text-lg sm:text-xl text-stone-700 font-normal leading-relaxed mb-8">
            CivicWatch AI Kenya helps citizens connect civic concerns, trusted information, public participation, and community action in one place.
          </p>

          {/* Citizen action bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-sm text-stone-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Raise community & public-service concerns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Follow public-service issues with transparency</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Access reliable civic information & context</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Verify information and public claims</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Participate in surveys, petitions & dialogues</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Receive timely, relevant civic notices</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <button
              type="button"
              onClick={handleReportClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-base rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Report an Incident
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-900 font-semibold text-base rounded focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors"
            >
              <Compass className="w-5 h-5 text-emerald-900" />
              Explore CivicWatch
            </button>
          </div>

          {/* Independent Notice */}
          <p className="text-xs text-stone-500">
            * CivicWatch AI Kenya is an independent civic technology platform developed for Open Civic Lab (OCL). It is not a government agency.
          </p>
        </div>
      </div>
    </section>
  );
}
