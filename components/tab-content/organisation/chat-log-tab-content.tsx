/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MessageCircle,
  User,
  Activity,
  CheckCircle2,
  Clock,
  MessageSquareText,
} from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatFilters } from "@/lib/api/actions/chat/get-chats";
import { chatQueries } from "@/lib/query/organisation.query";
import { useChatSocket } from "@/lib/hooks/use-chat-socket";
import { createClient } from "@/lib/supabase/client";
import { MessageItem, type EnhancedMessage } from "@/components/chat/message-item";
import { MessageInput } from "@/components/chat/message-input";

export default function ChatLogTabContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orgSlug = params.orgSlug as string;

  // Get chat ID from query parameter
  const chatFromQuery = searchParams.get("chat");

  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chatFromQuery
  );
  const [activeTab, setActiveTab] = useState("messages");
  const [userId, setUserId] = useState<string | null>(null);
  const [localChats, setLocalChats] = useState<any[]>([]);
  const [lastWebSocketUpdate, setLastWebSocketUpdate] = useState<number>(0);
  const [filters, setFilters] = useState<ChatFilters>({
    page: 1,
    limit: 50,
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Refs for scroll management
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user ID from Supabase
  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Update selected chat when query parameter changes
  useEffect(() => {
    if (chatFromQuery) {
      setSelectedChatId(chatFromQuery);
    }
  }, [chatFromQuery]);

  // API Integration
  const { data: chatsData, isLoading } = useQuery({
    ...chatQueries.getChats(orgSlug, filters),
  });

  const { data: selectedChatDetails, isLoading: isLoadingDetails } = useQuery({
    ...chatQueries.getChatDetails(orgSlug, selectedChatId || ""),
    enabled: !!selectedChatId,
  });

  // WebSocket Integration for real-time updates
  const organisationId = chatsData?.organisation?.id || null;
  console.log('🏢 Organisation ID for WebSocket:', organisationId);
  console.log('👤 User ID for WebSocket:', userId);

  const { isConnected, markChatAsRead } = useChatSocket(organisationId, userId, !!organisationId);
  console.log('🔌 WebSocket connected:', isConnected);

  // Sync local chats with API data
  useEffect(() => {
    if (chatsData?.chats) {
      setLocalChats(chatsData.chats);
    }
  }, [chatsData]);

  // Create a custom WebSocket handler that updates local state
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('🔌 WebSocket message received:', data);
    console.log('🔌 Message type:', data?.type);
    console.log('🔌 Chat ID:', data?.chatId);
    console.log('🔌 Current selected chat ID:', selectedChatId);

    try {
      if (data?.type === 'new-message' && data?.chatId && data?.message?.action === 'created') {
        console.log('✅ Processing new message');
        console.log('📝 Message details:', data.message);

        setLocalChats(prevChats => {
          console.log('📊 Previous chats count:', prevChats.length);
          const updatedChats = prevChats.map(chat => {
            if (chat?.id === data.chatId) {
              console.log(`🔄 Updating chat ${chat.id} with new message`);
              const newUnreadCount = data.message?.chat?.unread_count || (chat?.unread_count || 0) + 1;

              return {
                ...chat,
                unread_count: newUnreadCount,
                updated_at: data.message?.created_at || chat.updated_at,
              };
            }
            return chat;
          });

          setLastWebSocketUpdate(Date.now());
          console.log('⏰ Set lastWebSocketUpdate to:', Date.now());

          // Check if the message is for the currently selected chat
          if (selectedChatId && data.chatId?.toString() === selectedChatId) {
            console.log('🎯 Message is for current chat, refreshing chat details...');
            // Refresh the chat details to get the new message
            queryClient.invalidateQueries({
              queryKey: chatQueries.getChatDetails(orgSlug, selectedChatId).queryKey,
            });
            console.log('🔄 Query invalidated for chat:', selectedChatId);

            setTimeout(() => {
              if (markChatAsRead) {
                console.log('✅ Marking chat as read:', data.chatId);
                markChatAsRead(data.chatId);
              }
            }, 1000);
          }
          else {
            console.log('❌ Message is NOT for current chat');
            console.log('   - selectedChatId:', selectedChatId);
            console.log('   - message chatId:', data.chatId?.toString());
          }

          console.log('✅ Updated chats state with new message');
          console.log('📊 New chats count:', updatedChats.length);
          return updatedChats;
        });
      } else if (data?.type === 'new-chat' && data?.chat) {
        console.log('✅ Processing new chat creation');
        console.log('💬 New chat details:', data.chat);

        setLocalChats(prevChats => {
          console.log('📊 Previous chats count:', prevChats.length);

          // Check if chat already exists (avoid duplicates)
          const existingChat = prevChats.find(chat => chat.id === data.chat.id);
          if (existingChat) {
            console.log('⚠️ Chat already exists, skipping addition');
            return prevChats;
          }

          // Add new chat to the beginning of the list
          const updatedChats = [data.chat, ...prevChats];

          setLastWebSocketUpdate(Date.now());
          console.log('⏰ Set lastWebSocketUpdate to:', Date.now());

          console.log('✅ Added new chat to state');
          console.log('📊 New chats count:', updatedChats.length);
          console.log(`🆕 New chat #${data.chat.id} from ${data.chat.source} source added`);

          return updatedChats;
        });
      } else if (data.type === 'chat-read' && data?.chatId) {
        console.log('✅ Processing chat read event');
        console.log('💬 Chat ID:', data.chatId);

        setLocalChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === data.chatId) {
              console.log(`🔄 Marking chat ${chat.id} as read`);
              return {
                ...chat,
                unread_count: 0,
              };
            }
            return chat;
          });

          console.log('✅ Updated chats state with read status');
          return updatedChats;
        });
      } else if (data.type === 'chat-updated' && data?.chatId) {
        console.log('✅ Processing chat updated event');
        console.log('💬 Chat details:', data.updateData.chat);

        setLocalChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === data.chatId) {
              console.log(`🔄 Updating chat ${chat.id}`);
              return {
                ...chat,
                ...data.updateData.chat,
              };
            }
            return chat;
          });

          console.log('✅ Updated chats state with new chat details');
          return updatedChats;
        });
      }
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }

  }, [selectedChatId, queryClient, orgSlug]);

  // Listen for WebSocket events through custom events
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      handleWebSocketMessage(event.detail);
    };

    window.addEventListener('chat-socket-update', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('chat-socket-update', handleCustomEvent as EventListener);
    };
  }, [handleWebSocketMessage]);

  // Mark chat as read when selected
  useEffect(() => {
    console.log("🎯 Chat selection effect triggered:", { selectedChatId, markChatAsReadAvailable: !!markChatAsRead });
    if (selectedChatId && markChatAsRead) {
      console.log("📖 Calling markChatAsRead for selected chat:", selectedChatId);
      markChatAsRead(parseInt(selectedChatId));
    }
  }, [selectedChatId, markChatAsRead]);

  // Scroll utility functions (moved before useEffects that use them)
  const scrollToBottom = useCallback((force = false) => {
    if (messagesContainerRef.current) {
      if (force || isNearBottom) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, [isNearBottom]);

  const checkScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 150; // pixels from bottom
      const isNear = scrollHeight - (scrollTop + clientHeight) <= threshold;
      setIsNearBottom(isNear);
    }
  }, []);

  const handleScroll = useCallback(() => {
    checkScrollPosition();

    // Only set user scrolling if they scroll away from the bottom
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 150;
      const isNear = scrollHeight - (scrollTop + clientHeight) <= threshold;

      if (!isNear) {
        setIsUserScrolling(true);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Set user scrolling to false after 3 seconds of no scrolling
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false);
        }, 3000);
      } else {
        // If user scrolled back to bottom, allow auto-scroll again
        setIsUserScrolling(false);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      }
    }
  }, [checkScrollPosition]);

  // Auto-scroll when chat is first opened
  useEffect(() => {
    if (selectedChatDetails?.messages && selectedChatDetails.messages.length > 0) {
      // Always scroll to bottom when opening a chat (only when chatId changes)
      setTimeout(() => {
        scrollToBottom(true);
        setIsNearBottom(true);
        setIsUserScrolling(false);
      }, 100);
    }
  }, [selectedChatId]); // Only depend on selectedChatId, not messages length

  // Auto-scroll when new messages arrive (only if user is near bottom and not scrolling)
  useEffect(() => {
    console.log('📜 Auto-scroll effect triggered');
    console.log('   - Messages count:', selectedChatDetails?.messages?.length);
    console.log('   - isUserScrolling:', isUserScrolling);
    console.log('   - isNearBottom:', isNearBottom);

    if (selectedChatDetails?.messages && selectedChatDetails.messages.length > 0 && !isUserScrolling && isNearBottom) {
      console.log('✅ Auto-scrolling to bottom (new message)');
      // Only scroll if we're near the bottom and not actively scrolling
      setTimeout(() => {
        scrollToBottom(false);
      }, 20);
    } else {
      console.log('❌ Auto-scroll conditions not met');
    }
  }, [selectedChatDetails?.messages?.length, isUserScrolling, isNearBottom, scrollToBottom]); // Re-add necessary dependencies

  // Handle real-time updates from socket specifically
  useEffect(() => {
    console.log('🔄 Socket update effect triggered');
    console.log('   - lastWebSocketUpdate:', lastWebSocketUpdate);
    console.log('   - selectedChatId:', selectedChatId);
    console.log('   - isUserScrolling:', isUserScrolling);
    console.log('   - isNearBottom:', isNearBottom);

    // This effect specifically handles socket updates that might not trigger message length change immediately
    if (lastWebSocketUpdate > 0 && selectedChatId && !isUserScrolling && isNearBottom) {
      console.log('✅ Auto-scrolling to bottom (socket update)');
      setTimeout(() => {
        scrollToBottom(false);
      }, 200); // Slightly longer delay for socket updates
    } else {
      console.log('❌ Socket auto-scroll conditions not met');
    }
  }, [lastWebSocketUpdate, selectedChatId, isUserScrolling, isNearBottom, scrollToBottom]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate: startDate,
      endDate: endDate,
      page: 1,
    }));
    setSelectedChatId(null);
  };

  // Callback after message is sent to refresh chat details
  const handleMessageSent = useCallback(() => {
    if (selectedChatId) {
      // Invalidate the chat details query to refresh messages
      queryClient.invalidateQueries({
        queryKey: chatQueries.getChatDetails(orgSlug, selectedChatId).queryKey,
      });

      // Force scroll to bottom when sending a message
      setTimeout(() => {
        scrollToBottom(true);
        setIsNearBottom(true);
      }, 200);
    }
  }, [selectedChatId, orgSlug, queryClient, scrollToBottom]);

  const chats = localChats.length > 0 ? localChats : (chatsData?.chats || []);

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const lowerSource = source?.toLowerCase() || "";
    if (lowerSource.includes("whatsapp")) return "bg-green-100 text-green-800";
    if (lowerSource.includes("instagram")) return "bg-pink-100 text-pink-800";
    if (lowerSource.includes("facebook")) return "bg-blue-100 text-blue-800";
    if (lowerSource.includes("telegram")) return "bg-cyan-100 text-cyan-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <SectionHeader label="Chat Logs" />
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="mr-1.5 h-2 w-2 rounded-full bg-green-600"></div>
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            onApply={handleDateRangeApply}
            startDate={filters.startDate}
            endDate={filters.endDate}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        chatsData && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Chats
                </CardTitle>
                <MessageSquare className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatsData.summary.totalChats}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Chats
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <Clock className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatsData.summary.openChats}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  With Lead
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatsData.summary.chatsWithLead}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Without Lead
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  <MessageSquareText className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatsData.summary.chatsWithoutLead}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-100px)] flex-col gap-6 lg:flex-row">
        {/* Left Panel - Chats List */}
        <div className="h-80 w-full lg:h-full lg:w-80 lg:flex-shrink-0">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-1 p-2">
                    {/* Skeleton loading for chat list */}
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-transparent p-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !chats.length ? (
                  <div className="flex h-full items-center justify-center p-6 text-center">
                    <div className="space-y-4">
                      <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                        <MessageSquare className="text-muted-foreground h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-foreground font-medium">
                          No chat logs yet
                        </h3>
                        <p className="text-muted-foreground max-w-sm text-sm">
                          Chat logs will appear here when customers start
                          chatting with your agents
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          try {
                            const chatIdString = chat.id?.toString();
                            if (chatIdString) {
                              setSelectedChatId(chatIdString);
                              router.push(`/${orgSlug}/chat-logs?chat=${chat.id}`, {
                                scroll: false,
                              });
                            }
                          } catch (error) {
                            console.error('Error selecting chat:', error);
                          }
                        }}
                        className={`hover:bg-muted/70 cursor-pointer rounded-xl p-5 mb-2 transition-all duration-200 hover:shadow-sm ${selectedChatId === chat.id?.toString()
                          ? "bg-muted border-border border shadow-sm ring-1 ring-blue-100"
                          : "hover:border-muted border border-transparent"
                          }${chat.human_handled ? "border border-red-500" : " "}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-foreground line-clamp-1 text-sm font-semibold leading-tight">
                                    {chat?.name || chat?.lead?.phone_number || "Unknown User"}
                                  </h4>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs font-semibold ${getSourceBadgeColor(chat?.source || 'unknown')}`}
                                  >
                                    {chat?.source || 'Unknown'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col gap-3 items-end">
                                <span className="text-muted-foreground shrink-0 text-xs font-medium">
                                  {chat?.updated_at ? formatTimeAgo(chat.updated_at) : 'Unknown time'}
                                </span>
                                {(() => {
                                  const unreadCount = Number(chat?.unread_count || 0);
                                  const shouldShow = chat?.unread_count && unreadCount > 0;

                                  return shouldShow ? (
                                    <Badge className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold hover:bg-red-600">
                                      {chat.unread_count}
                                    </Badge>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                            {chat?.summary && (
                              <p className="text-muted-foreground mt-2.5 line-clamp-2 text-xs leading-relaxed">
                                {chat.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Details Interface */}
        <div className="min-h-0 min-w-0 flex-1">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            {selectedChatId && isLoadingDetails ? (
              <div className="flex h-full flex-col">
                {/* Header Skeleton */}
                <div className="border-border border-b p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tabs Skeleton */}
                <div className="flex border-b px-6">
                  <div className="px-4 py-3">
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="px-4 py-3">
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 overflow-hidden p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                      >
                        {index % 2 === 0 && (
                          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                        )}
                        <div className="max-w-[80%] space-y-2">
                          <Skeleton className="h-16 w-full rounded-lg" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        {index % 2 === 1 && (
                          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedChatId && selectedChatDetails ? (
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="border-border border-b p-7">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-base font-semibold text-green-700">
                        {selectedChatDetails.lead?.first_name?.[0] ||
                          selectedChatDetails.lead?.last_name?.[0] ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-foreground text-lg font-bold">
                        {selectedChatDetails.lead?.first_name ||
                          selectedChatDetails.lead?.last_name
                          ? `${selectedChatDetails.lead.first_name ?? ""} ${selectedChatDetails.lead.last_name ?? ""}`
                          : selectedChatDetails.lead?.phone_number ||
                          "Unknown User"}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getSourceBadgeColor(selectedChatDetails.chat.source)}`}
                        >
                          {selectedChatDetails.chat.source}
                        </Badge>
                        • Chat Session
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tabs */}
                <div className="flex border-b bg-gray-50/50 px-7">
                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`border-b-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${activeTab === "messages"
                      ? "border-primary text-primary -mb-px bg-white"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
                      }`}
                  >
                    <MessageCircle className="mr-2.5 inline h-4 w-4" />
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`border-b-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${activeTab === "details"
                      ? "border-primary text-primary -mb-px bg-white"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
                      }`}
                  >
                    <Activity className="mr-2.5 inline h-4 w-4" />
                    Details & Analysis
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "messages" ? (
                    <div className="h-full p-3">
                      {!selectedChatDetails.messages ||
                        selectedChatDetails.messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center">
                          <div className="space-y-4">
                            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                              <MessageCircle className="text-muted-foreground h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-foreground font-medium">
                                No messages yet
                              </h3>
                              <p className="text-muted-foreground max-w-sm text-sm">
                                No messages found for this chat. The conversation
                                may not have started yet.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div
                            ref={messagesContainerRef}
                            className="flex-1 space-y-6 overflow-y-auto px-1 pb-4"
                            onScroll={handleScroll}
                          >
                            {selectedChatDetails.messages?.map((message) => (
                              message?.id ? (
                                <MessageItem
                                  key={message.id}
                                  message={message as EnhancedMessage}
                                />
                              ) : null
                            )) || null}
                          </div>

                          {/* Message Input */}
                          <MessageInput
                            chatId={selectedChatId}
                            chatSource={selectedChatDetails?.chat?.source}
                            chatInstagramId={selectedChatDetails?.chat?.instagram_id}
                            chatWhatsAppId={selectedChatDetails?.chat?.whatsapp_id}
                            onMessageSent={handleMessageSent}
                            placeholder="Type your message..."
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-7">
                      <div className="space-y-8">
                        {/* Chat Information */}
                        <div>
                          <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                              <MessageSquare className="h-4 w-4 text-blue-700" />
                            </div>
                            <h4 className="text-foreground text-sm font-bold tracking-tight">
                              Chat Information
                            </h4>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                            <div className="space-y-4 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Source:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={getSourceBadgeColor(
                                    selectedChatDetails.chat.source
                                  )}
                                >
                                  {selectedChatDetails.chat.source}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Status:
                                </span>
                                <span className="text-foreground font-semibold capitalize">
                                  {selectedChatDetails.chat.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Messages:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedChatDetails.messages?.length || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Started:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {formatDateTime(selectedChatDetails.chat.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Last Updated:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {formatDateTime(selectedChatDetails.chat.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lead Information */}
                        {selectedChatDetails.lead && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                                <User className="h-4 w-4 text-green-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Lead Information
                              </h4>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                              <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground font-medium">
                                    Name:
                                  </span>
                                  <span className="text-foreground font-semibold">
                                    {selectedChatDetails.lead.first_name ||
                                      selectedChatDetails.lead.last_name
                                      ? `${selectedChatDetails.lead.first_name ?? ""} ${selectedChatDetails.lead.last_name ?? ""}`
                                      : selectedChatDetails.lead.phone_number ||
                                      "Unknown"}
                                  </span>
                                </div>
                                {selectedChatDetails.lead.email && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Email:
                                    </span>
                                    <span className="text-foreground max-w-[200px] truncate font-semibold">
                                      {selectedChatDetails.lead.email}
                                    </span>
                                  </div>
                                )}
                                {selectedChatDetails.lead.phone_number && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Phone:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {selectedChatDetails.lead.phone_number}
                                    </span>
                                  </div>
                                )}
                                {selectedChatDetails.lead.status && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Status:
                                    </span>
                                    <span className="text-foreground font-semibold capitalize">
                                      {selectedChatDetails.lead.status.replace(
                                        /_/g,
                                        " "
                                      )}
                                    </span>
                                  </div>
                                )}
                                {selectedChatDetails.lead.source && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Lead Source:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {selectedChatDetails.lead.source}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedChatDetails.chat.summary && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                <MessageCircle className="h-4 w-4 text-purple-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Chat Summary
                              </h4>
                            </div>
                            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                {selectedChatDetails.chat.summary}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Analysis */}
                        {selectedChatDetails.chat.analysis && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                                <Activity className="h-4 w-4 text-orange-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Chat Analysis
                              </h4>
                            </div>
                            <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 p-6">
                              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                {selectedChatDetails.chat.analysis}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-4">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <MessageCircle className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground font-medium">
                      Select a chat to view details
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Choose a chat log from the list to see the conversation
                      history, lead information, and chat analysis
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
