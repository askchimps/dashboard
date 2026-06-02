'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import type { Webhook } from '@/lib/types';
import { deleteWebhookAction, toggleWebhookAction } from './actions';

export function WebhookRow({ orgId, hook }: { orgId: string; hook: Webhook }) {
  const [pending, start] = useTransition();
  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2 font-mono text-xs text-gray-700 break-all">{hook.url}</td>
      <td className="px-3 py-2 text-xs">{hook.events.join(', ')}</td>
      <td className="px-3 py-2 text-xs">
        {hook.buckets.length === 0 ? (
          <span className="text-gray-400">all</span>
        ) : (
          hook.buckets.join(', ')
        )}
      </td>
      <td className="px-3 py-2 text-xs">
        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            checked={hook.active}
            disabled={pending}
            onChange={(e) =>
              start(() => toggleWebhookAction(orgId, hook.id, e.target.checked))
            }
          />
          {hook.active ? 'On' : 'Off'}
        </label>
      </td>
      <td className="px-3 py-2 text-xs">
        <Link
          href={`/orgs/${orgId}/settings/webhooks/${hook.id}/deliveries`}
          className="text-gray-700 underline"
        >
          Deliveries
        </Link>
        {' · '}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm('Delete this webhook? Past deliveries are also removed.')) {
              start(() => deleteWebhookAction(orgId, hook.id));
            }
          }}
          className="text-red-700 underline disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
