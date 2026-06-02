import type { CallAnalysisQuestion, CallDetail } from '@/lib/types';
import { formatDateTime, formatDuration } from './format';
import { AnalysisStatusPill } from '@/components/analysis-status-pill';
import { ReanalyzeButton } from './reanalyze-button';

interface Props {
  call: CallDetail;
  canReanalyze?: boolean;
}

function bucketBadge(bucket: string | null | undefined) {
  if (!bucket) return <span className="text-gray-400">—</span>;
  const cls =
    bucket === 'high'
      ? 'bg-emerald-50 text-emerald-700'
      : bucket === 'med'
        ? 'bg-amber-50 text-amber-700'
        : bucket === 'disqualified'
          ? 'bg-red-50 text-red-700'
          : 'bg-gray-50 text-gray-500';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {bucket}
    </span>
  );
}

export function DetailsTab({ call, canReanalyze = false }: Props) {
  const analysis = call.analysis ?? null;
  const questions: CallAnalysisQuestion[] = analysis?.questions ?? [];
  const busy =
    call.analysisStatus === 'in_progress' || call.analysisStatus === 'pending';

  return (
    <div className="space-y-6 px-5 py-5">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Call
        </h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Row
            label="Analysis"
            value={
              <span className="inline-flex items-center gap-2">
                <AnalysisStatusPill
                  status={call.analysisStatus}
                  title={call.analysisError ?? undefined}
                />
                {canReanalyze ? (
                  <ReanalyzeButton
                    orgId={call.lead.orgId}
                    callId={call.id}
                    disabled={busy}
                  />
                ) : null}
              </span>
            }
          />
          {call.analysisStatus === 'failed' && call.analysisError ? (
            <Row
              label="Analysis error"
              value={<span className="text-xs text-red-600">{call.analysisError}</span>}
            />
          ) : null}
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
                <span className="font-mono text-xs text-gray-700">{call.bolnaCallId}</span>
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
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">
            {call.lead.name ?? 'Unknown lead'}
          </span>{' '}
          ·{' '}
          <span className="font-mono">{call.lead.phone ?? '—'}</span> ·{' '}
          <a
            href={`/orgs/${call.lead.orgId}/leads?leadId=${call.lead.id}`}
            className="text-gray-900 underline-offset-2 hover:underline"
          >
            Open lead →
          </a>
        </p>
      </section>

      {analysis ? (
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              AI analysis
            </h3>
            {analysis.model ? (
              <span className="font-mono text-[10px] uppercase tracking-wide text-gray-400">
                {analysis.model}
              </span>
            ) : null}
          </div>

          {analysis.summary ? (
            <p className="mb-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {analysis.summary}
            </p>
          ) : null}

          {analysis.tags && analysis.tags.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {analysis.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Captured answers ({questions.length})
          </h4>
          {questions.length === 0 ? (
            <p className="text-sm italic text-gray-400">
              No qualification answers captured on this attempt.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="rounded border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-600">
                      {q.id}
                    </span>
                    <span className="text-gray-700">{q.question}</span>
                  </div>
                  <div className="mt-1.5 text-gray-900">{q.answer || '—'}</div>
                  {q.extracted && Object.keys(q.extracted).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(q.extracted).map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-700"
                          title={k}
                        >
                          {k}: <span className="text-gray-900">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            AI analysis
          </h3>
          <p className="text-sm italic text-gray-400">
            No analysis run for this call yet.
          </p>
        </section>
      )}
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
