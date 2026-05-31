import Link from 'next/link';
import type { Schedule } from '@/lib/types';
import { CancelButton } from './cancel-button';

interface Props {
  orgId: string;
  schedules: Schedule[];
  canCancel: boolean;
}

function statusBadge(status: string) {
  const cls =
    status === 'pending'
      ? 'bg-amber-50 text-amber-700'
      : status === 'done'
        ? 'bg-emerald-50 text-emerald-700'
        : status === 'failed'
          ? 'bg-red-50 text-red-700'
          : 'bg-gray-100 text-gray-600';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function ScheduleTable({ orgId, schedules, canCancel }: Props) {
  if (schedules.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500">
        No upcoming schedules.
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
        <tr>
          <th className="px-4 py-2 font-medium">Scheduled at</th>
          <th className="px-4 py-2 font-medium">Lead</th>
          <th className="px-4 py-2 font-medium">Phone</th>
          <th className="px-4 py-2 font-medium">Attempt</th>
          <th className="px-4 py-2 font-medium">Reason</th>
          <th className="px-4 py-2 font-medium">Status</th>
          <th className="px-4 py-2 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {schedules.map((s) => (
          <tr key={s.id} className="border-t border-gray-100">
            <td className="px-4 py-2 text-gray-900">
              {new Date(s.scheduledAt).toLocaleString()}
            </td>
            <td className="px-4 py-2 text-gray-900">
              <Link
                href={`/orgs/${orgId}/leads?leadId=${s.lead.id}`}
                className="text-gray-900 underline-offset-2 hover:underline"
              >
                {s.lead.name ?? 'Unknown lead'}
              </Link>
            </td>
            <td className="px-4 py-2 font-mono text-gray-700">
              {s.lead.phone ?? '—'}
            </td>
            <td className="px-4 py-2 text-gray-700">#{s.attemptNo}</td>
            <td className="px-4 py-2 font-mono text-xs text-gray-700">
              {s.reason ?? '—'}
            </td>
            <td className="px-4 py-2">{statusBadge(s.status)}</td>
            <td className="px-4 py-2 text-right">
              {canCancel && s.status === 'pending' ? (
                <CancelButton orgId={orgId} scheduleId={s.id} />
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
