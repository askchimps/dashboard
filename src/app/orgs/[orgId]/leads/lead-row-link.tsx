'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

interface Props {
  orgId: string;
  leadId: string;
  active: boolean;
  className?: string;
  children: ReactNode;
}

export function LeadRowLink({
  orgId,
  leadId,
  active,
  className = '',
  children,
}: Props) {
  const sp = useSearchParams();
  const next = new URLSearchParams(sp.toString());
  next.set('leadId', leadId);
  const href = `/orgs/${orgId}/leads?${next.toString()}`;
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
