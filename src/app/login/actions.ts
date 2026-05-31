'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError, login } from '@/lib/api';
import { setSessionToken } from '@/lib/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }
  try {
    const { accessToken } = await login(parsed.data.email, parsed.data.password);
    await setSessionToken(accessToken);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      return { error: 'Invalid email or password.' };
    }
    return { error: 'Login failed. Try again.' };
  }
  redirect('/');
}
