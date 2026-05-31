'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ApiError, updateAgent } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  basePrompt: z.string().max(20_000),
  analysisPrompt: z.string().max(20_000),
  knowledge: z.string().max(200_000),
});

export interface AgentFormState {
  status?: 'ok' | 'error';
  message?: string;
}

export async function saveAgentAction(
  orgId: string,
  agentId: string,
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    basePrompt: formData.get('basePrompt'),
    analysisPrompt: formData.get('analysisPrompt'),
    knowledge: formData.get('knowledge'),
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Invalid input — check fields.' };
  }
  try {
    await updateAgent(orgId, agentId, parsed.data);
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        status: 'error',
        message:
          e.status === 403
            ? 'Only platform admins can edit agents.'
            : `Save failed (${e.status}).`,
      };
    }
    return { status: 'error', message: 'Save failed.' };
  }
  revalidatePath(`/orgs/${orgId}/agents`);
  revalidatePath(`/orgs/${orgId}/agents/${agentId}`);
  return { status: 'ok', message: 'Saved.' };
}
