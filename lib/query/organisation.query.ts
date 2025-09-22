import { getOrganisationAction } from "@/lib/api/actions/organisation/get-organisation";
import { getOrganisationsAction } from "@/lib/api/actions/organisation/get-organisations";
import { getOrganisationAgentsAction } from "@/lib/api/actions/organisation/get-organisation-agents";
import { getOrganisationUsageAction } from "@/lib/api/actions/organisation/get-organisation-usage";

export const organisationKeys = {
  all: ["organisations"] as const,
  lists: () => [...organisationKeys.all, "list"] as const,
  list: (filters: string) =>
    [...organisationKeys.lists(), { filters }] as const,
  details: () => [...organisationKeys.all, "detail"] as const,
  detail: (idOrSlug: string) =>
    [...organisationKeys.details(), idOrSlug] as const,
};

export const organisationQueries = {
  all: () => ({
    queryKey: organisationKeys.all,
    queryFn: getOrganisationsAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
  getOne: (idOrSlug: string) => ({
    queryKey: organisationKeys.detail(idOrSlug),
    queryFn: () => getOrganisationAction(idOrSlug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
  getAgents: (idOrSlug: string) => ({
    queryKey: [...organisationKeys.detail(idOrSlug), "agents"] as const,
    queryFn: () => getOrganisationAgentsAction(idOrSlug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
  getUsage: (idOrSlug: string) => ({
    queryKey: [...organisationKeys.detail(idOrSlug), "usage"] as const,
    queryFn: () => getOrganisationUsageAction(idOrSlug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

};
