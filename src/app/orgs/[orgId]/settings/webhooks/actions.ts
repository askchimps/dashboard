'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createWebhook, deleteWebhook, updateWebhook } from '@/lib/api';

const SECRET_COOKIE = 'askchimps_webhook_secret';

export async function createWebhookAction(orgId: string, formData: FormData) {
  const url = String(formData.get('url') ?? '').trim();
  const buckets = String(formData.get('buckets') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const active = formData.get('active') === 'on';
  const events = ['call.analyzed'];
  const created = await createWebhook(orgId, { url, events, buckets, active });
  const jar = await cookies();
  jar.set(
    SECRET_COOKIE,
    JSON.stringify({ id: created.id, secret: created.secret }),
    {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 300,
      path: `/orgs/${orgId}/settings/webhooks`,
    },
  );
  revalidatePath(`/orgs/${orgId}/settings/webhooks`);
  redirect(`/orgs/${orgId}/settings/webhooks`);
}

export async function toggleWebhookAction(
  orgId: string,
  id: string,
  active: boolean,
) {
  await updateWebhook(orgId, id, { active });
  revalidatePath(`/orgs/${orgId}/settings/webhooks`);
}

export async function deleteWebhookAction(orgId: string, id: string) {
  await deleteWebhook(orgId, id);
  revalidatePath(`/orgs/${orgId}/settings/webhooks`);
}

export async function dismissSecretAction() {
  const jar = await cookies();
  jar.delete(SECRET_COOKIE);
}
