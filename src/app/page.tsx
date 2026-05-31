import { redirect } from 'next/navigation';
import { ApiError, getMe, listOrgs } from '@/lib/api';
import { logoutAction } from './actions/logout';
import type { AuthUser, Org, Role } from '@/lib/types';

function deriveRoleLabel(user: AuthUser): string {
  if (user.isPlatformAdmin) return 'admin (platform)';
  const roles = user.memberships.map((m) => m.role.toLowerCase());
  return roles.length > 0 ? roles.join(', ') : 'no role';
}

function membershipRoleFor(user: AuthUser, orgId: string): Role | null {
  return user.memberships.find((m) => m.orgId === orgId)?.role ?? null;
}

export default async function DashboardPage() {
  let user: AuthUser;
  let orgs: Org[];
  try {
    [user, orgs] = await Promise.all([getMe(), listOrgs()]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirect('/login');
    }
    throw e;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              AskChimps Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Signed in as <span className="font-medium">{user.email}</span> ·
              role: <span className="font-mono">{deriveRoleLabel(user)}</span>
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Current user
          </h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">ID</dt>
            <dd className="font-mono text-gray-900">{user.id}</dd>
            <dt className="text-gray-500">Name</dt>
            <dd className="text-gray-900">{user.name ?? '—'}</dd>
            <dt className="text-gray-500">Platform admin</dt>
            <dd className="text-gray-900">
              {user.isPlatformAdmin ? 'yes' : 'no'}
            </dd>
            <dt className="text-gray-500">Memberships</dt>
            <dd className="text-gray-900">
              {user.memberships.length === 0
                ? '—'
                : user.memberships
                    .map((m) => `${m.role.toLowerCase()}@${m.orgId}`)
                    .join(', ')}
            </dd>
          </dl>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Orgs you can see
            </h2>
            <span className="text-xs text-gray-400">
              admin → all orgs · owner/user → memberships only
            </span>
          </div>
          {orgs.length === 0 ? (
            <p className="text-sm text-gray-500">No orgs visible.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Slug</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Active</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => {
                  const role = user.isPlatformAdmin
                    ? 'admin'
                    : (membershipRoleFor(user, o.id)?.toLowerCase() ?? '—');
                  return (
                    <tr key={o.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{o.name}</td>
                      <td className="py-2 font-mono text-gray-700">{o.slug}</td>
                      <td className="py-2 font-mono text-gray-700">{role}</td>
                      <td className="py-2 text-gray-700">
                        {o.active ? 'yes' : 'no'}
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
