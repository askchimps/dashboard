import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ApiError, getMe } from '@/lib/api';
import { CreateAgentForm } from './create-agent-form';

interface Props {
  params: Promise<{ orgId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function NewAgentPage({ params }: Props) {
  const { orgId } = await params;

  let me;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  if (!me.isPlatformAdmin) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/orgs/${orgId}/agents`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          All agents
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">New agent</h1>
        <p className="mt-1 text-sm text-gray-500">
          A webhook URL + secret is generated automatically on create. Use them
          to send leads at this agent.
        </p>
      </div>

      <CreateAgentForm orgId={orgId} />
    </div>
  );
}
