"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface ChatFilters {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChatAgent {
  id: number;
  name: string;
}

export interface ChatLead {
  id: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  status?: string;
}

export interface ChatMessage {
  id: number;
  role: string;
  content?: string | null;
  message_type?: string;
  created_at: string;
  attachments?: Array<{
    id: number;
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail_url?: string;
  }>;
}

export interface Chat {
  id: number;
  status: string;
  source: string;
  summary: string;
  created_at: string;
  updated_at: string;
  name?: string | null;
  lead_id?: number | null;
  lead?: ChatLead;
  agent?: ChatAgent;
  messages?: ChatMessage[];
  total_cost?: number | null;
  unread_messages?: number;
  human_handled?: number
}

export interface ChatSummary {
  totalChats: number;
  openChats: number;
  handoverChats: number;
  completedChats: number;
  chatsWithLead: number;
  chatsWithoutLead: number;
}

export interface ChatsResponse {
  organisation: {
    id: number;
    name: string;
    slug: string;
  };
  chats: Chat[];
  summary: ChatSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    startDate: string | null;
    endDate: string | null;
    status: string | null;
    source: string | null;
  };
}

export const getChatsAction = async (
  orgSlug: string,
  filters: ChatFilters = {}
): Promise<ChatsResponse> => {
  const axios = await createAuthenticatedAxios();
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.source) params.append("source", filters.source);
  if (filters.status) params.append("status", filters.status);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/chats${queryString}`
  );

  return response.data.data;
};
