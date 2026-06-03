'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, createAgent } from '@/lib/api';
import type { AgentCreateInput } from '@/lib/types';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  bolnaAgentId: z.string().trim().min(1).max(120),
  analysisPrompt: z.string().max(20_000).optional(),
});

export interface CreateAgentFormState {
  status?: 'error' | 'ok';
  message?: string;
  fieldErrors?: Record<string, string>;
  createdId?: string;
}

function stripEmpty<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out as T;
}

export async function createAgentAction(
  orgId: string,
  _prev: CreateAgentFormState,
  formData: FormData,
): Promise<CreateAgentFormState> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        if (path) fieldErrors[path] = issue.message;
      }
      return {
        status: 'error',
        message: 'Some fields need attention.',
        fieldErrors,
      };
    }
    let created;
    try {
      created = await createAgent(orgId, stripEmpty(parsed.data) as AgentCreateInput);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          return { status: 'error', message: 'An agent with that name or voice agent ID already exists.' };
        }
        if (e.status === 403) {
          return { status: 'error', message: 'Only platform admins can create agents.' };
        }
        return {
          status: 'error',
          message: `Create failed (${e.status}). ${JSON.stringify(e.body).slice(0, 200)}`,
        };
      }
      return {
        status: 'error',
        message: `Create failed. ${(e as Error).message?.slice(0, 200) ?? String(e).slice(0, 200)}`,
      };
    }
    revalidatePath(`/orgs/${orgId}/agents`);
    return { status: 'ok', message: 'Agent created.', createdId: created.id };
  } catch (outer) {
    return {
      status: 'error',
      message: `OUTER error: ${(outer as Error).message?.slice(0, 200) ?? String(outer).slice(0, 200)}`,
    };
  }
}
