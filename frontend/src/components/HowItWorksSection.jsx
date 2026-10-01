import React from 'react';
import { MessageSquarePlus, Cpu, UserCheck, BellRing } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: MessageSquarePlus,
    title: 'Speak Up',
    subtitle: 'Citizen Input',
    description:
      'A citizen identifies a community concern—such as damaged water infrastructure, road hazards, or health services—or chooses to participate in an active public consultation.'
  },
  {
    number: '02',
    icon: Cpu,
    title: 'CivicWatch Processes',
    subtitle: 'Structured Workflow',
    description:
      'The platform categorizes the issue, structures geolocation data, checks for duplicate reports, and prepares the civic dossier for transparent community review.'
  },
  {
    number: '03',
    icon: UserCheck,
    title: 'Review & Action',
    subtitle: 'Responsible Oversight',
    description:
      'Relevant community stakeholders, civil society observers, or authorized service providers review the verified submission and determine practical follow-up steps.'
  },
  {
    number: '04',
    icon: BellRing,
    title: 'Stay Informed',
    subtitle: 'Closed Feedback Loop',
    description:
      'Citizens follow real-time progress updates, subscribe to location-based civic alerts, and see transparent resolutions documented on the public registry.'
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded">
            The Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight mt-3">
            How CivicWatch Operates
          </h2>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            A clear, transparent lifecycle from a citizen raising their voice to community visibility and follow-up.
          </p>
        </div>

        {/* 4-Step Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white border border-stone-200 rounded-lg p-6 relative flex flex-col justify-between hover:border-gold-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-gold-500 tracking-tight">
                      {step.number}
                    </span>
                    <div className="p-2 bg-navy-50 rounded-md text-navy-900 border border-gold-200/60">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                    {step.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-navy-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-stone-100 text-xs font-medium text-stone-400">
                  Step {step.number} of 04
                </div>
              </div>
            );
          })}
        </div>

        {/* Important boundary note */}
        <div className="mt-10 p-4 bg-stone-100 border border-stone-300 rounded text-xs text-stone-700 leading-relaxed max-w-4xl">
          <strong className="font-semibold text-neutral-900">Please note: </strong>
          CivicWatch facilitates transparent civic engagement and structured information routing. It does not replace constitutional statutory authorities, law enforcement, or emergency services, nor does it guarantee automatic government intervention.
        </div>
      </div>
    </section>
  );
}
