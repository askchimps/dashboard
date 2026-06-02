import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function SettingsLayout({ children, params }: Props) {
  const { orgId } = await params;
  return (
    <div className="space-y-4">
      <nav className="flex gap-1 border-b border-gray-200">
        <Link
          href={`/orgs/${orgId}/settings/general`}
          className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          General
        </Link>
        <Link
          href={`/orgs/${orgId}/settings/webhooks`}
          className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          Webhooks
        </Link>
      </nav>
      {children}
    </div>
  );
}
