'use client';

import { useTransition } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { toggleSidebarAction } from '@/app/actions/sidebar';

interface Props {
  collapsed: boolean;
}

export function SidebarToggle({ collapsed }: Props) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => {
          toggleSidebarAction(collapsed);
        })
      }
      disabled={pending}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-pressed={collapsed}
      className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-900"
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
