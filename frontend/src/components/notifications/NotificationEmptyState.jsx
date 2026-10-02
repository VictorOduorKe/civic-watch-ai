import React from 'react';
import { BellOff } from 'lucide-react';

export default function NotificationEmptyState({ filter = 'all' }) {
  const isUnreadFilter = filter === 'unread';

  return (
    <div className="py-12 px-4 text-center bg-white rounded-xl border border-stone-200">
      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
        <BellOff className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-navy-950 font-serif mb-1">
        {isUnreadFilter ? 'No unread notifications' : "You're all caught up"}
      </h3>
      <p className="text-xs text-stone-500 max-w-sm mx-auto">
        {isUnreadFilter
          ? 'You have read all your notifications. Switch to "All" to review past incident updates.'
          : 'Real platform events such as report confirmations, status updates, and assignments will appear here.'}
      </p>
    </div>
  );
}
