'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, setAgentActive, updateAgent } from '@/lib/api';
import type { AgentUpdateInput } from '@/lib/types';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  analysisPrompt: z.string().max(20_000).optional(),
});

export interface AgentFormState {
  status?: 'ok' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

function stripEmpty<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out as T;
}

export async function saveAgentAction(
  orgId: string,
  agentId: string,
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path) fieldErrors[path] = issue.message;
    }
    return { status: 'error', message: 'Some fields need attention.', fieldErrors };
  }
  try {
    await updateAgent(orgId, agentId, stripEmpty(parsed.data) as AgentUpdateInput);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 403) {
        return { status: 'error', message: 'Only platform admins can edit agents.' };
      }
      if (e.status === 409) {
        return { status: 'error', message: 'Another agent with that name already exists.' };
      }
      return { status: 'error', message: `Save failed (${e.status}).` };
    }
    return { status: 'error', message: 'Save failed.' };
  }
  revalidatePath(`/orgs/${orgId}/agents`);
  revalidatePath(`/orgs/${orgId}/agents/${agentId}`);
  return { status: 'ok', message: 'Saved.' };
}

export async function toggleActiveAction(
  orgId: string,
  agentId: string,
  active: boolean,
): Promise<{ ok: true } | { error: string }> {
  try {
    await setAgentActive(orgId, agentId, active);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 403) return { error: 'Not allowed' };
      return { error: `Toggle failed (${e.status})` };
    }
    return { error: 'Toggle failed' };
  }
  revalidatePath(`/orgs/${orgId}/agents`);
  revalidatePath(`/orgs/${orgId}/agents/${agentId}`);
  return { ok: true };
}
