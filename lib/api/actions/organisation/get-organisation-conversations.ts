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
}

export interface ConversationLead {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  additional_info?: Record<string, unknown>;
  follow_ups?: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  name: string;
  type: "CALL" | "CHAT";
  organisation_id?: number;
  agent_id?: number;
  source: string;
  lead_id?: number;
  summary?: string;
  analysis?: string;
  recording_url?: string;
  duration?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  is_disabled?: number;
  is_deleted?: number;
  created_at: string;
  updated_at: string;
  agent?: ConversationAgent;
  lead?: ConversationLead;
  messages?: ConversationMessage[];
  messageStats?: {
    total: number;
    userMessages: number;
    assistantMessages: number;
  };
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

export interface ConversationDetails extends Omit<Conversation, "agent"> {
  agent?: ConversationAgent & {
    phone_number?: string;
    image_url?: string;
    base_prompt?: string;
    initial_prompt?: string;
    analysis_prompt?: string;
  };
  topics?: Record<string, unknown>[];
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
): Promise<ConversationDetails> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(
    `/v1/organisation/${orgSlug}/conversations/${conversationId}`
  );

  return response.data.data.conversation;
};
