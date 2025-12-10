"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface UpdateChatHandoverResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    human_handled: number;
  };
}

export const updateChatHandoverAction = async (
  chatId: number | string,
  orgSlug: string,
  humanHandled: boolean
): Promise<void> => {
  const axios = await createAuthenticatedAxios();
  await axios.patch<UpdateChatHandoverResponse>(
    `/v1/organisation/${orgSlug}/chat/${chatId}/handover`,
    {
      human_handled: humanHandled ? 1 : 0,
    }
  );
};
