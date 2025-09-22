import { notFound, redirect } from "next/navigation";

import OrganisationGrid from "@/components/grid/organisation";
import SectionHeader from "@/components/section-header/section-header";
import { getOrganisationsAction } from "@/lib/api/actions/organisation/get-organisations";

export default async function Home() {
  const organisations = await getOrganisationsAction();

  if (organisations.length === 0) {
    return notFound();
  }

  return redirect(`/${organisations[0]?.slug}/agents`);

  return (
    <div className="flex flex-col gap-8 p-5">
      <SectionHeader label="Organisations" />
      <OrganisationGrid />
    </div>
  );
}
