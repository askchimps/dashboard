import { notFound, redirect } from "next/navigation";

import { getOrganisationsAction } from "@/lib/api/actions/organisation/get-organisations";

export default async function Organisation() {
  const organisations = await getOrganisationsAction();

  if (organisations.length === 0) {
    return notFound();
  }

  return redirect(`/${organisations[0]?.slug}/overview`);
}
