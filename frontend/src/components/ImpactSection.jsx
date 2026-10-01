import React from 'react';
import { Network, Database, BookOpen, Share2 } from 'lucide-react';

const IMPACT_POINTS = [
  {
    icon: BookOpen,
    title: 'Accessible Civic Information',
    description:
      'Making public information, constitutional rights, and public-service procedures clear and readily understandable for everyday Kenyans.'
  },
  {
    icon: Database,
    title: 'Transparent Issue Tracking',
    description:
      'Providing an open, verifiable audit trail for reported community concerns so issues are not lost in bureaucratic obscurity.'
  },
  {
    icon: Share2,
    title: 'Stronger Community Engagement',
    description:
      'Fostering informed neighborhood participation through verifiable civic dialogue, constructive consultations, and community advocacy.'
  },
  {
    icon: Network,
    title: 'Bridging Citizens & Civil Society',
    description:
      'Facilitating direct, actionable communication channels between local communities, authorized oversight institutions, and civil organizations.'
  }
];

export default function ImpactSection() {
  return (
    <section id="impact" className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded">
            Our Purpose
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            Why CivicWatch Matters for Kenya
          </h2>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            Strengthening public accountability, bridging the gap between community voices and public service providers, and promoting constructive participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {IMPACT_POINTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-stone-200 rounded-lg p-6 sm:p-7 flex items-start gap-4"
              >
                <div className="p-3 bg-stone-100 rounded-md text-emerald-900 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
