import 'server-only';
import { cookies } from 'next/headers';
import {
  getSessionCookieName,
  getSessionCookieSecure,
} from './env';

const TWELVE_HOURS_SEC = 12 * 60 * 60;

export async function setSessionToken(token: string) {
  const jar = await cookies();
  jar.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getSessionCookieSecure(),
    path: '/',
    maxAge: TWELVE_HOURS_SEC,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(getSessionCookieName())?.value;
}

export async function clearSessionToken() {
  const jar = await cookies();
  jar.delete(getSessionCookieName());
}
