"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import io, { Socket } from "socket.io-client";

interface NewMessageEvent {
  chatId: number;
  message: {
    action?: "created" | "updated" | "deleted";
    id: number;
    role: "user" | "assistant" | "bot";
    content: string;
    created_at: string;
    updated_at?: string;
    agent?: {
      id: number;
      name: string;
    };
    chat: {
      id: number;
      unread_count?: number;
    }
  };
  timestamp: string;
}

interface ChatUpdateEvent {
  chatId: number;
  updateData: {
    action: "created" | "updated" | "deleted";
    chat?: any;
    chatId?: number;
  };
  timestamp: string;
}

export function useChatSocket(
  organisationId: number | null,
  userId: string | null,
  enabled: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const connectSocket = useCallback(async () => {
    if (!organisationId || !enabled) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4022";

      const socket = io(`${backendUrl}/chat`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        // Join organisation room with userId
        socket.emit("join-organisation", { organisationId, userId });
      });

      socket.on("joined-organisation", (data) => {
        console.log("✅ Joined organisation room:", data.organisationId);
      });

      socket.on("new-message", (data: NewMessageEvent) => {
        const { chatId, message } = data;

        if (message.action === "created") {
          // Emit custom event for component to listen to
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chat-socket-update', {
              detail: {
                type: 'new-message',
                chatId,
                message,
                timestamp: Date.now()
              }
            }));
          }
          
          // Optimistically update chat list to immediately show new unread count
          queryClient.setQueryData(
            ["organisation", "chats"],
            (oldData: any) => {
              if (!oldData?.chats) return oldData;

              // Create completely new objects to ensure React detects changes
              const newChats = oldData.chats.map((chat: any) => {
                if (chat.id === chatId) {
                  const newUnreadCount = message.chat.unread_count || (chat.unread_count || 0) + 1;
                  
                  return {
                    ...chat,
                    unread_count: newUnreadCount,
                    updated_at: message.created_at,
                    _lastUpdated: Date.now()
                  };
                }
                return { ...chat }; // Create new object even for unchanged chats
              });              const updatedData = {
                ...oldData,
                chats: newChats,
                // Add timestamp to force change detection
                _cacheUpdated: Date.now()
              };
              
              return updatedData;
            }
          );

          // Alternative approach: Also trigger a mutation to force re-render
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
            refetchType: 'none', // Don't refetch, just notify observers
            exact: true
          });

          // Optimistically update chat details if that chat is currently viewed
          queryClient.setQueryData(
            ["chat", "details", chatId.toString()],
            (oldData: any) => {
              if (!oldData) return oldData;

              const updatedDetails = {
                ...oldData,
                messages: [...(oldData.messages || []), message],
                chat: {
                  ...oldData.chat,
                  unread_count: message.chat.unread_count || (oldData.chat.unread_count || 0) + 1,
                  updated_at: message.created_at,
                },
              };
              
              return updatedDetails;
            }
          );
        } else if (message.action === "updated") {
          // Update specific message in chat details
          queryClient.setQueryData(
            ["chat", "details", chatId.toString()],
            (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                messages: oldData.messages?.map((msg: any) =>
                  msg.id === message.id ? { ...msg, ...message } : msg
                ),
                chat: {
                  ...oldData.chat,
                  updated_at: new Date().toISOString(),
                },
              };
            }
          );
        } else if (message.action === "deleted") {
          // Remove message from chat details
          queryClient.setQueryData(
            ["chat", "details", chatId.toString()],
            (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                messages: oldData.messages?.filter((msg: any) => msg.id !== message.id),
                chat: {
                  ...oldData.chat,
                  updated_at: new Date().toISOString(),
                },
              };
            }
          );
        }
      });

      socket.on("chat-updated", (data: ChatUpdateEvent) => {
        console.log("💬 Chat updated:", data);

        const { chatId, updateData } = data;

        if (updateData.action === "created") {
          // Invalidate chat list to show new chat
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
          });
        } else if (updateData.action === "updated") {
          // Update chat in list and details
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
          });

          queryClient.setQueryData(
            ["chat", "details", chatId.toString()],
            (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                chat: {
                  ...oldData.chat,
                  ...updateData.chat,
                },
              };
            }
          );
        } else if (updateData.action === "deleted") {
          // Remove chat from list
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
          });

          // Optionally clear chat details
          queryClient.removeQueries({
            queryKey: ["chat", "details", chatId.toString()],
          });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Chat WebSocket disconnected:", reason);
      });

      socket.on("error", (error) => {
        console.error("❌ Chat WebSocket error:", error);
      });

      socket.on("chat-marked-read", (data) => {
        if (data.success && data.chatId) {
          // Emit custom event for component
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chat-socket-update', {
              detail: {
                type: 'chat-read',
                chatId: data.chatId,
                timestamp: Date.now()
              }
            }));
          }
          
          // Optimistically update chat list to immediately reset unread count
          queryClient.setQueryData(
            ["organisation", "chats"],
            (oldData: any) => {
              if (!oldData?.chats) return oldData;

              const newChats = oldData.chats.map((chat: any) => {
                if (chat.id === data.chatId) {
                  return {
                    ...chat,
                    unread_count: 0,
                    _lastUpdated: Date.now()
                  };
                }
                return { ...chat };
              });

              return {
                ...oldData,
                chats: newChats,
                _cacheUpdated: Date.now()
              };
            }
          );

          // Trigger invalidation immediately
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
            refetchType: 'none',
            exact: true
          });

          // Update chat details unread count as well
          queryClient.setQueryData(
            ["chat", "details", data.chatId.toString()],
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                chat: {
                  ...oldData.chat,
                  unread_count: 0,
                },
              };
            }
          );
        }
      });

      socket.on("chat-read-updated", (data) => {
        if (data.chatId !== undefined) {
          // Optimistically update specific chat's unread count
          queryClient.setQueryData(
            ["organisation", "chats"],
            (oldData: any) => {
              if (!oldData?.chats) return oldData;

              const newChats = oldData.chats.map((chat: any) => {
                if (chat.id === data.chatId) {
                  return {
                    ...chat,
                    unread_count: data.unread_count || 0,
                    _lastUpdated: Date.now()
                  };
                }
                return { ...chat };
              });

              return {
                ...oldData,
                chats: newChats,
                _cacheUpdated: Date.now()
              };
            }
          );

          // Trigger invalidation immediately
          queryClient.invalidateQueries({
            queryKey: ["organisation", "chats"],
            refetchType: 'none',
            exact: true
          });
        }
      });

      socketRef.current = socket;
    } catch (error) {
      console.error("Failed to connect chat WebSocket:", error);
    }
  }, [organisationId, userId, enabled, queryClient]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const markChatAsRead = useCallback(
    (chatId: number) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("mark-chat-read", { chatId, userId });
      }
    },
    [userId]
  );

  useEffect(() => {
    if (enabled && organisationId) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, enabled, organisationId]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    markChatAsRead,
  };
}
