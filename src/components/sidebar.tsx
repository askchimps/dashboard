import { Bot, LayoutDashboard, PhoneCall } from 'lucide-react';
import { SidebarToggle } from './sidebar-toggle';
import { NavLink } from './nav-link';
import type { AuthUser } from '@/lib/types';

interface Props {
  orgId: string;
  collapsed: boolean;
  user: AuthUser;
}

export function Sidebar({ orgId, collapsed, user }: Props) {
  const items = [
    {
      href: `/orgs/${orgId}/dashboard`,
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
      adminOnly: false,
    },
    {
      href: `/orgs/${orgId}/calls`,
      label: 'Calls',
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      adminOnly: false,
    },
    {
      href: `/orgs/${orgId}/agents`,
      label: 'Agent',
      icon: <Bot className="h-4 w-4" aria-hidden="true" />,
      adminOnly: true,
    },
  ];

  const visible = items.filter((it) => !it.adminOnly || user.isPlatformAdmin);

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-56'} flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all`}
      aria-label="Primary"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3">
        {collapsed ? null : (
          <span className="text-sm font-semibold text-gray-900">AskChimps</span>
        )}
        <SidebarToggle collapsed={collapsed} />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {visible.map((it) => (
          <NavLink
            key={it.href}
            href={it.href}
            label={it.label}
            icon={it.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
