'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface Props {
  href: string;
  label: string;
  icon: ReactNode;
  collapsed: boolean;
}

export function NavLink({ href, label, icon, collapsed }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      title={label}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-gray-900 text-white hover:bg-gray-800'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      {collapsed ? null : <span>{label}</span>}
    </Link>
  );
}
