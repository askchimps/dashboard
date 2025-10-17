"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export type CONVERSATION_TYPE = "CHAT" | "CALL";

export interface AnalyticsFilters {
  agent?: string;
  source?: string;
  type?: CONVERSATION_TYPE;
  startDate?: string;
  endDate?: string;
}

export interface ConversationAnalytics {
  totalConversations: number;
  totalCalls: number;
  averageConversationLength: number;
  averageCallLength: number;
  totalLeadsGenerated: number;
}

export interface DailyAnalyticsBreakdown {
  date: string;
  conversations: number;
  calls: number;
  leads: number;
}

export interface AnalyticsResponse {
  creditsPlan: string;
  remainingConversationCredits: number;
  remainingCallCredits: number;
  usedConversationCredits: number;
  usedCallCredits: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  conversationAnalytics: ConversationAnalytics;
  dailyBreakdown: DailyAnalyticsBreakdown[];
  filters: {
    agent?: string;
    source?: string;
    type?: CONVERSATION_TYPE;
  };
}

export async function getOrganisationAnalyticsAction(
  orgSlug: string,
  filters?: AnalyticsFilters
): Promise<AnalyticsResponse> {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();

  // Add query parameters if provided
  if (filters?.agent) params.append("agent", filters.agent);
  if (filters?.source) params.append("source", filters.source);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/analytics${queryString}`
  );

  return response.data.data;
}
