import Link from 'next/link';
import {
  CheckCircle2,
  Inbox,
  PhoneCall,
  PhoneIncoming,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { LeadDetail, TimelineEvent } from '@/lib/types';
import { formatDateTime, formatDuration } from '../calls/format';

interface Props {
  orgId: string;
  lead: LeadDetail;
}

interface IconChoice {
  Icon: LucideIcon;
  cls: string;
}

function iconFor(type: TimelineEvent['type'], outcome?: string): IconChoice {
  if (type === 'lead.ingested')
    return { Icon: Inbox, cls: 'bg-gray-100 text-gray-700' };
  if (type === 'lead.qualified')
    return { Icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' };
  if (type === 'lead.disqualified')
    return { Icon: XCircle, cls: 'bg-red-50 text-red-700' };
  if (type === 'call.started')
    return { Icon: PhoneCall, cls: 'bg-amber-50 text-amber-700' };
  // call.completed
  if (outcome?.startsWith('answered'))
    return { Icon: PhoneIncoming, cls: 'bg-emerald-50 text-emerald-700' };
  return { Icon: PhoneIncoming, cls: 'bg-gray-100 text-gray-600' };
}

function bucketBadge(bucket: string | undefined | null) {
  if (!bucket) return null;
  const cls =
    bucket === 'high'
      ? 'bg-emerald-50 text-emerald-700'
      : bucket === 'med'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-50 text-gray-500';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}
    >
      {bucket}
    </span>
  );
}

export function TimelineTab({ orgId, lead }: Props) {
  if (lead.timeline.length === 0) {
    return (
      <div className="p-6 text-sm italic text-gray-400">
        No events yet for this lead.
      </div>
    );
  }
  return (
    <div className="px-5 py-5">
      <ol className="relative ml-3 border-l border-gray-200">
        {lead.timeline.map((e) => {
          const detail = e.detail ?? {};
          const callId = e.callId;
          const outcome =
            typeof detail.outcome === 'string'
              ? (detail.outcome as string)
              : undefined;
          const bucket =
            typeof detail.bucket === 'string'
              ? (detail.bucket as string)
              : undefined;
          const score =
            typeof detail.score === 'number' ? (detail.score as number) : null;
          const durationSec =
            typeof detail.durationSec === 'number'
              ? (detail.durationSec as number)
              : null;
          const summary =
            typeof detail.summary === 'string'
              ? (detail.summary as string)
              : undefined;
          const { Icon, cls } = iconFor(e.type, outcome);
          return (
            <li key={e.id} className="mb-5 ml-4">
              <span
                className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${cls}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-medium text-gray-900">{e.title}</h4>
                <time className="text-xs text-gray-400">
                  {formatDateTime(e.at)}
                </time>
              </div>
              {summary ? (
                <p className="mt-1 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                  {summary}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {bucketBadge(bucket)}
                {score != null ? <span>score {score}</span> : null}
                {durationSec != null && durationSec > 0 ? (
                  <span>{formatDuration(durationSec)}</span>
                ) : null}
                {outcome ? (
                  <span className="font-mono">{outcome}</span>
                ) : null}
                {callId ? (
                  <Link
                    href={`/orgs/${orgId}/calls?callId=${callId}`}
                    className="text-gray-900 underline-offset-2 hover:underline"
                  >
                    Open call →
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
