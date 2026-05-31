import type { LeadDetail } from '@/lib/types';
import { LeadTabs } from './lead-tabs';
import { DetailsTab } from './details-tab';
import { TimelineTab } from './timeline-tab';

interface Props {
  orgId: string;
  lead: LeadDetail | null;
}

export function LeadDetailPane({ orgId, lead }: Props) {
  if (!lead) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-center text-sm text-gray-500">
        Pick a lead on the left to see its details + timeline here.
      </div>
    );
  }
  return (
    <>
      <header className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {lead.name ?? 'Unknown lead'}
          </h2>
          <span className="font-mono text-xs text-gray-500">{lead.id}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-mono">{lead.phone ?? '—'}</span>
          {lead.source ? (
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
              {lead.source}
            </span>
          ) : null}
        </p>
      </header>
      <LeadTabs
        details={<DetailsTab lead={lead} />}
        timeline={<TimelineTab orgId={orgId} lead={lead} />}
      />
    </>
  );
}
