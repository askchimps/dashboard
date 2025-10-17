import { getOrganisationAction } from "@/lib/api/actions/organisation/get-organisation";
import { getOrganisationAgentsAction } from "@/lib/api/actions/organisation/get-organisation-agents";
import {
  getOrganisationAnalyticsAction,
  type AnalyticsFilters,
} from "@/lib/api/actions/organisation/get-organisation-analytics";
import {
  getOrganisationConversationsAction,
  getOrganisationConversationDetailsAction,
  type ConversationFilters,
} from "@/lib/api/actions/organisation/get-organisation-conversations";
import {
  getOrganisationLeadsAction,
  type LeadFilters,
} from "@/lib/api/actions/organisation/get-organisation-leads";
import { getOrganisationOverviewAction } from "@/lib/api/actions/organisation/get-organisation-overview";
import { getOrganisationUsageAction } from "@/lib/api/actions/organisation/get-organisation-usage";
import { getOrganisationsAction } from "@/lib/api/actions/organisation/get-organisations";

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
  getOverview: (orgSlug: string, startDate?: string, endDate?: string) => ({
    queryKey: ["organisation", orgSlug, "overview", startDate, endDate],
    queryFn: () => getOrganisationOverviewAction(orgSlug, startDate, endDate),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }),
  getConversations: (orgSlug: string, filters: ConversationFilters) => ({
    queryKey: ["organisation", orgSlug, "conversations", filters],
    queryFn: () => getOrganisationConversationsAction(orgSlug, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  }),
  getConversationDetails: (orgSlug: string, conversationId: string) => ({
    queryKey: ["organisation", orgSlug, "conversation", conversationId],
    queryFn: () =>
      getOrganisationConversationDetailsAction(orgSlug, conversationId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes,
    enabled: !!conversationId,
  }),
  getLeads: (orgSlug: string, filters: LeadFilters) => ({
    queryKey: ["organisation", orgSlug, "leads", filters],
    queryFn: () => getOrganisationLeadsAction(orgSlug, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  }),
  getAnalytics: (orgSlug: string, filters?: AnalyticsFilters) => ({
    queryKey: ["organisation", orgSlug, "analytics", filters],
    queryFn: () => getOrganisationAnalyticsAction(orgSlug, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  }),
};
