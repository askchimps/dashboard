'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, updateSettings } from '@/lib/api';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  callingHoursStart: z.string().regex(HHMM, 'Use HH:MM (24h)'),
  callingHoursEnd: z.string().regex(HHMM, 'Use HH:MM (24h)'),
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
    callingHoursStart: formData.get('callingHoursStart'),
    callingHoursEnd: formData.get('callingHoursEnd'),
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
  if (parsed.data.callingHoursEnd <= parsed.data.callingHoursStart) {
    return { status: 'error', message: 'End must be after start.' };
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
