import { Phone, PhoneOff } from 'lucide-react';
import type { CallListQuery, CallSummary } from '@/lib/types';
import { CallFilters } from './call-filters';
import { CallRowLink } from './call-row-link';
import { formatDuration, formatRelative } from './format';
import { Pager } from '@/components/pager';
import { AnalysisStatusPill } from '@/components/analysis-status-pill';

interface Props {
  orgId: string;
  calls: CallSummary[];
  selectedId: string | null;
  filters: CallListQuery;
  paging: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

function outcomeIcon(outcome: string | null) {
  if (outcome?.startsWith('answered')) {
    return (
      <Phone
        className="h-3.5 w-3.5 text-emerald-600"
        aria-hidden="true"
      />
    );
  }
  return (
    <PhoneOff
      className="h-3.5 w-3.5 text-gray-400"
      aria-hidden="true"
    />
  );
}

function bucketBadge(bucket: string | null) {
  if (!bucket) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  const cls =
    bucket === 'high'
      ? 'bg-emerald-50 text-emerald-700'
      : bucket === 'med'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-50 text-gray-500';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {bucket}
    </span>
  );
}

export function CallList({ orgId, calls, selectedId, filters, paging }: Props) {
  return (
    <>
      <header className="border-b border-gray-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Calls
            <span className="ml-2 font-normal text-gray-500">
              {paging.total}
            </span>
          </h2>
        </div>
        <CallFilters orgId={orgId} filters={filters} />
      </header>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">
            No calls match these filters.
          </li>
        ) : (
          calls.map((c) => {
            const isActive = c.id === selectedId;
            return (
              <li key={c.id} className="border-b border-gray-100 last:border-0">
                <CallRowLink
                  orgId={orgId}
                  callId={c.id}
                  active={isActive}
                  className="block w-full px-3 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {outcomeIcon(c.outcome)}
                      <span className="truncate text-sm font-medium text-gray-900">
                        {c.lead.name ?? 'Unknown lead'}
                      </span>
                    </div>
                    {bucketBadge(c.bucket)}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">
                      {c.lead.phone ?? '—'}
                    </span>
                    <span className="text-gray-400">
                      {formatRelative(c.startedAt ?? c.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">
                      {c.outcome ?? '—'}
                    </span>
                    <span className="text-gray-500">
                      {formatDuration(c.durationSec)}
                      {c.score != null ? ` · score ${c.score}` : ''}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <AnalysisStatusPill
                      status={c.analysisStatus}
                      title={c.analysisError ?? undefined}
                    />
                  </div>
                </CallRowLink>
              </li>
            );
          })
        )}
      </ul>
      <Pager
        total={paging.total}
        page={paging.page}
        pageSize={paging.pageSize}
        pageCount={paging.pageCount}
      />
    </>
  );
}
