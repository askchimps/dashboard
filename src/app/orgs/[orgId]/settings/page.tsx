import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function SettingsRoot({ params }: Props) {
  const { orgId } = await params;
  redirect(`/orgs/${orgId}/settings/general`);
}
