import React from 'react';
import {
  FileText,
  CheckCircle,
  Users,
  Bell,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Report Issues',
    milestone: 'Milestone 4',
    description:
      'Citizens will be able to submit concerns involving public services, infrastructure, safety, environmental issues, and other civic matters with structured details.'
  },
  {
    icon: CheckCircle,
    title: 'Verify Information',
    milestone: 'Milestone 7',
    description:
      'Users will be able to submit claims or civic information for structured multi-source verification and clear community context.'
  },
  {
    icon: Users,
    title: 'Civic Participation',
    milestone: 'Milestone 8',
    description:
      'Engage in civic consultations, citizen surveys, structured community dialogues, and petitions on issues affecting your locality.'
  },
  {
    icon: Bell,
    title: 'Civic Alerts',
    milestone: 'Milestone 5',
    description:
      'Receive timely public-service advisories, community safety notices, road advisories, and civic announcements relevant to your area.'
  },
  {
    icon: HelpCircle,
    title: 'AI Civic Assistant',
    milestone: 'Milestone 9',
    description:
      'Accessible, multilingual civic guidance powered by responsible AI to help citizens understand public procedures and navigate civic rights.'
  },
  {
    icon: TrendingUp,
    title: 'Track Issues',
    milestone: 'Milestone 4',
    description:
      'Follow the lifecycle and status updates of community reports transparently from initial submission through community review.'
  }
];

export default function FeaturesSection({ onOpenUpcoming }) {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight mt-3">
            Core Civic Capabilities Planned for Kenya
          </h2>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            CivicWatch AI Kenya brings together reporting, verified information, civic notices, and public participation within one open, accessible ecosystem.
          </p>
        </div>

        {/* Feature Cards Grid (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-stone-50 border border-stone-200 rounded-lg p-6 flex flex-col justify-between hover:border-gold-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white border border-stone-200 rounded-md text-navy-900 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/70 px-2 py-0.5 rounded">
                      {feat.milestone}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-950 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUpcoming({
                        title: feat.title,
                        milestone: feat.milestone,
                        description: feat.description
                      })
                    }
                    className="text-xs font-bold text-navy-900 hover:text-gold-600 inline-flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    View roadmap details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
