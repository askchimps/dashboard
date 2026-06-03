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
  const ingestUrl = `${apiBase}/v1/agents/${agent.id}/leads`;
  const bolnaCallbackUrl = `${apiBase}/v1/agents/${agent.id}/bolna-callback?secret=${encodeURIComponent(
    agent.bolnaCallSecret,
  )}`;

  const ingestCurl = `curl -X POST ${ingestUrl} \\
  -H "Content-Type: application/json" \\
  -H "X-AskChimps-Secret: ${agent.ingestSecret}" \\
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

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
          <Pair label="Voice" value={`${agent.voiceName ?? agent.voiceId} (${agent.voiceProvider})`} />
          <Pair label="Language" value={agent.language} />
          <Pair label="LLM" value={`${agent.llmModel} · t=${agent.llmTemperature}`} />
          <Pair label="Transcriber" value={`${agent.transcriberProvider}/${agent.transcriberModel}`} />
          <Pair label="Telephony" value={agent.telephonyProvider} />
          <Pair
            label="Calling hours"
            value={
              agent.callStartHour != null && agent.callEndHour != null
                ? `${agent.callStartHour}:00 → ${agent.callEndHour}:00`
                : '24h'
            }
          />
          <Pair
            label="Bolna agent"
            value={
              agent.bolnaAgentId ? (
                <code className="font-mono text-xs">{agent.bolnaAgentId}</code>
              ) : agent.bolnaSyncError ? (
                <span className="text-red-600">sync error</span>
              ) : (
                <span className="text-amber-600">not synced</span>
              )
            }
          />
          <Pair
            label="Synced"
            value={
              agent.bolnaCreatedAt
                ? new Date(agent.bolnaCreatedAt).toLocaleString()
                : '—'
            }
          />
        </dl>
        {agent.bolnaSyncError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Last Bolna sync error: {agent.bolnaSyncError}
          </p>
        ) : null}
      </section>

      <WebhookPanel
        title="Lead ingestion webhook"
        description="Send leads to this URL. Each lead is queued and dispatched to this agent in the next active section."
        url={ingestUrl}
        secret={agent.ingestSecret}
        secretHeaderHint="Send in X-AskChimps-Secret header (or Authorization: Bearer <secret>)."
        exampleCurl={ingestCurl}
        agentId={agent.id}
      />

      {me.isPlatformAdmin ? (
        <>
          <WebhookPanel
            title="Bolna call callback (admin only)"
            description="This is the URL we registered on Bolna for this agent. Bolna posts call transcripts and analytics here when calls end."
            url={bolnaCallbackUrl}
            secret={agent.bolnaCallSecret}
            secretHeaderHint="Verified by ?secret=… on the callback URL. Bolna does not sign requests; restrict by source IP if possible."
            agentId={agent.id}
          />

          <AgentForm orgId={orgId} agent={agent} />
        </>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Prompts</h3>
          <Block label="Base prompt" value={agent.basePrompt} />
          <Block label="Analysis prompt" value={agent.analysisPrompt} />
          {agent.knowledge ? <Block label="Knowledge base" value={agent.knowledge} /> : null}
          <p className="mt-4 text-xs text-gray-500">
            Need a different voice, language, or prompt? Ping the AskChimps team — only platform admins can change Bolna settings.
          </p>
        </section>
      )}
    </div>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] text-gray-800">
{value || '—'}
      </pre>
    </div>
  );
}
