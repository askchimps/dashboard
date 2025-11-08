"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface Organisation {
  id: number;
  name: string;
  slug: string;
}

export interface LeadOwner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface ZohoLeadDetails {
  id: string;
  lead_id: number;
  lead_owner_id: string;
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
  is_deleted: number;
  created_at: string;
  updated_at: string;
  lead_owner: LeadOwner;
}

export interface CallAgent {
  id: number;
  name: string;
  type: string;
}

export interface CallDetails {
  id: number;
  status: string;
  source: string;
  direction: string;
  from_number: string;
  to_number: string;
  started_at: string;
  ended_at: string;
  duration: number | null;
  summary: string; // JSON string
  analysis: string; // JSON string
  recording_url: string | null;
  call_ended_reason: string;
  total_cost: number;
  agent: CallAgent;
  calculated_cost: number;
}

export interface ChatDetails {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  // Add more chat fields as needed
}

export interface AssignedAgent {
  id: number;
  name: string;
  type: string;
  // Add more agent fields as needed
}

export interface LatestActivity {
  latest_call: {
    id: number;
    status: string;
    started_at: string;
    duration: number | null;
  } | null;
  latest_chat: {
    id: number;
    status: string;
    started_at: string;
  } | null;
}

export interface LeadStats {
  total_calls: number;
  total_chats: number;
  total_interactions: number;
  total_call_cost: number;
  total_chat_cost: number;
  total_cost: number;
  call_breakdown: Record<string, number>;
  chat_breakdown: Record<string, number>;
  latest_activity: LatestActivity;
}

export interface LeadDetails {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  source: string;
  status: string;
  is_indian: number;
  follow_up_count: number;
  reschedule_count: number;
  last_follow_up: string;
  next_follow_up: string | null;
  call_active: number;
  created_at: string;
  updated_at: string;
  organisations: Organisation[];
  zoho_lead: ZohoLeadDetails;
  assigned_agents: AssignedAgent[];
  calls: CallDetails[];
  chats: ChatDetails[];
  stats: LeadStats;
}

export interface LeadDetailsResponse {
  lead: LeadDetails;
}

export const getLeadDetailsAction = async (
  orgSlug: string,
  leadId: string
): Promise<LeadDetails> => {
  const axios = await createAuthenticatedAxios();
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/lead/${leadId}`
  );
  return response.data.data;
};
