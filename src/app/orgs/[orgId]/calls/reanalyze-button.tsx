'use client';

import { useTransition } from 'react';
import { reanalyzeCallAction } from './reanalyze-action';

export function ReanalyzeButton({
  orgId,
  callId,
  disabled,
}: {
  orgId: string;
  callId: string;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() => start(() => reanalyzeCallAction(orgId, callId))}
      className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Re-analysing…' : 'Re-analyse'}
    </button>
  );
}
