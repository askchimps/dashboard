import { notFound, redirect } from 'next/navigation';
import { ApiError, getMe, getSettings } from '@/lib/api';
import { SettingsForm } from './settings-form';

interface Props {
  params: Promise<{ orgId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ params }: Props) {
  const { orgId } = await params;

  let me;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }

  const canEdit =
    me.isPlatformAdmin ||
    me.memberships.some((m) => m.orgId === orgId && m.role === 'OWNER');
  if (!canEdit) notFound();

  const settings = await getSettings(orgId);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Org-level dialer configuration. Calling hours are evaluated in the
          configured timezone every 5 minutes by the scheduler — out-of-hours
          schedules sit pending until the next valid window.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <SettingsForm orgId={orgId} settings={settings} />
      </section>
    </div>
  );
}
