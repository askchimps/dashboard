import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import AgentTabContent from "@/components/tab-content/organisation/agent-tab-content";
import UsageTabContent from "@/components/tab-content/organisation/usage-tab-content";
import { getQueryClient } from "@/lib/get-query-client";
import { organisationQueries } from "@/lib/query/organisation.query";

interface OrganisationTabProps {
  params: Promise<{ orgSlug: string; orgTab: string }>;
}

export default async function OrganisationTab({
  params,
}: OrganisationTabProps) {
  const { orgSlug, orgTab } = await params;
  const queryClient = getQueryClient();

  switch (orgTab) {
    case "agents":
      await queryClient.prefetchQuery({
        ...organisationQueries.getAgents(orgSlug),
      });
      break;
    case "usage":
      await queryClient.prefetchQuery({
        ...organisationQueries.getUsage(orgSlug),
      });
      break;
  }

  async function getTabContent() {
    switch (orgTab) {
      case "agents":
        return <AgentTabContent />;
      case "usage":
        return <UsageTabContent />;
      default:
        return notFound();
    }
  }

  return (
    <div className="flex flex-col gap-8 p-5">
      <HydrationBoundary state={dehydrate(queryClient)}>
        {getTabContent()}
      </HydrationBoundary>
    </div>
  );
}
