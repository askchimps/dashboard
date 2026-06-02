import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ApiError, getMe, listDeliveries } from '@/lib/api';

interface Props {
  params: Promise<{ orgId: string; id: string }>;
  searchParams: Promise<{ cursor?: string }>;
}

export const dynamic = 'force-dynamic';

const PILL: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-50 text-red-700',
  dead: 'bg-red-100 text-red-800',
};

export default async function DeliveriesPage({ params, searchParams }: Props) {
  const { orgId, id } = await params;
  const sp = await searchParams;

  let me;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  const canEdit =
    me.isPlatformAdmin ||
    me.memberships.some((m) => m.orgId === orgId && m.role === 'OWNER');
  if (!canEdit) notFound();

  const page = await listDeliveries(orgId, id, { cursor: sp.cursor, limit: 25 });

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Deliveries</h1>
          <p className="text-sm text-gray-500">
            Recent webhook delivery attempts (most recent first).
          </p>
        </div>
        <Link
          href={`/orgs/${orgId}/settings/webhooks`}
          className="text-sm text-gray-700 underline"
        >
          ← Back to webhooks
        </Link>
      </header>
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Call</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Attempts</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Last error</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-sm text-gray-400"
                >
                  No deliveries yet.
                </td>
              </tr>
            ) : (
              page.items.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <Link
                      href={`/orgs/${orgId}/calls?callId=${d.callId}`}
                      className="font-mono text-xs underline"
                    >
                      {d.callId.slice(0, 10)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${PILL[d.status] ?? ''}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{d.attempts}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">{d.responseCode ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 break-all">
                    {d.lastError ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {page.nextCursor ? (
        <div className="text-right">
          <Link
            href={`?cursor=${encodeURIComponent(page.nextCursor)}`}
            className="text-sm text-gray-700 underline"
          >
            Next →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
