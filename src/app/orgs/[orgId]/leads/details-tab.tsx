import type { LeadDetail } from '@/lib/types';
import { formatDateTime } from '../calls/format';

interface Props {
  lead: LeadDetail;
}

function statusBadge(status: string) {
  const cls =
    status === 'qualified'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'disqualified'
        ? 'bg-red-50 text-red-700'
        : status === 'no_pickup'
          ? 'bg-gray-100 text-gray-600'
          : 'bg-amber-50 text-amber-700';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function DetailsTab({ lead }: Props) {
  const totalCalls = lead.calls.length;
  const completedCalls = lead.calls.filter((c) =>
    c.outcome?.startsWith('answered'),
  ).length;
  const bestScore = lead.calls.reduce<number | null>((acc, c) => {
    if (c.score == null) return acc;
    return acc == null || c.score > acc ? c.score : acc;
  }, null);

  return (
    <div className="space-y-6 px-5 py-5">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lead
        </h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Row label="Name" value={lead.name ?? '—'} />
          <Row
            label="Phone"
            value={
              <span className="font-mono text-gray-800">
                {lead.phone ?? '—'}
              </span>
            }
          />
          <Row label="Source" value={lead.source ?? '—'} />
          <Row label="Status" value={statusBadge(lead.status)} />
          <Row
            label="Lead id"
            value={<span className="font-mono text-xs text-gray-700">{lead.id}</span>}
          />
          <Row
            label="Idempotency key"
            value={
              lead.idempotencyKey ? (
                <span className="font-mono text-xs text-gray-700">
                  {lead.idempotencyKey}
                </span>
              ) : (
                '—'
              )
            }
          />
          <Row label="Ingested" value={formatDateTime(lead.createdAt)} />
          <Row label="Last updated" value={formatDateTime(lead.updatedAt)} />
        </dl>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Call activity
        </h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Row label="Total attempts" value={String(totalCalls)} />
          <Row label="Answered" value={String(completedCalls)} />
          <Row
            label="Best score"
            value={bestScore != null ? String(bestScore) : '—'}
          />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </>
  );
}
