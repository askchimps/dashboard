import 'server-only';
import { cookies } from 'next/headers';

const COOKIE = 'sidebar_collapsed';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getSidebarCollapsed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === '1';
}

export async function setSidebarCollapsed(collapsed: boolean) {
  const jar = await cookies();
  jar.set(COOKIE, collapsed ? '1' : '0', {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR,
  });
}
