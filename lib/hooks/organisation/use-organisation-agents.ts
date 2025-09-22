import { useQuery } from "@tanstack/react-query";

import { organisationQueries } from "@/lib/query/organisation.query";

export function useOrganisationAgents(idOrSlug: string) {
  return useQuery({
    ...organisationQueries.getAgents(idOrSlug),
    refetchOnWindowFocus: false,
    retry: 3,
  });
}
