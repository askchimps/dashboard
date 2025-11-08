"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface CallMessage {
  id: number;
  content: string;
  role: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface CallCost {
  id: number;
  type: string;
  amount: number;
  summary?: string;
  created_at: string;
}

export interface CallDetailsStats {
  total_messages: number;
  message_breakdown: Record<string, number>;
  duration_minutes: number;
  duration_seconds: number;
  total_cost: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_breakdown_by_type: Record<string, number>;
  detailed_costs: CallCost[];
}

export interface CallDetailsOrganisation {
  id: number;
  name: string;
  slug: string;
}

export interface CallDetailsLead {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  source?: string;
  status?: string;
  is_indian: number;
  follow_up_count: number;
  reschedule_count: number;
  last_follow_up?: string;
  next_follow_up?: string;
  call_active: number;
  created_at: string;
  updated_at: string;
}

export interface CallDetailsAgent {
  id: number;
  name: string;
  slug: string;
  phone_number?: string;
  image_url?: string;
  type: string;
  created_at: string;
}

export interface CallDetails {
  id: number;
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
  created_at: string;
  updated_at: string;
  organisation: CallDetailsOrganisation;
  lead: CallDetailsLead;
  agent: CallDetailsAgent;
  messages: CallMessage[];
  stats: CallDetailsStats;
}

export interface CallDetailsAPIResponse {
  success: boolean;
  data: CallDetails;
}

export const getCallDetailsAction = async (
  orgSlug: string,
  callId: string
): Promise<CallDetails> => {
  const axios = await createAuthenticatedAxios();
  const response = await axios.get(
    `/v1/organisation/${orgSlug}/call/${callId}`
  );
  return response.data.data;
};
