import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenUpcoming }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleNavClick(targetId) {
    setMobileMenuOpen(false);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${targetId}`);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleActionClick(actionType) {
    setMobileMenuOpen(false);
    if (actionType === 'reports') {
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

  async function handleLogout() {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  }

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Citizen';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
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
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              onClick={() => handleNavClick(null)}
              className="text-sm font-medium text-stone-700 hover:text-emerald-900 transition-colors focus:outline-none focus:underline"
            >
              Home
            </Link>
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

          {/* Desktop Right Side Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <User className="w-3.5 h-3.5 text-emerald-900" />
                  <span>Welcome, {firstName}</span>
                  <span className="px-1.5 py-0.2 bg-emerald-900 text-white rounded text-[10px]">
                    {user?.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-neutral-900 border border-stone-300 rounded hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-stone-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  Get Started
                </Link>
              </>
            )}
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
          <Link
            to="/"
            onClick={() => handleNavClick(null)}
            className="block w-full text-left px-3 py-2 rounded text-base font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-900"
          >
            Home
          </Link>
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
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 border border-stone-300 rounded text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  My Account ({firstName})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2 bg-stone-900 text-white rounded text-sm font-semibold hover:bg-stone-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 border border-stone-300 rounded text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-emerald-900 text-white rounded text-sm font-semibold hover:bg-emerald-950"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
