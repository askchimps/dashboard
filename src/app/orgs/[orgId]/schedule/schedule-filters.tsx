'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

interface Props {
  orgId: string;
  q: string;
}

export function ScheduleFilters({ orgId, q: initial }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initial);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const handle = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q.trim()) next.set('q', q.trim());
      else next.delete('q');
      startTransition(() => {
        router.replace(`/orgs/${orgId}/schedule?${next.toString()}`, {
          scroll: false,
        });
      });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="relative max-w-md">
      <Search
        className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by lead name, phone, or id"
        className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        aria-label="Search schedules"
      />
      {pending ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide text-gray-400">
          Updating…
        </span>
      ) : null}
    </div>
  );
}
