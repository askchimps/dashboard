import { ApiError, getMe, listSchedules } from '@/lib/api';
import type { Schedule } from '@/lib/types';
import { ScheduleFilters } from './schedule-filters';
import { ScheduleTable } from './schedule-table';

interface Props {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SchedulePage({ params, searchParams }: Props) {
  const { orgId } = await params;
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;

  const me = await getMe();
  const canCancel =
    me.isPlatformAdmin ||
    me.memberships.some((m) => m.orgId === orgId && m.role === 'OWNER');

  let schedules: Schedule[] = [];
  try {
    schedules = await listSchedules(orgId, { window: 'upcoming', q });
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500">
            Upcoming calls queued for this org. The dispatcher runs every 5
            minutes and respects the calling-hours setting. Cancelling a row
            soft-deletes it — history is preserved for audit.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <ScheduleFilters orgId={orgId} q={q ?? ''} />
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <ScheduleTable
          orgId={orgId}
          schedules={schedules}
          canCancel={canCancel}
        />
      </section>
    </div>
  );
}
