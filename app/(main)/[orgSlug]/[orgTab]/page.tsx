import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import AnalyticsTabContent from "@/components/tab-content/organisation/analytics-tab-content";
import CallLogTabContent from "@/components/tab-content/organisation/call-log-tab-content";
import ChatLogTabContent from "@/components/tab-content/organisation/chat-log-tab-content";
import LeadTabContent from "@/components/tab-content/organisation/lead-tab-content";
import OverviewTabContent from "@/components/tab-content/organisation/overview-tab-content";
import TestCallsTabContent from "@/components/tab-content/organisation/test-calls-tab-content";
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
    // case "agents":
    //   await queryClient.prefetchQuery({
    //     ...organisationQueries.getAgents(orgSlug),
    //   });
    //   break;
    case "overview":
      await queryClient.prefetchQuery({
        ...organisationQueries.getOverview(orgSlug),
      });
      break;
    case "analytics":
      await queryClient.prefetchQuery({
        ...organisationQueries.getAnalytics(orgSlug),
      });
      break;
  }

  async function getTabContent() {
    switch (orgTab) {
      // case "agents":
      //   return <AgentTabContent />;
      case "overview":
        return <OverviewTabContent />;
      case "call-logs":
        return <CallLogTabContent />;
      case "chat-logs":
        return <ChatLogTabContent />;
      case "leads":
        return <LeadTabContent />;
      case "analytics":
        return <AnalyticsTabContent />;
      case "test-calls":
        return <TestCallsTabContent />;
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
