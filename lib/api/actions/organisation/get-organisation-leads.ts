"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface LeadFilters {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  agent?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadAgent {
  id: number;
  name: string;
  slug: string;
}

export interface LeadConversation {
  id: number;
  name: string;
  type: "CALL" | "CHAT";
  created_at: string;
  summary?: string;
  duration?: number;
  message_count?: number;
}

export interface Lead {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  is_indian?: number;
  additional_info?: Record<string, unknown>;
  logs?: Record<string, unknown>;
  follow_ups?: number;
  next_follow_up?: string;
  in_process?: number;
  created_at: string;
  updated_at: string;

  // Zoho CRM fields
  zoho_id?: string;
  zoho_lead_owner?: string;
  zoho_lead_owner_id?: string;
  zoho_first_name?: string;
  zoho_last_name?: string;
  zoho_mobile?: string;
  zoho_email?: string;
  zoho_status?: string;
  zoho_lead_disposition?: string;
  zoho_lead_source?: string;
  zoho_country?: string;
  zoho_state?: string;
  zoho_city?: string;
  zoho_street?: string;
  zoho_description?: string;

  agents: LeadAgent[];
  conversations: LeadConversation[];
}

export interface StatusOption {
  label: string;
  value: string;
}

export interface SourceOption {
  label: string;
  value: string;
}

export interface LeadListResponse {
  leads: Lead[];
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
    status?: string;
    agent?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
  sources?: SourceOption[];
  status?: StatusOption[];
}

export const getOrganisationLeadsAction = async (
  orgSlug: string,
  filters: LeadFilters = {}
): Promise<LeadListResponse> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.source) params.append("source", filters.source);
  if (filters.status) params.append("status", filters.status);
  if (filters.agent) params.append("agent", filters.agent);
  if (filters.search) params.append("search", filters.search);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/leads${queryString}`
  );

  return response.data.data;
};
