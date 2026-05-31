import { notFound, redirect } from 'next/navigation';
import { ApiError, getMe, listOrgs } from '@/lib/api';
import { getSidebarCollapsed } from '@/lib/sidebar';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export const dynamic = 'force-dynamic';

interface Props {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: Props) {
  const { orgId } = await params;

  let user, orgs;
  try {
    [user, orgs] = await Promise.all([getMe(), listOrgs()]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirect('/login');
    }
    throw e;
  }

  const hasAccess =
    user.isPlatformAdmin ||
    user.memberships.some((m) => m.orgId === orgId);
  if (!hasAccess) {
    notFound();
  }

  // The actor's "visible orgs" set powers the switcher.
  const visibleOrgs = user.isPlatformAdmin
    ? orgs
    : orgs.filter((o) => user.memberships.some((m) => m.orgId === o.id));

  const collapsed = await getSidebarCollapsed();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header user={user} orgs={visibleOrgs} currentOrgId={orgId} />
      <div className="flex min-h-0 flex-1">
        <Sidebar orgId={orgId} collapsed={collapsed} user={user} />
        <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
