import React from 'react';
import { Info, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

/**
 * Educational & Guidance card explaining CivicWatch AI Kenya citizen capabilities.
 */
export default function CivicInfoCard() {
  const capabilities = [
    {
      title: 'Raise civic concerns',
      status: 'M4 (Next Milestone)',
      available: false,
      desc: 'Submit geo-tagged community issues with photo/video evidence.'
    },
    {
      title: 'Follow issues you submit',
      status: 'M5',
      available: false,
      desc: 'Real-time timeline tracking and official agency response status.'
    },
    {
      title: 'Access civic knowledge & AI verification',
      status: 'M9',
      available: false,
      desc: 'Fact-check public claims and inspect Kenyan constitutional rights.'
    },
    {
      title: 'Participate in consultations & petitions',
      status: 'M10',
      available: false,
      desc: 'Join community petitions and county public participation drives.'
    },
    {
      title: 'Receive county-level public alerts',
      status: 'M11',
      available: false,
      desc: 'Emergency notifications and service outage updates for your county.'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
          <Info className="w-4 h-4 text-emerald-900" />
          <h3 className="text-sm font-bold text-neutral-900">
            How CivicWatch AI Empowers You
          </h3>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          CivicWatch AI Kenya is an independent, non-partisan platform developed by <strong className="text-neutral-900">Open Civic Lab (OCL)</strong> to bridge the accountability gap between citizens and public institutions.
        </p>

        <div className="space-y-3">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-neutral-900 truncate">
                    {cap.title}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                    {cap.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span>Open Civic Lab Kenya • Data Protection Act Compliant</span>
        <a
          href="https://openciviclab.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-emerald-900 hover:text-emerald-950"
        >
          <span>Learn more</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
