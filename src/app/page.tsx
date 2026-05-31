import { redirect } from 'next/navigation';
import { ApiError, getMe, listOrgs } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function RootRedirect() {
  let firstOrgId: string | undefined;
  try {
    const [user, orgs] = await Promise.all([getMe(), listOrgs()]);
    // Admin: pick first org in the system. Owner/User: pick first membership.
    if (user.isPlatformAdmin) {
      firstOrgId = orgs[0]?.id;
    } else {
      firstOrgId = user.memberships[0]?.orgId ?? orgs[0]?.id;
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirect('/login');
    }
    throw e;
  }
  if (!firstOrgId) {
    redirect('/login');
  }
  redirect(`/orgs/${firstOrgId}/dashboard`);
}
