import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * Quick Action Card for citizen workspace actions.
 */
export default function QuickActionCard({
  title,
  description,
  milestone,
  icon: Icon,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative bg-white border border-stone-200 rounded-lg p-5 shadow-xs hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white flex items-center justify-center transition-colors">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
            {milestone}
          </span>
        </div>

        <h4 className="text-base font-bold text-neutral-900 group-hover:text-emerald-950 transition-colors">
          {title}
        </h4>
        <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
        <span>Preview workflow</span>
        <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </div>
  );
}
