'use server';

import { revalidatePath } from 'next/cache';
import { setSidebarCollapsed } from '@/lib/sidebar';

export async function toggleSidebarAction(currentCollapsed: boolean) {
  await setSidebarCollapsed(!currentCollapsed);
  revalidatePath('/', 'layout');
}
