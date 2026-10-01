import React from 'react';

/**
 * Reusable Empty State component adhering to honest civic tech design.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  badgeText
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-300 rounded-lg bg-stone-50/60">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}

      {badgeText && (
        <span className="mb-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-200 text-stone-700">
          {badgeText}
        </span>
      )}

      <h3 className="text-sm font-bold text-neutral-900 mb-1">
        {title}
      </h3>

      <p className="text-xs text-stone-600 max-w-sm leading-relaxed mb-4">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-semibold rounded bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-2xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
