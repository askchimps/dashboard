import type { CallDetail } from '@/lib/types';
import { CallTabs } from './call-tabs';
import { TranscriptTab } from './transcript-tab';
import { DetailsTab } from './details-tab';

interface Props {
  orgId: string;
  call: CallDetail | null;
  canReanalyze?: boolean;
}

export function CallDetailPane({ orgId, call, canReanalyze = false }: Props) {
  if (!call) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-center text-sm text-gray-500">
        Pick a call on the right to see its transcript + details here.
      </div>
    );
  }
  return (
    <>
      <header className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {call.lead.name ?? 'Unknown lead'}
          </h2>
          <span className="font-mono text-xs text-gray-500">{call.id}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-mono">{call.lead.phone ?? '—'}</span>
          {call.lead.source ? (
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
              {call.lead.source}
            </span>
          ) : null}
        </p>
      </header>
      <CallTabs
        transcript={<TranscriptTab call={call} />}
        details={<DetailsTab call={call} canReanalyze={canReanalyze} />}
      />
    </>
  );
}
