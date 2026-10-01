import React from 'react';
import { Eye, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Human Review Matters',
    description:
      'AI assists with categorizing reports, translating languages, and structuring data, but crucial civic decisions and verifications always require qualified human oversight.'
  },
  {
    icon: ShieldAlert,
    title: 'Reports Are Not Automatic Proof',
    description:
      'A submitted report reflects a citizen concern or public allegation. It serves as an alert for inquiry and does not in itself constitute conclusive evidence or judicial determination.'
  },
  {
    icon: Lock,
    title: 'Privacy and Protection',
    description:
      'Citizen safety is paramount. We collect only what is necessary for public utility and provide safeguards to protect whistleblowers, witnesses, and sensitive community data.'
  },
  {
    icon: AlertTriangle,
    title: 'AI Can Make Mistakes',
    description:
      'Automated summaries and machine-generated information can contain hallucinations or misinterpretations. Critical claims must be verified against source documentation.'
  }
];

export default function ResponsibleTechSection() {
  return (
    <section id="responsible-tech" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded">
            Ethics & Safeguards
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight mt-3">
            Responsible Civic Technology Principles
          </h2>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            Technology should empower citizens without causing harm or misleading communities. CivicWatch AI Kenya adheres to strict civic-tech ethical guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="bg-stone-50 border border-stone-200 rounded-lg p-6 sm:p-7 flex items-start gap-4 hover:border-gold-300 transition-colors"
              >
                <div className="p-3 bg-white border border-stone-200 rounded-md text-navy-900 shadow-2xs shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950 mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {principle.description}
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
