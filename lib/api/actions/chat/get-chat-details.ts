"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "bot";
  content: string;
  message_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF';
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
  prompt_tokens: number;
  completion_tokens: number;
  total_cost?: number | null;
  created_at: string;
  updated_at: string;
  agent?: {
    id: number;
    name: string;
  };
}

export interface ChatAgent {
  id: number;
  name: string;
  slug: string;
  phone_number?: string | null;
  base_prompt?: string | null;
  image_url?: string | null;
  initial_prompt?: string | null;
  analysis_prompt?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatLead {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  status?: string | null;
  source?: string | null;
}

export interface ChatOrganisation {
  id: number;
  name: string;
  slug: string;
}

export interface Chat {
  id: number;
  status: string;
  source: string;
  instagram_id?: string;
  whatsapp_id?: string;
  summary?: string;
  analysis?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost?: number | null;
  created_at: string;
  updated_at: string;
  name?: string | null;
  duration?: number | null;
}

export interface ChatDetails {
  organisation: ChatOrganisation;
  chat: Chat;
  lead: ChatLead | null;
  agent: ChatAgent;
  messages: ChatMessage[];
}

export interface ChatDetailsResponse {
  success: boolean;
  message: string;
  data: ChatDetails;
}

export const getChatDetailsAction = async (
  orgSlug: string,
  chatId: string
): Promise<ChatDetails> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get<ChatDetailsResponse>(
    `/v1/organisation/${orgSlug}/chat/${chatId}`
  );

  return response.data.data;
};
