import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ApiError, getMe, listAgents } from '@/lib/api';
import type { Agent, AuthUser } from '@/lib/types';

interface Props {
  params: Promise<{ orgId: string }>;
}

export const dynamic = 'force-dynamic';

function canSeeAgents(me: AuthUser, orgId: string): boolean {
  if (me.isPlatformAdmin) return true;
  return me.memberships.some((m) => m.orgId === orgId);
}

export default async function AgentsPage({ params }: Props) {
  const { orgId } = await params;

  let me: AuthUser;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  if (!canSeeAgents(me, orgId)) notFound();

  let agents: Agent[];
  try {
    agents = await listAgents(orgId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      notFound();
    }
    throw e;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500">
            {me.isPlatformAdmin
              ? 'Each agent has a name, a voice agent ID, and an analysis prompt. Owners copy the lead ingestion URL into their CRM.'
              : 'Active agents available to this org. Click an agent to see its lead-ingestion URL.'}
          </p>
        </div>
        {me.isPlatformAdmin ? (
          <Link
            href={`/orgs/${orgId}/agents/new`}
            className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            New agent
          </Link>
        ) : null}
      </header>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {agents.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No agents yet for this org.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Active</th>
                <th className="px-4 py-2 font-medium">Ingest code</th>
                <th className="px-4 py-2 font-medium">Updated</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900">{a.name}</td>
                  <td className="px-4 py-2 text-gray-700">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {a.active ? 'on' : 'off'}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">
                    {a.ingestCode}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(a.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/orgs/${orgId}/agents/${a.id}`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
