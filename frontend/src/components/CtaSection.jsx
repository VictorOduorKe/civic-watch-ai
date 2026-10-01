import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CtaSection() {
  const { isAuthenticated } = useAuth();

  function scrollToHowItWorks() {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            BE PART OF THE CIVIC CONVERSATION
          </h2>
          <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8">
            Civic engagement is the bedrock of thriving communities. Explore how CivicWatch AI Kenya connects community voice with transparent civic action.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-base rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
              >
                <span>Go to My Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-base rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Citizen Account</span>
              </Link>
            )}

            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-stone-200 border border-neutral-700 font-semibold text-base rounded focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-stone-300" />
              <span>Learn How It Works</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
