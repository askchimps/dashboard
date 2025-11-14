"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface LeadFilters {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  zoho_status?: string;
  zoho_lead_owner?: string;
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

export interface ZohoLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  disposition: string;
  country: string;
  state: string;
  city: string;
  requires_human_action: number;
  is_handled_by_human: number;
  created_at: string;
  updated_at: string;
}

export interface LatestCall {
  id: number;
  status: string;
  direction: string;
  started_at: string;
  ended_at: string;
  duration: number | null;
}

export interface LatestChat {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
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
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  is_indian?: number;
  follow_up_count?: number;
  reschedule_count?: number;
  last_follow_up?: string;
  next_follow_up?: string | null;
  call_active?: number;
  created_at: string;
  updated_at: string;
  zoho_lead?: ZohoLead;
  latest_call?: LatestCall;
  latest_chat?: LatestChat | null;
  total_calls?: number;
  total_chats?: number;

  // Legacy fields for backward compatibility
  agents?: LeadAgent[];
  conversations?: LeadConversation[];
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
  stats: {
    total_leads: number;
    new_leads: number;
    qualified_leads: number;
    junk_leads: number;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  filters?: {
    source?: string;
    status?: string;
    agent?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
  sources?: SourceOption[];
  status?: StatusOption[];
  zoho_statuses?: StatusOption[];
  zoho_lead_owners?: StatusOption[];
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
  if (filters.zoho_status) params.append("zoho_status", filters.zoho_status);
  if (filters.agent) params.append("agent", filters.agent);
  if (filters.search) params.append("search", filters.search);
  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  if (filters.zoho_lead_owner) params.append("zoho_lead_owner", filters.zoho_lead_owner);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/leads${queryString}`
  );

  return response.data.data;
};
