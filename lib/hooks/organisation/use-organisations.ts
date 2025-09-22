import { useQuery } from "@tanstack/react-query";

import { organisationQueries } from "@/lib/query/organisation.query";

export function useOrganisations() {
  return useQuery({
    ...organisationQueries.all(),
    retry: 3,
  });
}
