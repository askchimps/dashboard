'use client';

import { useState, type ReactNode } from 'react';

interface Props {
  transcript: ReactNode;
  details: ReactNode;
}

type TabKey = 'transcript' | 'details';

export function CallTabs({ transcript, details }: Props) {
  const [tab, setTab] = useState<TabKey>('transcript');
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'transcript', label: 'Transcript' },
    { key: 'details', label: 'Details' },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Call sections"
        className="flex shrink-0 gap-1 border-b border-gray-200 px-5"
      >
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === 'transcript' ? transcript : details}
      </div>
    </div>
  );
}
