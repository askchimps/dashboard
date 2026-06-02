'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, updateSettings } from '@/lib/api';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const hhmm = z.string().regex(HHMM, 'Use HH:MM (24h)');

const schema = z.object({
  sectionAStart: hhmm,
  sectionAEnd: hhmm,
  sectionBStart: hhmm,
  sectionBEnd: hhmm,
  sectionCStart: hhmm,
  sectionCEnd: hhmm,
  timezone: z.string().trim().min(1).max(60),
  maxRetries: z.coerce.number().int().min(0).max(20),
  retryDelayMinutes: z.coerce.number().int().min(1).max(1440),
});

export interface SettingsState {
  status?: 'ok' | 'error';
  message?: string;
}

export async function saveSettingsAction(
  orgId: string,
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = schema.safeParse({
    sectionAStart: formData.get('sectionAStart'),
    sectionAEnd: formData.get('sectionAEnd'),
    sectionBStart: formData.get('sectionBStart'),
    sectionBEnd: formData.get('sectionBEnd'),
    sectionCStart: formData.get('sectionCStart'),
    sectionCEnd: formData.get('sectionCEnd'),
    timezone: formData.get('timezone'),
    maxRetries: formData.get('maxRetries'),
    retryDelayMinutes: formData.get('retryDelayMinutes'),
  });
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Invalid input.',
    };
  }
  const sections: Array<[string, string, string]> = [
    ['A', parsed.data.sectionAStart, parsed.data.sectionAEnd],
    ['B', parsed.data.sectionBStart, parsed.data.sectionBEnd],
    ['C', parsed.data.sectionCStart, parsed.data.sectionCEnd],
  ];
  for (const [key, s, e] of sections) {
    if (e <= s) {
      return {
        status: 'error',
        message: `Section ${key}: end must be after start.`,
      };
    }
  }

  try {
    await updateSettings(orgId, parsed.data);
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        status: 'error',
        message:
          e.status === 403
            ? 'Only owner / admin can change settings.'
            : `Save failed (${e.status}).`,
      };
    }
    return { status: 'error', message: 'Save failed.' };
  }
  revalidatePath(`/orgs/${orgId}/settings`);
  return { status: 'ok', message: 'Saved.' };
}
