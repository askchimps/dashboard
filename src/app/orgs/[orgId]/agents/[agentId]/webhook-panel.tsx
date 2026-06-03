'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  url: string;
  secret?: string;
  secretHeaderHint?: string;
  exampleCurl?: string;
  agentId?: string;
}

export function WebhookPanel({
  title,
  description,
  url,
  secret,
  secretHeaderHint,
  exampleCurl,
  agentId,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <Row label="URL" value={url} copyKey="url" onCopy={onCopy} copied={copied} />

      {secret ? (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
            Secret
          </label>
          <div className="mt-1 flex items-stretch gap-2">
            <code className="grow truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
              {revealed ? secret : '•'.repeat(Math.min(secret.length, 32))}
            </code>
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {revealed ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {revealed ? 'Hide' : 'Reveal'}
            </button>
            <button
              type="button"
              onClick={() => onCopy('secret', secret)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copied === 'secret' ? 'Copied' : 'Copy'}
            </button>
          </div>
          {secretHeaderHint ? (
            <p className="mt-1 text-xs text-gray-500">{secretHeaderHint}</p>
          ) : null}
        </div>
      ) : null}

      {exampleCurl ? (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
            Example
          </label>
          <pre className="mt-1 overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-snug text-gray-800">
{exampleCurl}
          </pre>
        </div>
      ) : null}

      {agentId ? (
        <p className="text-xs text-gray-500">
          Agent ID: <code className="font-mono">{agentId}</code>
        </p>
      ) : null}
    </section>
  );
}

function Row({
  label,
  value,
  copyKey,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  copyKey: string;
  onCopy: (label: string, value: string) => void;
  copied: string | null;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="mt-1 flex items-stretch gap-2">
        <code className="grow truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
          {value}
        </code>
        <button
          type="button"
          onClick={() => onCopy(copyKey, value)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied === copyKey ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
