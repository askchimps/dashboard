import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/session';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  if (await getSessionToken()) {
    redirect('/');
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">AskChimps</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to the dashboard</p>
        <LoginForm />
        <p className="mt-6 text-xs text-gray-400">
          Dev seed: admin@askchimps.ai / Admin@123 — owner + user passwords
          printed by{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">prisma db seed</code>.
        </p>
      </div>
    </main>
  );
}
