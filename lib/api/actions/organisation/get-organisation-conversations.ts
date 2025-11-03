"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface ConversationFilters {
  page?: number;
  limit?: number;
  source?: string;
  agent?: string;
  type?: "CALL" | "CHAT";
  startDate?: string;
  endDate?: string;
}

export interface ConversationMessage {
  id: number;
  role: "user" | "assistant" | "bot";
  content: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  created_at: string;
  updated_at?: string;
}

export interface ConversationAgent {
  id: number;
  name: string;
  slug: string;
  phone_number?: string | null;
  image_url?: string | null;
  base_prompt?: string;
  initial_prompt?: string | null;
  analysis_prompt?: string | null;
}

export interface ConversationLead {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  is_indian: number;
  additional_info?: Record<string, unknown> | null;
  logs?: Record<string, unknown> | null;
  follow_ups: number;
  created_at: string;
  updated_at: string;
  next_follow_up?: string | null;
  in_process: number;
  // Zoho CRM fields
  zoho_id?: string | null;
  zoho_lead_owner?: string | null;
  zoho_lead_owner_id?: string | null;
  zoho_first_name?: string | null;
  zoho_last_name?: string | null;
  zoho_mobile?: string | null;
  zoho_email?: string | null;
  zoho_status?: string | null;
  zoho_lead_disposition?: string | null;
  zoho_lead_source?: string | null;
  zoho_country?: string | null;
  zoho_state?: string | null;
  zoho_city?: string | null;
  zoho_street?: string | null;
  zoho_description?: string | null;
  // Legacy field for backward compatibility
  name?: string;
}

export interface Conversation {
  id: number;
  name: string;
  type: "CALL" | "CHAT";
  organisation_id: number;
  agent_id: number;
  source: string;
  lead_id?: number | null;
  summary?: string | null;
  analysis?: string | null;
  recording_url?: string | null;
  call_ended_reason?: string | null;
  duration?: number | null;
  prompt_tokens: number;
  completion_tokens: number;
  is_disabled: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  total_cost?: number | null;
  agent?: ConversationAgent;
  lead?: ConversationLead;
  messages?: ConversationMessage[];
  messageStats?: {
    total: number;
    userMessages: number;
    assistantMessages: number;
  };
  topics?: Record<string, unknown>[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    source?: string;
    agent?: string;
    type?: "CALL" | "CHAT";
    startDate?: string;
    endDate?: string;
  };
}

export const getOrganisationConversationsAction = async (
  orgSlug: string,
  filters: ConversationFilters = {}
): Promise<ConversationListResponse> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.source) params.append("source", filters.source);
  if (filters.agent) params.append("agent", filters.agent);
  if (filters.type) params.append("type", filters.type);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/conversations${queryString}`
  );

  return response.data.data;
};

export const getOrganisationConversationDetailsAction = async (
  orgSlug: string,
  conversationId: string
): Promise<Conversation> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(
    `/v1/organisation/${orgSlug}/conversations/${conversationId}`
  );

  return response.data.data.conversation;
};
