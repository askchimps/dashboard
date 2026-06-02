import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ApiError, getMe, listWebhooks } from '@/lib/api';
import { WebhookForm } from './webhook-form';
import { WebhookRow } from './webhook-row';
import { SecretBanner } from './secret-banner';

interface Props {
  params: Promise<{ orgId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function WebhooksPage({ params }: Props) {
  const { orgId } = await params;

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

  const hooks = await listWebhooks(orgId);
  const jar = await cookies();
  const secretCookie = jar.get('askchimps_webhook_secret');
  let secretReveal: { id: string; secret: string } | null = null;
  if (secretCookie) {
    try {
      secretReveal = JSON.parse(secretCookie.value);
    } catch {
      secretReveal = null;
    }
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Webhooks</h1>
        <p className="text-sm text-gray-500">
          POST destinations fired after each call analysis. Payload is
          HMAC-SHA256 signed; verify with the secret shown once on create.
        </p>
      </header>

      {secretReveal ? <SecretBanner secret={secretReveal.secret} /> : null}

      <WebhookForm orgId={orgId} />

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Events</th>
              <th className="px-3 py-2">Buckets</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hooks.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-gray-400"
                >
                  No webhooks yet.
                </td>
              </tr>
            ) : (
              hooks.map((h) => <WebhookRow key={h.id} orgId={orgId} hook={h} />)
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
