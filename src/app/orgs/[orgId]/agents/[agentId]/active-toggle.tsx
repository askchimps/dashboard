'use client';

import { useState, useTransition } from 'react';
import { toggleActiveAction } from './actions';

interface Props {
  orgId: string;
  agentId: string;
  active: boolean;
}

export function ActiveToggle({ orgId, agentId, active }: Props) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function flip() {
    const next = !on;
    setOn(next);
    setErr(null);
    start(async () => {
      const res = await toggleActiveAction(orgId, agentId, next);
      if ('error' in res) {
        setOn(!next);
        setErr(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={flip}
        disabled={pending}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed ${
          on ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
        aria-pressed={on}
        aria-label="Toggle agent active"
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-700">
        {pending ? 'Saving…' : on ? 'Active' : 'Paused'}
      </span>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  );
}
