import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, LogIn, UserPlus, FileText, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

export default function Footer({ onOpenUpcoming }) {
  const { isAuthenticated } = useAuth();

  function scrollToSection(id) {
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer className="bg-[#061528] text-stone-100 text-sm border-t-2 border-gold-500 shadow-2xl relative z-10 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Purpose */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImg}
                alt="Open Civic Lab Logo"
                className="w-11 h-11 rounded-full object-cover border-2 border-gold-500 shadow-md shrink-0"
              />
              <div>
                <span className="block text-lg font-black text-white tracking-tight leading-none">
                  CIVICWATCH AI
                </span>
                <span className="block text-xs font-bold text-gold-400 uppercase tracking-wider mt-0.5">
                  Open Civic Lab • Kenya
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed mb-4">
              An independent civic technology initiative developed under <strong className="text-white">Open Civic Lab (OCL)</strong> to foster transparency, citizen participation, and verified public accountability across all 47 counties.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-900 border border-gold-500/40 rounded-md text-xs font-semibold text-gold-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              <span>Open Civic Lab Kenya</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-400 pb-2 mb-4 border-b border-navy-800">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection(null)}
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>How It Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>Features</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>About Open Civic Lab</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Roadmap */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-400 pb-2 mb-4 border-b border-navy-800">
              Platform Modules
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/reports/new"
                  className="inline-flex items-center gap-2 px-2.5 py-1 bg-navy-900/80 hover:bg-navy-800 text-white font-semibold border border-gold-500/50 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-gold-400" />
                  <span>Incident Reporting (Active)</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUpcoming({
                      title: 'Civic Alerts',
                      milestone: 'Milestone 5',
                      description: 'Public alerts and geographic notices arriving in Milestone 5.'
                    })
                  }
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>Civic Alerts (M5)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUpcoming({
                      title: 'Civic Participation',
                      milestone: 'Milestone 8',
                      description: 'Surveys, petitions, and consultations arriving in Milestone 8.'
                    })
                  }
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>Civic Participation (M8)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUpcoming({
                      title: 'AI Civic Assistant',
                      milestone: 'Milestone 9',
                      description: 'Intelligent civic navigation guidance arriving in Milestone 9.'
                    })
                  }
                  className="flex items-center gap-2 text-stone-200 hover:text-gold-300 font-medium transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>AI Civic Assistant (M9)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Action Buttons & System Health */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-400 pb-2 mb-4 border-b border-navy-800">
              Citizen Portal & Actions
            </h3>
            
            {/* Dedicated Action Buttons */}
            <div className="flex flex-col gap-2.5 mb-5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-md shadow-sm transition-colors"
                  >
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/reports/new"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-md border border-gold-500/60 shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-gold-400" />
                    <span>Report an Issue (M4)</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-navy-950 font-bold text-xs rounded-md shadow-xs transition-colors text-center"
                    >
                      <LogIn className="w-3.5 h-3.5 text-navy-900" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-md shadow-xs transition-colors text-center"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-navy-950" />
                      <span>Register</span>
                    </Link>
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-md border-b-2 border-gold-500 shadow-xs transition-colors"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-navy-800/80">
              <Link
                to="/status"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-200 border border-navy-700 rounded-md text-xs transition-colors w-full justify-center"
              >
                <Activity className="w-3.5 h-3.5 text-gold-400" />
                <span>View System Status</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Responsible Use Disclaimer */}
        <div className="pt-8 border-t border-navy-800 text-xs text-stone-300 leading-relaxed space-y-3">
          <p>
            <strong className="text-white">Responsible Use Notice:</strong> CivicWatch AI Kenya is an independent civic technology platform created for open community dialogue and transparent public information. It is not a government agency and does not replace emergency response services (e.g. 999 or 112), judicial authorities, law enforcement agencies, or professional legal counsel. In case of immediate physical emergency, please contact local emergency authorities directly.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-stone-300">
            <span>
              &copy; {new Date().getFullYear()} Open Civic Lab (OCL). All rights reserved.
            </span>
            <span className="text-gold-400 font-semibold tracking-wide">
              Innovating Technology for Better Governance • KENYA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
