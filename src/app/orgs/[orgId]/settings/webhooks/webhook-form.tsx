'use client';

import { useState, useTransition } from 'react';
import { createWebhookAction } from './actions';

const ALL_BUCKETS = ['high', 'med', 'low', 'disqualified'] as const;

export function WebhookForm({ orgId }: { orgId: string }) {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) =>
        start(async () => {
          fd.set('buckets', buckets.join(','));
          await createWebhookAction(orgId, fd);
        })
      }
      className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700" htmlFor="webhook-url">
          URL
        </label>
        <input
          id="webhook-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com/hook"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <span className="block text-xs font-medium text-gray-700">
          Event
        </span>
        <span className="mt-1 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
          call.analyzed
        </span>
      </div>
      <div>
        <span className="block text-xs font-medium text-gray-700">
          Buckets (empty = all)
        </span>
        <div className="mt-1 flex flex-wrap gap-3">
          {ALL_BUCKETS.map((b) => (
            <label key={b} className="inline-flex items-center gap-1 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={buckets.includes(b)}
                onChange={(e) =>
                  setBuckets((prev) =>
                    e.target.checked ? [...prev, b] : prev.filter((x) => x !== b),
                  )
                }
              />
              {b}
            </label>
          ))}
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="active" defaultChecked /> Active
      </label>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create webhook'}
        </button>
      </div>
    </form>
  );
}
