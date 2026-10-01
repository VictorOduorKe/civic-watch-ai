import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity } from 'lucide-react';

export default function Footer({ onOpenUpcoming }) {
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
    <footer className="bg-stone-900 text-stone-300 text-sm border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Purpose */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                CIVICWATCH AI KENYA
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              An independent civic technology initiative developed under <strong>Open Civic Lab (OCL)</strong> to foster transparency, citizen participation, and verified civic dialogue.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 border border-stone-700 rounded text-[11px] text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Milestone 1 Active
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection(null)}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="hover:text-white transition-colors"
                >
                  About Open Civic Lab
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Roadmap */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUpcoming({
                      title: 'Incident Reporting',
                      milestone: 'Milestone 4',
                      description: 'Structured community reporting workflow arriving in Milestone 4.'
                    })
                  }
                  className="hover:text-white transition-colors"
                >
                  Reports (M4)
                </button>
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
                  className="hover:text-white transition-colors"
                >
                  Alerts (M5)
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
                  className="hover:text-white transition-colors"
                >
                  Civic Participation (M8)
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
                  className="hover:text-white transition-colors"
                >
                  AI Civic Assistant (M9)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System & Dev Health */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              System Environment
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Milestone 0 technical foundation is actively running with Express & MySQL.
            </p>
            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded text-xs transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              View System Status
            </Link>
          </div>
        </div>

        {/* Responsible Use Disclaimer */}
        <div className="pt-8 border-t border-stone-800 text-xs text-stone-500 leading-relaxed space-y-3">
          <p>
            <strong>Responsible Use Notice:</strong> CivicWatch AI Kenya is an independent civic technology platform created for open community dialogue and transparent public information. It is not a government agency and does not replace emergency response services (e.g. 999 or 112), judicial authorities, law enforcement agencies, or professional legal counsel. In case of immediate physical emergency, please contact local emergency authorities directly.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-[11px] text-stone-600">
            <span>
              &copy; {new Date().getFullYear()} Open Civic Lab (OCL). All rights reserved.
            </span>
            <span>CivicWatch AI Kenya • Milestone 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
