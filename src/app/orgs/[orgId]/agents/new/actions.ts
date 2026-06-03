'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, createAgent } from '@/lib/api';
import type { AgentCreateInput } from '@/lib/types';

const optInt = (lo: number, hi: number) =>
  z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
      z.number().int().min(lo).max(hi).optional(),
    );

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  welcomeMessage: z.string().max(2_000).optional(),
  basePrompt: z.string().max(20_000).optional(),
  analysisPrompt: z.string().max(20_000).optional(),
  knowledge: z.string().max(200_000).optional(),
  language: z.enum(['en', 'hi']).optional(),
  llmProvider: z.string().max(60).optional(),
  llmModel: z.string().max(120).optional(),
  llmTemperature: z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
      z.number().min(0).max(2).optional(),
    ),
  llmMaxTokens: optInt(16, 4096),
  voiceProvider: z.enum(['elevenlabs', 'polly', 'deepgram']).optional(),
  voiceId: z.string().trim().min(1).max(120),
  voiceName: z.string().max(120).optional(),
  voiceModel: z.string().max(120).optional(),
  transcriberProvider: z.enum(['deepgram', 'bodhi']).optional(),
  transcriberModel: z.string().max(120).optional(),
  telephonyProvider: z.enum(['plivo', 'twilio', 'exotel']).optional(),
  callStartHour: optInt(0, 23),
  callEndHour: optInt(0, 23),
  hangupAfterSilence: optInt(2, 120),
  callTerminateSec: optInt(15, 1800),
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
        return { status: 'error', message: 'An agent with that name already exists.' };
      }
      if (e.status === 403) {
        return { status: 'error', message: 'Only platform admins can create agents.' };
      }
      if (e.status === 503) {
        return {
          status: 'error',
          message:
            'Bolna sync failed. Check BOLNA_API_KEY on the api and the form values, then retry.',
        };
      }
      return { status: 'error', message: `Create failed (${e.status}).` };
    }
    return { status: 'error', message: 'Create failed.' };
  }
  revalidatePath(`/orgs/${orgId}/agents`);
  // NOTE: `redirect()` inside this action returns an HTML 303 response that
  // useActionState ("$ACTION_REF" forms) cannot decode — Vercel surfaces it
  // as "An unexpected response was received from the server". Return the
  // created id and let the client navigate via router.push to dodge that.
  return { status: 'ok', message: 'Agent created.', createdId: created.id };
}
