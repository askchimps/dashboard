'use server';

import { revalidatePath } from 'next/cache';
import { reanalyzeCall } from '@/lib/api';

export async function reanalyzeCallAction(orgId: string, callId: string) {
  await reanalyzeCall(orgId, callId);
  revalidatePath(`/orgs/${orgId}/calls`);
}
