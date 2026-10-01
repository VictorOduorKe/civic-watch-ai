import React from 'react';
import { Lightbulb, Code2, Users2, ShieldCheck, Compass } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

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
        {/* Banner with Official Emblem */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 bg-navy-50 border border-navy-200 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-900 bg-gold-200 border border-gold-400/50 px-2.5 py-1 rounded-md">
              The Initiative
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3">
              About Open Civic Lab (OCL)
            </h2>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gold-600 mt-1">
              Innovating Technology for Better Governance • KENYA
            </p>
            <p className="text-base text-stone-700 mt-3 leading-relaxed">
              CivicWatch AI Kenya is an independent civic technology initiative developed under <strong>Open Civic Lab (OCL)</strong>—a dedicated effort committed to building open digital infrastructure for transparent public accountability and citizen engagement across Kenya's 47 counties.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Open Civic Lab Logo"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-md border-4 border-gold-500 bg-white"
            />
          </div>
        </div>

        {/* Four Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col justify-between hover:border-navy-300 transition-colors shadow-xs"
              >
                <div>
                  <div className="p-2.5 bg-white border border-navy-100 rounded-lg text-navy-900 w-fit mb-4 shadow-xs">
                    <Icon className="w-5 h-5 text-navy-900" />
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">
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
