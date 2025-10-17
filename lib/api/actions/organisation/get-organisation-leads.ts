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
  type: 'CALL' | 'CHAT';
  created_at: string;
}

export interface Lead {
  id: number;
  name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  additional_info?: any;
  follow_ups?: any;
  created_at: string;
  updated_at: string;
  agents: LeadAgent[];
  conversations: LeadConversation[];
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
}

export const getOrganisationLeadsAction = async (
  orgSlug: string,
  filters: LeadFilters = {}
): Promise<LeadListResponse> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.source) params.append('source', filters.source);
  if (filters.status) params.append('status', filters.status);
  if (filters.agent) params.append('agent', filters.agent);
  if (filters.search) params.append('search', filters.search);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await axios.get(`/v1/organisation/${orgSlug}/leads${queryString}`);

  return response.data.data;
};