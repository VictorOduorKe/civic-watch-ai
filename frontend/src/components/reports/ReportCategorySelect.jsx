import React from 'react';
import {
  Wrench,
  Zap,
  AlertTriangle,
  ShieldAlert,
  UserX,
  Pill,
  Leaf,
  HeartPulse,
  Scale,
  Flame,
  FileQuestion,
  HelpCircle
} from 'lucide-react';

// Semantic icon mapping for categories
const CATEGORY_ICONS = {
  Infrastructure: Wrench,
  'Public Services': Zap,
  'Corruption Concern': Scale,
  'Safety Concern': ShieldAlert,
  'Missing Person': UserX,
  'Drug Activity': Pill,
  'Environmental Issue': Leaf,
  'Public Health': HeartPulse,
  'Human Rights Concern': AlertTriangle,
  Emergency: Flame,
  Misinformation: FileQuestion,
  Other: HelpCircle
};

export default function ReportCategorySelect({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  loading = false,
  error = null
}) {
  if (loading) {
    return (
      <div className="py-8 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading official incident categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isSelected = Number(selectedCategoryId) === Number(cat.id);
          const IconComponent = CATEGORY_ICONS[cat.name] || HelpCircle;

          return (
            <div
              key={cat.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onSelectCategory(cat.id);
                }
              }}
              className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-800 ring-2 ring-emerald-800/20 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-900 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      {cat.name}
                    </span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-800'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
