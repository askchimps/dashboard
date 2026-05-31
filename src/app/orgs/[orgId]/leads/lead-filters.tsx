'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import type { LeadListQuery, LeadSort } from '@/lib/types';

const SORT_OPTIONS: { value: LeadSort; label: string }[] = [
  { value: 'recent', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name A→Z' },
  { value: 'name_desc', label: 'Name Z→A' },
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'disqualified', label: 'Disqualified' },
  { value: 'no_pickup', label: 'No pickup' },
];

const SOURCES = [
  { value: '', label: 'All sources' },
  { value: 'meta_ads', label: 'Meta ads' },
  { value: 'google_search', label: 'Google search' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referral' },
];

interface Props {
  orgId: string;
  filters: LeadListQuery;
}

export function LeadFilters({ orgId, filters }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q ?? '');

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q.trim()) next.set('q', q.trim());
      else next.delete('q');
      next.delete('leadId');
      startTransition(() => {
        router.replace(`/orgs/${orgId}/leads?${next.toString()}`, {
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
    next.delete('leadId');
    startTransition(() => {
      router.replace(`/orgs/${orgId}/leads?${next.toString()}`, {
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
          aria-label="Search leads"
        />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <select
          value={filters.status ?? ''}
          onChange={(e) => updateParam('status', e.target.value)}
          className={baseSelect}
          aria-label="Status filter"
        >
          {STATUSES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.source ?? ''}
          onChange={(e) => updateParam('source', e.target.value)}
          className={baseSelect}
          aria-label="Source filter"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
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
