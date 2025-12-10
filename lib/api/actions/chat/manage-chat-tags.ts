"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface ChatTagItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AddTagsResponse {
  message: string;
  data: {
    chat_id: number;
    added_tags: number[];
    all_tags?: ChatTagItem[];
    existing_tags?: number[];
  };
}

export interface RemoveTagsResponse {
  message: string;
  data: {
    chat_id: number;
    removed_tags: number[];
    remaining_tags: ChatTagItem[];
  };
}

export const addChatTagsAction = async (
  chatId: number | string,
  orgSlug: string,
  tagIds: number[]
): Promise<AddTagsResponse> => {
  const axios = await createAuthenticatedAxios();
  const response = await axios.post<AddTagsResponse>(
    `/v1/organisation/${orgSlug}/chat/${chatId}/tags`,
    {
      tag_ids: tagIds,
    }
  );

  return response.data;
};

export const removeChatTagsAction = async (
  chatId: number | string,
  orgSlug: string,
  tagIds: number[]
): Promise<RemoveTagsResponse> => {
  const axios = await createAuthenticatedAxios();
  const response = await axios.delete<RemoveTagsResponse>(
    `/v1/organisation/${orgSlug}/chat/${chatId}/tags`,
    {
      data: {
        tag_ids: tagIds,
      },
    }
  );

  return response.data;
};
