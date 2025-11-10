/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import io, { Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

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
    if (!organisationId || !enabled) {
      console.log("🚫 WebSocket connection skipped - organisationId:", organisationId, "enabled:", enabled);
      return;
    }

    try {
      // Use manual WebSocket server for testing
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4022";
      const wsUrl = backendUrl.replace(':4022', ':4023');
      
      // Get access token from Supabase
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      console.log("🔗 Connecting to WebSocket:", wsUrl);
      console.log("🎫 Access token available:", !!accessToken);
      console.log("🏢 Organisation ID:", organisationId);
      console.log("👤 User ID:", userId);

      const socket = io(wsUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        auth: {
          token: accessToken, // Pass token for authentication (if needed)
        },
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected:", socket.id);
        // Join organisation room with userId
        socket.emit("join-organisation", { organisationId, userId });
        console.log("📤 Emitted join-organisation:", { organisationId, userId });
      });

      socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ WebSocket disconnected:", reason);
      });

      socket.on("joined-organisation", (data) => {
        console.log("✅ Joined organisation room:", data.organisationId);
      });

      socket.on("new-message", (data: NewMessageEvent) => {
        console.log("📨 WebSocket new-message event received:", data);
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

      socket.on("connect_error", (error) => {
        console.error("❌ Chat WebSocket connection error:", error);
      });

      socket.on("error", (error) => {
        console.error("❌ Chat WebSocket error:", error);
      });

      socket.on("chat-marked-read", (data) => {
        console.log("📖 Received chat-marked-read event:", data);
        if (data.success && data.chatId) {
          console.log("✅ Chat marked as read successfully, emitting custom event");
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
        console.log("📖 Received chat-read-updated event:", data);
        if (data.chatId !== undefined) {
          console.log("✅ Updating unread count for chat:", data.chatId, "to:", data.unread_count);
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
      console.log("🔌 Disconnecting WebSocket:", socketRef.current.id);
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("✅ WebSocket disconnected and cleaned up");
    } else {
      console.log("🔌 No WebSocket connection to disconnect");
    }
  }, []);

  const markChatAsRead = useCallback(
    (chatId: number) => {
      console.log("📖 markChatAsRead called with chatId:", chatId, "userId:", userId);
      console.log("📖 Socket connected:", !!socketRef.current?.connected);
      
      if (socketRef.current && userId) {
        console.log("📤 Emitting mark-chat-read event:", { chatId, userId });
        socketRef.current.emit("mark-chat-read", { chatId, userId });
      } else {
        console.warn("❌ Cannot mark chat as read - socket or userId missing:", {
          socket: !!socketRef.current,
          socketConnected: !!socketRef.current?.connected,
          userId: userId
        });
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
