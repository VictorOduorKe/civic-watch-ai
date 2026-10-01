import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

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
    <footer className="bg-navy-950 text-stone-300 text-sm border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Purpose */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={logoImg}
                alt="Open Civic Lab Logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-gold-500 shadow-xs shrink-0"
              />
              <div>
                <span className="block text-base font-black text-white tracking-tight leading-none">
                  CIVICWATCH AI
                </span>
                <span className="block text-[11px] font-semibold text-gold-500 uppercase tracking-wider">
                  Open Civic Lab
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              An independent civic technology initiative developed under <strong>Open Civic Lab (OCL)</strong> to foster transparency, citizen participation, and verified civic dialogue.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-900 border border-gold-500/30 rounded text-[11px] text-gold-300">
              <span className="w-2 h-2 rounded-full bg-gold-500"></span>
              Open Civic Lab Kenya
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection(null)}
                  className="hover:text-gold-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-gold-400 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-gold-400 transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="hover:text-gold-400 transition-colors"
                >
                  About Open Civic Lab
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Roadmap */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Platform Modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/reports/new"
                  className="hover:text-gold-400 transition-colors text-white font-medium"
                >
                  Incident Reporting (M4)
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
                  className="hover:text-gold-400 transition-colors"
                >
                  Civic Alerts (M5)
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
                  className="hover:text-gold-400 transition-colors"
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
                  className="hover:text-gold-400 transition-colors"
                >
                  AI Civic Assistant (M9)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System & Dev Health */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              System Environment
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              CivicWatch AI backend and MySQL database are actively connected.
            </p>
            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-200 border border-navy-700 rounded-lg text-xs transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-gold-400" />
              View System Status
            </Link>
          </div>
        </div>

        {/* Responsible Use Disclaimer */}
        <div className="pt-8 border-t border-navy-800 text-xs text-stone-400 leading-relaxed space-y-3">
          <p>
            <strong>Responsible Use Notice:</strong> CivicWatch AI Kenya is an independent civic technology platform created for open community dialogue and transparent public information. It is not a government agency and does not replace emergency response services (e.g. 999 or 112), judicial authorities, law enforcement agencies, or professional legal counsel. In case of immediate physical emergency, please contact local emergency authorities directly.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-[11px] text-stone-500">
            <span>
              &copy; {new Date().getFullYear()} Open Civic Lab (OCL). All rights reserved.
            </span>
            <span className="text-gold-500 font-medium">Innovating Technology for Better Governance. KENYA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
