'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, cancelSchedule } from '@/lib/api';

export interface CancelState {
  status?: 'ok' | 'error';
  message?: string;
}

export async function cancelScheduleAction(
  orgId: string,
  scheduleId: string,
): Promise<CancelState> {
  try {
    await cancelSchedule(orgId, scheduleId);
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        status: 'error',
        message:
          e.status === 403
            ? 'Only owner / admin can cancel schedules.'
            : `Cancel failed (${e.status}).`,
      };
    }
    return { status: 'error', message: 'Cancel failed.' };
  }
  revalidatePath(`/orgs/${orgId}/schedule`);
  return { status: 'ok', message: 'Cancelled.' };
}
