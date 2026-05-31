import { ApiError, getCall, listCalls } from '@/lib/api';
import type {
  CallDetail,
  CallListQuery,
  CallSummary,
  CallSort,
} from '@/lib/types';
import { CallList } from './call-list';
import { CallDetailPane } from './call-detail';

const ALLOWED_SORTS: CallSort[] = [
  'recent',
  'oldest',
  'score_desc',
  'score_asc',
  'duration_desc',
];

interface Props {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{
    callId?: string;
    q?: string;
    outcome?: string;
    bucket?: string;
    sort?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CallsPage({ params, searchParams }: Props) {
  const { orgId } = await params;
  const sp = await searchParams;

  const filters: CallListQuery = {
    q: sp.q?.trim() || undefined,
    outcome: sp.outcome || undefined,
    bucket: sp.bucket || undefined,
    sort: ALLOWED_SORTS.includes(sp.sort as CallSort)
      ? (sp.sort as CallSort)
      : 'recent',
  };

  let calls: CallSummary[] = [];
  try {
    calls = await listCalls(orgId, filters);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  const selectedId =
    sp.callId && calls.some((c) => c.id === sp.callId)
      ? sp.callId
      : (calls[0]?.id ?? null);

  let selected: CallDetail | null = null;
  if (selectedId) {
    try {
      selected = await getCall(orgId, selectedId);
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 gap-4">
      {/* LEFT pane: list with filters/search/sort on top */}
      <section className="flex min-h-0 w-[28rem] shrink-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
        <CallList
          orgId={orgId}
          calls={calls}
          selectedId={selectedId}
          filters={filters}
        />
      </section>

      {/* RIGHT pane: details with two tabs */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
        <CallDetailPane orgId={orgId} call={selected} />
      </section>
    </div>
  );
}
