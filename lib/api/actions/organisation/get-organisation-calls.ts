"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface CallFilters {
  page?: number;
  limit?: number;
  status?: string;
  direction?: string;
  source?: string;
  start_date?: string;
  end_date?: string;
}

export interface CallLead {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CallAgent {
  id: number;
  name: string;
  phone_number?: string;
  created_at: string;
}

export interface Call {
  id: number;
  organisation_id: number;
  agent_id: number;
  lead_id: number;
  status: string;
  source: string;
  direction: string;
  from_number: string;
  to_number: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  summary?: string;
  analysis?: string;
  recording_url?: string;
  call_ended_reason?: string;
  total_cost?: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  lead?: CallLead;
  agent?: CallAgent;
}

export interface CallStats {
  total_calls: number;
  missed_calls: number;
  active_calls: number;
  disconnected_calls: number;
}

export interface CallPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CallsResponse {
  calls: Call[];
  stats: CallStats;
  pagination: CallPagination;
}

export interface CallsAPIResponse {
  success: boolean;
  data: CallsResponse;
}

export const getOrganisationCallsAction = async (
  orgSlug: string,
  filters: CallFilters
): Promise<CallsResponse> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.status) params.append("status", filters.status);
  if (filters.direction) params.append("direction", filters.direction);
  if (filters.source) params.append("source", filters.source);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/calls${queryString}`
  );

  return response.data.data;
};
