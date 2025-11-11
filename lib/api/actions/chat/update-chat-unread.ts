"use server";
import { createAuthenticatedAxios } from "@/lib/api/axios";

export const updateChatUnreadMessagesAction = async (
  chatId: string | number,
  orgSlug: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const axios = await createAuthenticatedAxios();
    const response = await axios.put(`/v1/chat/${chatId}/${orgSlug}`, {
      unread_messages: 0,
      organisation: orgSlug
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Failed to update chat unread_messages:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update chat unread_messages",
    };
  }
};
