import type { LeadListQuery, LeadSummary } from '@/lib/types';
import { LeadFilters } from './lead-filters';
import { LeadRowLink } from './lead-row-link';
import { formatRelative } from '../calls/format';
import { Pager } from '@/components/pager';

interface Props {
  orgId: string;
  leads: LeadSummary[];
  selectedId: string | null;
  filters: LeadListQuery;
  paging: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
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

function bestBadge(bucket: string | null, score: number | null) {
  if (!bucket && score == null) {
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
      {bucket ?? '—'}
      {score != null ? ` · ${score}` : ''}
    </span>
  );
}

export function LeadList({ orgId, leads, selectedId, filters, paging }: Props) {
  return (
    <>
      <header className="border-b border-gray-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Leads
            <span className="ml-2 font-normal text-gray-500">
              {paging.total}
            </span>
          </h2>
        </div>
        <LeadFilters orgId={orgId} filters={filters} />
      </header>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {leads.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">
            No leads match these filters.
          </li>
        ) : (
          leads.map((l) => {
            const isActive = l.id === selectedId;
            return (
              <li key={l.id} className="border-b border-gray-100 last:border-0">
                <LeadRowLink
                  orgId={orgId}
                  leadId={l.id}
                  active={isActive}
                  className="block w-full px-3 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                      {l.name ?? 'Unknown lead'}
                    </span>
                    {bestBadge(l.bestBucket, l.bestScore)}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">
                      {l.phone ?? '—'}
                    </span>
                    <span className="text-gray-400">
                      {formatRelative(l.lastCallAt ?? l.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    {statusBadge(l.status)}
                    <span className="text-gray-500">
                      {l.callCount} call{l.callCount === 1 ? '' : 's'}
                      {l.source ? ` · ${l.source}` : ''}
                    </span>
                  </div>
                </LeadRowLink>
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
