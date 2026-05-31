'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

interface Props {
  orgId: string;
  callId: string;
  active: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Renders a Link that selects this call by setting ?callId=, preserving any
 * other filter/search/sort params already in the URL.
 */
export function CallRowLink({
  orgId,
  callId,
  active,
  className = '',
  children,
}: Props) {
  const sp = useSearchParams();
  const next = new URLSearchParams(sp.toString());
  next.set('callId', callId);
  const href = `/orgs/${orgId}/calls?${next.toString()}`;
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`${className} ${
        active ? 'bg-gray-900/5 hover:bg-gray-900/10' : ''
      }`.trim()}
    >
      {children}
    </Link>
  );
}
