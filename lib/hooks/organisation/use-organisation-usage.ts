import { useQuery } from "@tanstack/react-query";

import { organisationQueries } from "@/lib/query/organisation.query";

export function useOrganisationUsage(idOrSlug: string) {
    return useQuery({
        ...organisationQueries.getUsage(idOrSlug),
        refetchOnWindowFocus: false,
        retry: 3,
    });
}