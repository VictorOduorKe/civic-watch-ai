import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';
import { getWorkspacePath, getWorkspaceLabel } from '../utils/roleUtils';

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
      if (isAuthenticated) {
        navigate('/reports/new');
      } else {
        navigate('/login', { state: { from: { pathname: '/reports/new' } } });
      }
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
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title with Official OCL Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-navy-800 rounded-lg p-1"
            >
              <img
                src={logoImg}
                alt="Open Civic Lab Logo"
                className="w-9 h-9 rounded-full object-cover border-2 border-gold-500 shadow-xs shrink-0"
              />
              <div>
                <span className="block text-base sm:text-lg font-black tracking-tight text-navy-900 leading-none">
                  CIVICWATCH
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gold-600">
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
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('reports')}
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              Report an Issue
            </button>
            <button
              type="button"
              onClick={() => handleActionClick('alerts')}
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              Alerts
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-sm font-medium text-stone-700 hover:text-navy-900 transition-colors focus:outline-none focus:underline"
            >
              About OCL
            </button>
          </nav>

          {/* Desktop Right Side Auth Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={getWorkspacePath(user?.role)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-navy-800" />
                  <span>{firstName}</span>
                  <span className="px-1.5 py-0.5 bg-gold-500 text-navy-950 font-bold rounded text-[10px]">
                    {user?.role}
                  </span>
                </Link>
                <Link
                  to="/reports/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-navy-900 hover:bg-navy-950 rounded-lg transition-colors border-b-2 border-gold-500 shadow-xs"
                >
                  Get Started
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-neutral-900 border border-stone-300 rounded-lg hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-navy-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs sm:text-sm font-bold text-navy-900 bg-white hover:bg-navy-50 border-2 border-navy-900 rounded-lg transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-navy-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs sm:text-sm font-bold text-navy-950 bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors shadow-2xs border border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  Register
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-navy-900 hover:bg-navy-950 rounded-lg transition-colors border-b-2 border-gold-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-navy-800"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-stone-700 hover:text-navy-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-800"
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
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleActionClick('reports')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            Report an Issue
          </button>
          <button
            type="button"
            onClick={() => handleActionClick('alerts')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            Alerts
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-navy-50 hover:text-navy-900"
          >
            About OCL
          </button>

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to={getWorkspacePath(user?.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 border border-navy-200 bg-navy-50 rounded-lg text-sm font-bold text-navy-900 hover:bg-navy-100"
                >
                  {getWorkspaceLabel(user?.role)} ({firstName})
                </Link>
                <Link
                  to="/reports/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-bold hover:bg-navy-950 border-b-2 border-gold-500 shadow-xs"
                >
                  Get Started (Report Issue)
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-sm font-semibold hover:bg-stone-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 border-2 border-navy-900 bg-white rounded-lg text-sm font-bold text-navy-900 hover:bg-navy-50 shadow-2xs"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-gold-500 text-navy-950 rounded-lg text-sm font-bold hover:bg-gold-600 border border-gold-600 shadow-2xs"
                >
                  Register
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-bold hover:bg-navy-950 border-b-2 border-gold-500 shadow-xs"
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
