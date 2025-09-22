import { useQuery } from "@tanstack/react-query";

import { organisationQueries } from "@/lib/query/organisation.query";

export function useOrganisation(idOrSlug: string) {
  return useQuery({
    ...organisationQueries.getOne(idOrSlug),
    refetchOnWindowFocus: false,
    retry: 3,
  });
}
