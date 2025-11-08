import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// import FloatingCallButton from "@/components/floating-call-button";
import SidebarWrapper from "@/components/sidebar/sidebar-wrapper";
import { getQueryClient } from "@/lib/get-query-client";
import { organisationQueries } from "@/lib/query/organisation.query";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...organisationQueries.all(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarWrapper>{children}</SidebarWrapper>
      {/* <FloatingCallButton /> */}
    </HydrationBoundary>
  );
}
