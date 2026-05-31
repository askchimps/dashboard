import 'server-only';
import { getApiBaseUrl } from './env';
import { getSessionToken } from './session';
import type {
  Agent,
  AuthUser,
  CallDetail,
  CallListQuery,
  CallSummary,
  LeadDetail,
  LeadListQuery,
  LeadSummary,
  LoginResponse,
  Org,
  OrgSettings,
  Paged,
  Schedule,
  ScheduleListQuery,
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
): Promise<Paged<CallSummary>> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.outcome) search.set('outcome', query.outcome);
  if (query.bucket) search.set('bucket', query.bucket);
  if (query.sort) search.set('sort', query.sort);
  if (query.page) search.set('page', String(query.page));
  if (query.pageSize) search.set('pageSize', String(query.pageSize));
  const qs = search.toString();
  return call<Paged<CallSummary>>(
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

export async function listLeads(
  orgId: string,
  query: LeadListQuery = {},
): Promise<Paged<LeadSummary>> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.status) search.set('status', query.status);
  if (query.source) search.set('source', query.source);
  if (query.sort) search.set('sort', query.sort);
  if (query.page) search.set('page', String(query.page));
  if (query.pageSize) search.set('pageSize', String(query.pageSize));
  const qs = search.toString();
  return call<Paged<LeadSummary>>(
    `/v1/orgs/${encodeURIComponent(orgId)}/leads${qs ? `?${qs}` : ''}`,
    { token },
  );
}

export async function getLead(orgId: string, leadId: string): Promise<LeadDetail> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<LeadDetail>(
    `/v1/orgs/${encodeURIComponent(orgId)}/leads/${encodeURIComponent(leadId)}`,
    { token },
  );
}

export async function listSchedules(
  orgId: string,
  query: ScheduleListQuery = {},
): Promise<Paged<Schedule>> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  if (query.status) search.set('status', query.status);
  if (query.window) search.set('window', query.window);
  if (query.includeDeleted) search.set('includeDeleted', 'true');
  if (query.page) search.set('page', String(query.page));
  if (query.pageSize) search.set('pageSize', String(query.pageSize));
  const qs = search.toString();
  return call<Paged<Schedule>>(
    `/v1/orgs/${encodeURIComponent(orgId)}/schedules${qs ? `?${qs}` : ''}`,
    { token },
  );
}

export async function cancelSchedule(
  orgId: string,
  scheduleId: string,
): Promise<void> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  await call<void>(
    `/v1/orgs/${encodeURIComponent(orgId)}/schedules/${encodeURIComponent(scheduleId)}`,
    { method: 'DELETE', token },
  );
}

export async function getSettings(orgId: string): Promise<OrgSettings> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<OrgSettings>(
    `/v1/orgs/${encodeURIComponent(orgId)}/settings`,
    { token },
  );
}

export async function updateSettings(
  orgId: string,
  data: Partial<
    Pick<
      OrgSettings,
      | 'sectionAStart'
      | 'sectionAEnd'
      | 'sectionBStart'
      | 'sectionBEnd'
      | 'sectionCStart'
      | 'sectionCEnd'
      | 'timezone'
      | 'maxRetries'
      | 'retryDelayMinutes'
    >
  >,
): Promise<OrgSettings> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'No session');
  return call<OrgSettings>(
    `/v1/orgs/${encodeURIComponent(orgId)}/settings`,
    { method: 'PATCH', token, body: JSON.stringify(data) },
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
