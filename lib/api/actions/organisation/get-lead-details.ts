"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { Lead } from "./get-organisation-leads";

export interface LeadDetailsResponse {
  lead: Lead & {
    conversations: Array<{
      id: number;
      name: string;
      type: "CALL" | "CHAT";
      created_at: string;
      summary?: string;
      duration?: number;
      message_count?: number;
    }>;
  };
}

export const getLeadDetailsAction = async (
  orgSlug: string,
  leadId: string
): Promise<LeadDetailsResponse> => {
  const axios = await createAuthenticatedAxios();
  const response = await axios.get(`/v1/organisation/${orgSlug}/lead/${leadId}`);
  return response.data.data;
};