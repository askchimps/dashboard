import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ApiError, getAgent, getMe } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/env';
import type { AuthUser } from '@/lib/types';
import { AgentForm } from './agent-form';
import { ActiveToggle } from './active-toggle';
import { WebhookPanel } from './webhook-panel';

interface Props {
  params: Promise<{ orgId: string; agentId: string }>;
}

export const dynamic = 'force-dynamic';

function canSeeAgent(me: AuthUser, orgId: string): boolean {
  if (me.isPlatformAdmin) return true;
  return me.memberships.some((m) => m.orgId === orgId);
}

export default async function AgentDetailPage({ params }: Props) {
  const { orgId, agentId } = await params;

  let me: AuthUser;
  try {
    me = await getMe();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect('/login');
    throw e;
  }
  if (!canSeeAgent(me, orgId)) notFound();

  let agent;
  try {
    agent = await getAgent(orgId, agentId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
      notFound();
    }
    throw e;
  }

  const apiBase = (process.env.NEXT_PUBLIC_INGEST_BASE_URL ?? getApiBaseUrl()).replace(/\/$/, '');
  const ingestUrl = `${apiBase}/v1/ingest/${agent.ingestCode}`;
  const ingestCurl = `curl -X POST ${ingestUrl} \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{"name":"Jane Doe","phone":"+919999999999","source":"website"}'`;

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
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{agent.name}</h1>
            <p className="font-mono text-xs text-gray-500">{agent.id}</p>
          </div>
          <ActiveToggle orgId={orgId} agentId={agent.id} active={agent.active} />
        </div>
      </div>

      <WebhookPanel
        title="Lead ingestion URL"
        description="Send leads to this URL from your CRM. Each lead is queued and dispatched to this agent in the next active section."
        url={ingestUrl}
        exampleCurl={ingestCurl}
        agentId={agent.id}
      />

      {me.isPlatformAdmin ? (
        <AgentForm orgId={orgId} agent={agent} />
      ) : null}
    </div>
  );
}
