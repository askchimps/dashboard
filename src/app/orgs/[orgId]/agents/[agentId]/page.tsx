import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ApiError, getAgent, getMe } from '@/lib/api';
import { AgentForm } from './agent-form';

interface Props {
  params: Promise<{ orgId: string; agentId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AgentDetailPage({ params }: Props) {
  const { orgId, agentId } = await params;

  let me;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  if (!me.isPlatformAdmin) notFound();

  let agent;
  try {
    agent = await getAgent(orgId, agentId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
      notFound();
    }
    throw e;
  }

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
        <h1 className="mt-2 text-xl font-semibold text-gray-900">
          {agent.name}
        </h1>
        <p className="font-mono text-xs text-gray-500">{agent.id}</p>
      </div>

      <AgentForm orgId={orgId} agent={agent} />
    </div>
  );
}
