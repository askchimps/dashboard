import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ApiError, getMe, listAgents } from '@/lib/api';
import type { Agent } from '@/lib/types';

interface Props {
  params: Promise<{ orgId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AgentsPage({ params }: Props) {
  const { orgId } = await params;

  let me;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  if (!me.isPlatformAdmin) notFound();

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
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Agents</h1>
        <p className="text-sm text-gray-500">
          One org can host multiple agents. Each agent owns its own base
          prompt, analysis prompt, and knowledge base.
        </p>
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
                <th className="px-4 py-2 font-medium">Updated</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900">{a.name}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {a.active ? 'yes' : 'no'}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(a.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/orgs/${orgId}/agents/${a.id}`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                    >
                      Edit →
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
