import {
  Bot,
  CalendarClock,
  LayoutDashboard,
  PhoneCall,
  Settings,
  Users,
} from 'lucide-react';
import { SidebarToggle } from './sidebar-toggle';
import { NavLink } from './nav-link';
import type { AuthUser } from '@/lib/types';

interface Props {
  orgId: string;
  collapsed: boolean;
  user: AuthUser;
}

function hasOwnerOrAdmin(user: AuthUser, orgId: string): boolean {
  if (user.isPlatformAdmin) return true;
  return user.memberships.some(
    (m) => m.orgId === orgId && m.role === 'OWNER',
  );
}

export function Sidebar({ orgId, collapsed, user }: Props) {
  const items = [
    {
      href: `/orgs/${orgId}/dashboard`,
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
      show: true,
    },
    {
      href: `/orgs/${orgId}/leads`,
      label: 'Leads',
      icon: <Users className="h-4 w-4" aria-hidden="true" />,
      show: true,
    },
    {
      href: `/orgs/${orgId}/calls`,
      label: 'Calls',
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      show: true,
    },
    {
      href: `/orgs/${orgId}/schedule`,
      label: 'Schedule',
      icon: <CalendarClock className="h-4 w-4" aria-hidden="true" />,
      show: true,
    },
    {
      href: `/orgs/${orgId}/agents`,
      label: 'Agent',
      icon: <Bot className="h-4 w-4" aria-hidden="true" />,
      show: hasOwnerOrAdmin(user, orgId),
    },
    {
      href: `/orgs/${orgId}/settings`,
      label: 'Settings',
      icon: <Settings className="h-4 w-4" aria-hidden="true" />,
      show: hasOwnerOrAdmin(user, orgId),
    },
  ];

  const visible = items.filter((it) => it.show);

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
