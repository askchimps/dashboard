import 'server-only';
import { getApiBaseUrl } from './env';
import { getSessionToken } from './session';
import type {
  Agent,
  AuthUser,
  CallDetail,
  CallListQuery,
  CallSummary,
  LoginResponse,
  Org,
} from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

async function call<T>(
  path: string,
  init: RequestInit & { token?: string | undefined } = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }
  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    throw new ApiError(res.status, `API ${res.status} ${path}`, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  return call<LoginResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<AuthUser> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<AuthUser>('/v1/auth/me', { token });
}

export async function listOrgs(): Promise<Org[]> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<Org[]>('/v1/orgs', { token });
}

export async function listAgents(orgId: string): Promise<Agent[]> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<Agent[]>(`/v1/orgs/${encodeURIComponent(orgId)}/agents`, { token });
}

export async function getAgent(orgId: string, agentId: string): Promise<Agent> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<Agent>(
    `/v1/orgs/${encodeURIComponent(orgId)}/agents/${encodeURIComponent(agentId)}`,
    { token },
  );
}

export async function listCalls(
  orgId: string,
  query: CallListQuery = {},
): Promise<CallSummary[]> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.outcome) search.set('outcome', query.outcome);
  if (query.bucket) search.set('bucket', query.bucket);
  if (query.sort) search.set('sort', query.sort);
  const qs = search.toString();
  return call<CallSummary[]>(
    `/v1/orgs/${encodeURIComponent(orgId)}/calls${qs ? `?${qs}` : ''}`,
    { token },
  );
}

export async function getCall(
  orgId: string,
  callId: string,
): Promise<CallDetail> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<CallDetail>(
    `/v1/orgs/${encodeURIComponent(orgId)}/calls/${encodeURIComponent(callId)}`,
    { token },
  );
}

export async function updateAgent(
  orgId: string,
  agentId: string,
  data: Partial<Pick<Agent, 'name' | 'basePrompt' | 'analysisPrompt' | 'knowledge'>>,
): Promise<Agent> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<Agent>(
    `/v1/orgs/${encodeURIComponent(orgId)}/agents/${encodeURIComponent(agentId)}`,
    { method: 'PATCH', token, body: JSON.stringify(data) },
  );
}
