'use client';

import { useTransition } from 'react';
import { cancelScheduleAction } from './actions';

interface Props {
  orgId: string;
  scheduleId: string;
}

export function CancelButton({ orgId, scheduleId }: Props) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          cancelScheduleAction(orgId, scheduleId);
        });
      }}
      disabled={pending}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Cancelling…' : 'Cancel'}
    </button>
  );
}
