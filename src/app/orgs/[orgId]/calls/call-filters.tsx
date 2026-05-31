'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { CallListQuery, CallSort } from '@/lib/types';

const SORT_OPTIONS: { value: CallSort; label: string }[] = [
  { value: 'recent', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'score_desc', label: 'Score (high)' },
  { value: 'score_asc', label: 'Score (low)' },
  { value: 'duration_desc', label: 'Longest duration' },
];

const OUTCOMES = [
  { value: '', label: 'All outcomes' },
  { value: 'answered_complete', label: 'Answered (complete)' },
  { value: 'answered_partial', label: 'Answered (partial)' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'no_pickup', label: 'No pickup' },
  { value: 'busy', label: 'Busy' },
  { value: 'hostile_junk', label: 'Hostile / junk' },
];

const BUCKETS = [
  { value: '', label: 'All buckets' },
  { value: 'high', label: 'High intent' },
  { value: 'med', label: 'Med intent' },
  { value: 'low', label: 'Low intent' },
];

interface Props {
  orgId: string;
  filters: CallListQuery;
}

export function CallFilters({ orgId, filters }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q ?? '');
  const mountedRef = useRef(false);

  // Debounce search input -> URL. Skip the first render so opening a deep
  // link with ?callId= doesn't trigger a replace that strips callId.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const handle = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q.trim()) next.set('q', q.trim());
      else next.delete('q');
      // Reset selected call when search changes — let server pick first.
      next.delete('callId');
      startTransition(() => {
        router.replace(`/orgs/${orgId}/calls?${next.toString()}`, {
          scroll: false,
        });
      });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('callId');
    startTransition(() => {
      router.replace(`/orgs/${orgId}/calls?${next.toString()}`, {
        scroll: false,
      });
    });
  };

  const baseSelect =
    'rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or phone"
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-7 pr-2 text-xs text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          aria-label="Search calls"
        />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <select
          value={filters.outcome ?? ''}
          onChange={(e) => updateParam('outcome', e.target.value)}
          className={baseSelect}
          aria-label="Outcome filter"
        >
          {OUTCOMES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.bucket ?? ''}
          onChange={(e) => updateParam('bucket', e.target.value)}
          className={baseSelect}
          aria-label="Bucket filter"
        >
          {BUCKETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          value={filters.sort ?? 'recent'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className={baseSelect}
          aria-label="Sort"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {pending ? (
        <p className="text-[10px] uppercase tracking-wide text-gray-400">
          Updating…
        </p>
      ) : null}
    </div>
  );
}
