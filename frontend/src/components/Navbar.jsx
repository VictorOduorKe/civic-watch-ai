import React, { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export default function Navbar({ onOpenUpcoming }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleNavClick(targetId) {
    setMobileMenuOpen(false);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleActionClick(actionType) {
    setMobileMenuOpen(false);
    if (actionType === 'login') {
      onOpenUpcoming({
        title: 'Citizen Authentication',
        milestone: 'Milestone 2',
        description: 'Secure citizen authentication, JWT session handling, and role-based access will be introduced in Milestone 2.'
      });
    } else if (actionType === 'register') {
      onOpenUpcoming({
        title: 'Citizen Registration',
        milestone: 'Milestone 2',
        description: 'Citizen profile creation and verification flows will be introduced in Milestone 2.'
      });
    } else if (actionType === 'reports') {
      onOpenUpcoming({
        title: 'Incident Reporting & Tracking',
        milestone: 'Milestone 4',
        description: 'Structured citizen reporting for public services and community concerns will be introduced in Milestone 4.'
      });
    } else if (actionType === 'alerts') {
      onOpenUpcoming({
        title: 'Civic Alerts System',
        milestone: 'Milestone 5',
        description: 'Targeted civic notifications and public service alerts will be introduced in Milestone 5.'
      });
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick(null)}
              className="flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded p-1"
            >
              <div className="w-9 h-9 rounded bg-emerald-900 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black tracking-tight text-neutral-900 leading-none">
                  CIVICWATCH
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
                  AI Kenya • Open Civic Lab
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavClick(null)}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('reports')}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              Reports
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('alerts')}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              Alerts
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              About
            </button>
          </nav>

          {/* Desktop Right Side CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleActionClick('login')}
              className="px-3.5 py-1.5 text-sm font-semibold text-stone-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('register')}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded text-stone-700 hover:text-neutral-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav aria-label="Mobile Navigation" className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick(null)}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleActionClick('reports')}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            Reports
          </button>
          <button
            type="button"
            onClick={() => handleActionClick('alerts')}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            Alerts
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            About
          </button>

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleActionClick('login')}
              className="w-full text-center px-4 py-2 border border-stone-300 rounded text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('register')}
              className="w-full text-center px-4 py-2 bg-emerald-900 text-white rounded text-sm font-semibold hover:bg-emerald-950"
            >
              Get Started
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
