import type { CallDetail } from '@/lib/types';
import { formatDateTime, formatDuration } from './format';

// Standard qualification questions used by the default agent. When real
// per-agent question text lands on the api, swap this map for a per-call
// lookup served alongside answers.
const QUESTION_TEXT: Record<string, string> = {
  q1: 'What kind of property are you looking to design?',
  q2: "What's your timeline?",
  q3: 'Do you have a budget range?',
};

interface Props {
  call: CallDetail;
}

function bucketBadge(bucket: string | null) {
  if (!bucket) return <span className="text-gray-400">—</span>;
  const cls =
    bucket === 'high'
      ? 'bg-emerald-50 text-emerald-700'
      : bucket === 'med'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-50 text-gray-500';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {bucket}
    </span>
  );
}

export function DetailsTab({ call }: Props) {
  return (
    <div className="space-y-6 px-5 py-5">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Call
        </h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Row label="Outcome" value={<code className="text-gray-800">{call.outcome ?? '—'}</code>} />
          <Row label="Bucket" value={bucketBadge(call.bucket)} />
          <Row label="Score" value={call.score != null ? String(call.score) : '—'} />
          <Row label="Attempt" value={String(call.attempt)} />
          <Row label="Duration" value={formatDuration(call.durationSec)} />
          <Row label="Started" value={formatDateTime(call.startedAt)} />
          <Row label="Ended" value={formatDateTime(call.endedAt)} />
          <Row
            label="Bolna call id"
            value={
              call.bolnaCallId ? (
                <span className="font-mono text-xs text-gray-700">
                  {call.bolnaCallId}
                </span>
              ) : (
                '—'
              )
            }
          />
        </dl>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lead
        </h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Row label="Name" value={call.lead.name ?? '—'} />
          <Row
            label="Phone"
            value={
              <span className="font-mono text-gray-800">
                {call.lead.phone ?? '—'}
              </span>
            }
          />
          <Row label="Source" value={call.lead.source ?? '—'} />
          <Row label="Status" value={<code className="text-gray-800">{call.lead.status}</code>} />
          <Row
            label="Lead id"
            value={<span className="font-mono text-xs text-gray-700">{call.lead.id}</span>}
          />
          <Row label="Lead created" value={formatDateTime(call.lead.createdAt)} />
        </dl>
        {call.lead.rawPayload &&
        typeof call.lead.rawPayload === 'object' &&
        Object.keys(call.lead.rawPayload as object).length > 0 ? (
          <div className="mt-3">
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Raw payload
            </h4>
            <pre className="overflow-auto rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-5 text-gray-800">
              {JSON.stringify(call.lead.rawPayload, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>

      {call.answers.length > 0 ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Captured answers
          </h3>
          <ul className="space-y-2 text-sm">
            {call.answers.map((a) => (
              <li
                key={a.id}
                className="rounded border border-gray-200 bg-white p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-600">
                    {a.qId}
                  </span>
                  <span className="text-gray-700">
                    {QUESTION_TEXT[a.qId] ?? '(question text unavailable)'}
                  </span>
                </div>
                <div className="mt-1.5 text-gray-900">{a.rawText ?? '—'}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </>
  );
}
