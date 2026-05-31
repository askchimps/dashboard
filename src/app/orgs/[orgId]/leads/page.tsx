import { ApiError, getLead, listLeads } from '@/lib/api';
import type {
  LeadDetail,
  LeadListQuery,
  LeadSort,
  LeadSummary,
} from '@/lib/types';
import { LeadList } from './lead-list';
import { LeadDetailPane } from './lead-detail';

const ALLOWED_SORTS: LeadSort[] = ['recent', 'oldest', 'name_asc', 'name_desc'];

interface Props {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{
    leadId?: string;
    q?: string;
    status?: string;
    source?: string;
    sort?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function LeadsPage({ params, searchParams }: Props) {
  const { orgId } = await params;
  const sp = await searchParams;

  const filters: LeadListQuery = {
    q: sp.q?.trim() || undefined,
    status: sp.status || undefined,
    source: sp.source || undefined,
    sort: ALLOWED_SORTS.includes(sp.sort as LeadSort)
      ? (sp.sort as LeadSort)
      : 'recent',
  };

  let leads: LeadSummary[] = [];
  try {
    leads = await listLeads(orgId, filters);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  const selectedId =
    sp.leadId && leads.some((l) => l.id === sp.leadId)
      ? sp.leadId
      : (leads[0]?.id ?? null);

  let selected: LeadDetail | null = null;
  if (selectedId) {
    try {
      selected = await getLead(orgId, selectedId);
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 gap-4">
      {/* LEFT pane: list */}
      <section className="flex min-h-0 w-[28rem] shrink-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
        <LeadList
          orgId={orgId}
          leads={leads}
          selectedId={selectedId}
          filters={filters}
        />
      </section>

      {/* RIGHT pane: details + timeline */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
        <LeadDetailPane orgId={orgId} lead={selected} />
      </section>
    </div>
  );
}
