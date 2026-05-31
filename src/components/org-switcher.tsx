'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { Org } from '@/lib/types';

interface Props {
  orgs: Org[];
  currentOrgId: string;
}

export function OrgSwitcher({ orgs, currentOrgId }: Props) {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = orgs.find((o) => o.id === currentOrgId);

  const onPick = (orgId: string) => {
    setOpen(false);
    // Preserve current section: replace :orgId in URL.
    // If the path doesn't match the orgs/[orgId]/... shape, fall back to dashboard.
    const path =
      typeof window !== 'undefined'
        ? window.location.pathname.replace(
            /^\/orgs\/[^/]+/,
            `/orgs/${orgId}`,
          )
        : `/orgs/${orgId}/dashboard`;
    router.push(path.startsWith('/orgs/') ? path : `/orgs/${orgId}/dashboard`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-900"
      >
        <span className="font-medium">{current?.name ?? 'Pick org'}</span>
        {current ? (
          <span className="font-mono text-xs text-gray-500">
            {current.slug}
          </span>
        ) : null}
        <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 max-h-72 w-72 overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {orgs.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">No orgs available</li>
          ) : (
            orgs.map((o) => {
              const isCurrent = o.id === currentOrgId;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => onPick(o.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-900">{o.name}</span>
                      <span className="font-mono text-xs text-gray-500">
                        {o.slug}
                      </span>
                    </div>
                    {isCurrent ? (
                      <Check
                        className="h-4 w-4 text-gray-900"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
