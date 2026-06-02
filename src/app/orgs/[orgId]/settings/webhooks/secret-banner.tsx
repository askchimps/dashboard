'use client';

import { useState, useTransition } from 'react';
import { dismissSecretAction } from './actions';

export function SecretBanner({ secret }: { secret: string }) {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pending, start] = useTransition();
  if (dismissed) return null;
  return (
    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
      <p className="font-medium text-amber-900">
        Webhook secret — copy now, it won&apos;t be shown again.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="block w-full break-all rounded bg-white px-2 py-1 font-mono text-xs">
          {secret}
        </code>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(secret);
            setCopied(true);
          }}
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs hover:bg-amber-100"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await dismissSecretAction();
              setDismissed(true);
            })
          }
          className="text-xs text-amber-900 underline disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
