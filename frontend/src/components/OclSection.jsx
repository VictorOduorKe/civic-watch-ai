import React from 'react';
import { Lightbulb, Code2, Users2, ShieldCheck } from 'lucide-react';

const PILLARS = [
  {
    icon: Lightbulb,
    title: 'Civic Innovation',
    description: 'Developing modern digital solutions to solve community-level governance and public-service bottlenecks.'
  },
  {
    icon: Users2,
    title: 'Community Participation',
    description: 'Empowering everyday citizens to voice civic concerns and take an active part in local decision-making.'
  },
  {
    icon: ShieldCheck,
    title: 'Responsible Digital Tools',
    description: 'Pioneering ethical AI deployment that prioritizes privacy, transparent verification, and public trust.'
  },
  {
    icon: Code2,
    title: 'Open Collaboration',
    description: 'Promoting open civic tech practices that encourage peer review, community ownership, and transparency.'
  }
];

export default function OclSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded">
            The Initiative
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            About Open Civic Lab (OCL)
          </h2>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            CivicWatch AI Kenya is an independent civic technology initiative developed under Open Civic Lab (OCL)—a dedicated effort committed to building open digital infrastructure for transparent public accountability and citizen engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-stone-50 border border-stone-200 rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 bg-white border border-stone-200 rounded-md text-emerald-900 w-fit mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {pillar.description}
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
