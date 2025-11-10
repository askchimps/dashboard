/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import axios from "axios";

// Helper function to determine attachment type for Instagram webhook
function getAttachmentTypeForInstagram(fileType: string): string {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  return 'file';
}

// Create axios instance specifically for file uploads
async function createFileUploadAxios() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session?.session?.access_token;

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY,
      // Don't set Content-Type - let axios handle it for FormData
    },
  });
}

export interface MessageAttachment {
  id?: number;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

// Backend-compatible attachment interface
export interface CreateAttachmentData {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

export interface CreateMessageData {
  role: 'user' | 'assistant' | 'bot';
  content?: string;
  message_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF';
  attachments?: CreateAttachmentData[];
  prompt_tokens?: number;
  completion_tokens?: number;
  total_cost?: number;
  instagram_id?: string;
  source?: string;
}

export interface SendMediaMessageData {
  role: 'user' | 'assistant' | 'bot';
  content?: string;
  message_type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF';
  files: File[];
  prompt_tokens?: number;
  completion_tokens?: number;
  total_cost?: number;
  instagram_id?: string;
  source?: string;
}

export interface MessageUploadResult {
  success: boolean;
  data: {
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail_url?: string;
    whatsapp_compatible?: boolean;
    whatsapp_warnings?: string[];
  }
}

// Upload single file
export const uploadFileAction = async (
  file: File,
  category: 'image' | 'video' | 'audio' | 'document'
): Promise<{ success: boolean; data?: MessageUploadResult; message?: string }> => {
  try {
    const axios = await createFileUploadAxios();
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('category', category);

    const response = await axios.post('/v1/upload/single', formData);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('Failed to upload file:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upload file',
    };
  }
};

// Upload multiple files
export const uploadMultipleFilesAction = async (
  files: File[]
): Promise<{ success: boolean; data?: MessageUploadResult[]; message?: string }> => {
  try {
    const uploadResults: MessageUploadResult[] = [];

    for (const file of files) {
      let category: 'image' | 'video' | 'audio' | 'document' = 'document';

      if (file.type.startsWith('image/')) category = 'image';
      else if (file.type.startsWith('video/')) category = 'video';
      else if (file.type.startsWith('audio/')) category = 'audio';

      const result = await uploadFileAction(file, category);
      if (result.success && result.data) {
        uploadResults.push(result.data);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    }

    return {
      success: true,
      data: uploadResults,
    };
  } catch (error: any) {
    console.error('Failed to upload multiple files:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload files',
    };
  }
};

export const sendTextMessageAction = async (
  chatId: string,
  messageData: CreateMessageData
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const axios = await createAuthenticatedAxios();

    const { instagram_id, source, ...rest } = messageData;

    const response = await axios.post(`/v1/chat/${chatId}/message`, rest);

    // Revalidate chat details to reflect new message
    revalidateTag(`chat-details-${chatId}`);

    // Call Instagram webhook if this is an Instagram chat and we have an Instagram ID
    if (messageData.source?.toUpperCase() === "INSTAGRAM" && messageData.instagram_id) {
      try {
        // Create webhook body based on whether message has attachments or not
        const webhookBody = {
          recipient: {
            id: messageData.instagram_id
          },
          message: messageData.attachments && messageData.attachments.length > 0 
            ? {
                attachments: messageData.attachments.map(attachment => ({
                  type: getAttachmentTypeForInstagram(attachment.file_type),
                  payload: {
                    url: attachment.file_url
                  }
                }))
              }
            : {
                text: messageData.content || ""
              }
        };

        const webhookResponse = await fetch(
          'https://www.ai.askchimps.com/webhook/askchimps/sunrooof/dashboard-instagram',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookBody),
          }
        );

        if (!webhookResponse.ok) {
          console.error('Instagram webhook call failed:', webhookResponse.status, webhookResponse.statusText);
        } else {
          console.log('Instagram webhook call successful');
        }
      } catch (webhookError) {
        console.error('Failed to call Instagram webhook:', webhookError);
        // Don't fail the message creation if webhook fails
      }
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('Failed to send text message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message',
    };
  }
};

export const sendMediaMessageAction = async (
  chatId: string,
  messageData: SendMediaMessageData
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    // Upload files first
    const uploadResult = await uploadMultipleFilesAction(messageData.files);

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.message || 'Failed to upload files');
    }

    // Create message with uploaded attachments
    const attachments: CreateAttachmentData[] = uploadResult.data.map(upload => ({
      file_url: upload.data.file_url,
      file_name: upload.data.file_name,
      file_size: upload.data.file_size,
      file_type: upload.data.file_type,
      width: upload.data.width,
      height: upload.data.height,
      duration: upload.data.duration,
      thumbnail_url: upload.data.thumbnail_url,
    }));

    const createMessageData: CreateMessageData = {
      role: messageData.role,
      content: messageData.content,
      message_type: messageData.message_type,
      attachments,
      prompt_tokens: messageData.prompt_tokens,
      completion_tokens: messageData.completion_tokens,
      total_cost: messageData.total_cost,
      instagram_id: messageData.instagram_id,
      source: messageData.source,
    };

    return await sendTextMessageAction(chatId, createMessageData);
  } catch (error: any) {
    console.error('Failed to send media message:', error);
    return {
      success: false,
      message: error.message || 'Failed to send media message',
    };
  }
};

// Combined function to send message with files (simplified API for frontend)
export const sendMessageWithFilesAction = async (
  chatId: string,
  content: string,
  files: File[],
  instagram_id?: string,
  source?: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (files.length === 0) {
      // Send text-only message
      return await sendTextMessageAction(chatId, {
        role: 'assistant',
        content,
        message_type: 'TEXT',
        instagram_id,
        source,
      });
    }

    // Determine message type from first file
    let messageType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'GIF' = 'FILE';
    const firstFile = files[0];

    if (firstFile.type.startsWith('image/')) {
      messageType = firstFile.type === 'image/gif' ? 'GIF' : 'IMAGE';
    } else if (firstFile.type.startsWith('video/')) {
      messageType = 'VIDEO';
    } else if (firstFile.type.startsWith('audio/')) {
      messageType = 'AUDIO';
    }

    return await sendMediaMessageAction(chatId, {
      role: 'assistant',
      content,
      message_type: messageType,
      files,
      instagram_id,
      source,
    });
  } catch (error: any) {
    console.error('Failed to send message with files:', error);
    return {
      success: false,
      message: error.message || 'Failed to send message',
    };
  }
};

export const getUploadValidationInfoAction = async (): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const axios = await createAuthenticatedAxios();

    const response = await axios.get('/v1/upload/validation-info');

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('Failed to get upload validation info:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get upload validation info',
    };
  }
};

export const getWhatsAppLimitsAction = async (): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const axios = await createAuthenticatedAxios();

    const response = await axios.get('/v1/upload/whatsapp-limits');

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('Failed to get WhatsApp limits:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get WhatsApp limits',
    };
  }
};