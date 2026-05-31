import { OrgSwitcher } from './org-switcher';
import { logoutAction } from '@/app/actions/logout';
import type { AuthUser, Org } from '@/lib/types';

interface Props {
  user: AuthUser;
  orgs: Org[];
  currentOrgId: string;
}

function roleLabel(user: AuthUser, currentOrgId: string): string {
  if (user.isPlatformAdmin) return 'admin';
  const m = user.memberships.find((mm) => mm.orgId === currentOrgId);
  return m ? m.role.toLowerCase() : '—';
}

export function Header({ user, orgs, currentOrgId }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <OrgSwitcher orgs={orgs} currentOrgId={currentOrgId} />
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm text-gray-900">{user.email}</span>
          <span className="font-mono text-xs text-gray-500">
            {roleLabel(user, currentOrgId)}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
