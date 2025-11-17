/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
"use client";

import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MessageCircle,
  User,
  Activity,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Users,
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
import { updateChatUnreadMessagesAction } from "@/lib/api/actions/chat/update-chat-unread";
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
  const [chatTypeFilter, setChatTypeFilter] = useState<"all" | "human_handover">("all");
  const [filters, setFilters] = useState<ChatFilters>({
    page: 1,
    limit: 20,
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const chatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Track if user has manually scrolled the chats list
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // Refs for scroll management
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update selected chat when query parameter changes
  useEffect(() => {
    if (chatFromQuery) {
      setSelectedChatId(chatFromQuery);
    }
  }, [chatFromQuery]);

  // Infinite Query for Chats
  const {
    data: chatsData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["organisation", orgSlug, "chats", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatQueries.getChats(orgSlug, { ...filters, page: pageParam }).queryFn();
      return response;
    },
    getNextPageParam: (lastPage: { pagination?: { page: number; totalPages: number } }) => {
      if (!lastPage?.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  const { data: selectedChatDetails, isLoading: isLoadingDetails } = useQuery({
    ...chatQueries.getChatDetails(orgSlug, selectedChatId || ""),
    enabled: !!selectedChatId,
  });

  // Scroll utility functions
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
        // scrollTimeoutRef.current = setTimeout(() => {
        //   setIsUserScrolling(false);
        // }, 3000);
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

  const handleChatTypeChange = (type: "all" | "human_handover") => {
    setChatTypeFilter(type);
    setSelectedChatId(null);
    setHasUserScrolled(false);
  };

  // Infinite scroll handler for useInfiniteQuery
  const chatsListContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = chatsListContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // User scroll tracking
      if (container.scrollTop > 0) {
        setHasUserScrolled(true);
      }
      // Infinite scroll trigger
      if (!isFetchingNextPage && hasNextPage &&
        container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
        fetchNextPage();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Flatten chats from all pages
  const allChats = Array.isArray(chatsData?.pages)
    ? chatsData.pages.flatMap(page => page.chats || [])
    : [];

  // Filter chats based on chat type filter
  const chats = chatTypeFilter === "human_handover"
    ? allChats.filter(chat => chat.human_handled)
    : allChats;

  // Scroll selected chat into view within the chat list container only
  useEffect(() => {
    if (!selectedChatId || hasUserScrolled) return;

    const el = chatRefs.current[selectedChatId];
    const container = chatsListContainerRef.current;

    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();

      // Check if element is already visible in the container
      const isVisible =
        elementRect.top >= containerRect.top &&
        elementRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        // Calculate scroll position to show element in upper third of container
        const containerHeight = container.clientHeight;
        const elementHeight = el.offsetHeight;
        const targetPosition = el.offsetTop - (containerHeight / 3) + (elementHeight / 2);

        container.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth"
        });
      }
    } else if (!el) {
      fetchNextPage();
    }
  }, [selectedChatId, chats, hasUserScrolled, fetchNextPage]);

  // Reset hasUserScrolled when filters change or selectedChatId changes (e.g., new navigation)
  useEffect(() => {
    setHasUserScrolled(false);
  }, [filters, selectedChatId]);

  // Callback after message is sent to refresh chat details
  const handleMessageSent = useCallback(() => {
    if (selectedChatId) {
      // Invalidate the chat details query to refresh messages
      queryClient.invalidateQueries({
        queryKey: chatQueries.getChatDetails(orgSlug, selectedChatId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: chatQueries.getChats(orgSlug, filters).queryKey,
      });

      // Force scroll to bottom when sending a message
      setTimeout(() => {
        scrollToBottom(true);
        setIsNearBottom(true);
      }, 200);
    }
  }, [selectedChatId, orgSlug, queryClient, scrollToBottom]);



  // Helper to refetch both getChats and getChatDetails queries simultaneously
  const refetchChatsAndDetails = () => {
    queryClient.invalidateQueries({
      queryKey: ["organisation", orgSlug, "chats", filters],
    });
    if (selectedChatId) {
      queryClient.invalidateQueries({
        queryKey: chatQueries.getChatDetails(orgSlug, selectedChatId).queryKey,
      });
    }
  };

  // Refetch both queries every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchChatsAndDetails();
    }, 10000);
    return () => clearInterval(interval);
  }, [orgSlug, filters, selectedChatId]);

  // Mark selected chat as read if unread_messages > 0 after chatsData refetch
  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const selectedChat = chats.find(c => c.id?.toString() === selectedChatId?.toString());
      if (selectedChat && selectedChat.unread_messages && Number(selectedChat.unread_messages) > 0) {
        setTimeout(async () => {
          try {
            await updateChatUnreadMessagesAction(selectedChat.id, orgSlug);
            refetchChatsAndDetails();
          } catch (error) {
            console.error('Error marking chat as read:', error);
          }
        }, 1000); // Delay to ensure UI is ready
      }
    }
  }, [chats, selectedChatId]);

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
        chatsData && chatsData.pages && chatsData.pages[0] && (
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
                  {chatsData.pages[0].summary.totalChats}
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
                  {chatsData.pages[0].summary.openChats}
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
                  {chatsData.pages[0].summary.chatsWithLead}
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
                  {chatsData.pages[0].summary.chatsWithoutLead}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Chat Type Filter Tabs */}
      <div className="flex border-b bg-gray-50/30">
        <button
          onClick={() => handleChatTypeChange("all")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all duration-200 ${chatTypeFilter === "all"
            ? "border-primary text-primary -mb-px bg-white"
            : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
            }`}
        >
          <MessageSquare className="mr-2 inline h-4 w-4" />
          All Chats
          {chatsData && chatsData.pages && chatsData.pages[0] && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
              {chatsData.pages[0].summary.totalChats}
            </span>
          )}
        </button>
        <button
          onClick={() => handleChatTypeChange("human_handover")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all duration-200 ${chatTypeFilter === "human_handover"
            ? "border-primary text-primary -mb-px bg-white"
            : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
            }`}
        >
          <Users className="mr-2 inline h-4 w-4" />
          Human Handover
          <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
            {allChats.filter(chat => chat.human_handled).length}
          </span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-100px)] flex-col gap-6 lg:flex-row">
        {/* Left Panel - Chats List */}
        <div className="h-80 w-full lg:h-full lg:w-80 lg:flex-shrink-0">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            <div className="flex-1 overflow-hidden">
              <div ref={chatsListContainerRef} className="h-full overflow-y-auto">
                {isLoading && chats.length === 0 ? (
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
                        ref={el => { chatRefs.current[chat.id] = el; }}
                        onClick={async () => {
                          try {
                            const chatIdString = chat.id?.toString();
                            if (chatIdString) {
                              setSelectedChatId(chatIdString);
                              router.push(`/${orgSlug}/chat-logs?chat=${chat.id}`, {
                                scroll: false,
                              });
                              // Mark chat as read on select
                              if (chat.unread_messages && Number(chat.unread_messages) > 0) {
                                await updateChatUnreadMessagesAction(chat.id, orgSlug);
                              }
                              // Always refetch both queries together
                              refetchChatsAndDetails();
                            }
                          } catch (error) {
                            console.error('Error selecting chat:', error);
                          }
                        }}
                        className={`hover:bg-muted/70 cursor-pointer rounded-xl p-5 mb-2 transition-all duration-200 hover:shadow-sm ${selectedChatId === chat.id?.toString()
                          ? "bg-muted border-border border shadow-sm ring-1 ring-blue-100"
                          : "hover:border-muted border border-transparent"
                          }`}
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
                                <div className="mt-3 flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs font-semibold ${getSourceBadgeColor(chat?.source || 'unknown')}`}
                                  >
                                    {chat?.source || 'Unknown'}
                                  </Badge>
                                  {chat.human_handled ? (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs font-semibold bg-red-100 text-red-800`}
                                    >
                                      HANDOVER
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex flex-col gap-3 items-end">
                                <span className="text-muted-foreground shrink-0 text-xs font-medium">
                                  {chat?.updated_at ? formatTimeAgo(chat.updated_at) : 'Unknown time'}
                                </span>
                                {(() => {
                                  const unreadCount = Number(chat?.unread_messages || 0);
                                  const shouldShow = chat?.unread_messages && unreadCount > 0;

                                  return shouldShow ? (
                                    <Badge className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold hover:bg-red-600">
                                      {chat.unread_messages}
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
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    )}
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
                          : selectedChatDetails.lead?.phone_number || selectedChatDetails?.chat?.name ||
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
                            organisation={selectedChatDetails.organisation.slug}
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
                                      : selectedChatDetails.lead.phone_number || selectedChatDetails?.chat?.name ||
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
                            <div className="space-y-4">
                              {(() => {
                                try {
                                  const summaryData = JSON.parse(selectedChatDetails.chat.summary);
                                  return (
                                    <>
                                      {/* Brief Summary */}
                                      {summaryData.brief && (
                                        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-5">
                                          <div className="mb-3 flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                                              <MessageCircle className="h-3 w-3 text-blue-700" />
                                            </div>
                                            <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                                              Brief Summary
                                            </h5>
                                          </div>
                                          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                            {summaryData.brief}
                                          </p>
                                        </div>
                                      )}

                                      {/* Detailed Summary */}
                                      {summaryData.detailed && (
                                        <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-5">
                                          <div className="mb-3 flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100">
                                              <Activity className="h-3 w-3 text-purple-700" />
                                            </div>
                                            <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                                              Detailed Summary
                                            </h5>
                                          </div>
                                          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                            {summaryData.detailed}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  );
                                } catch (error) {
                                  // Fallback to original display if summary is not in JSON format
                                  return (
                                    <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                                      <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        {selectedChatDetails.chat.summary}
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
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
                                Sentiment Analysis
                              </h4>
                            </div>
                            {(() => {
                              try {
                                const analysisData = JSON.parse(selectedChatDetails.chat.analysis);
                                const sentiment = analysisData.sentiment;

                                if (sentiment?.value) {
                                  const getSentimentColor = (value: string) => {
                                    switch (value.toLowerCase()) {
                                      case 'hot':
                                        return {
                                          bg: 'bg-red-100',
                                          text: 'text-red-800',
                                          border: 'border-red-200',
                                          gradient: 'from-red-50/50 to-orange-50/50'
                                        };
                                      case 'warm':
                                        return {
                                          bg: 'bg-orange-100',
                                          text: 'text-orange-800',
                                          border: 'border-orange-200',
                                          gradient: 'from-orange-50/50 to-yellow-50/50'
                                        };
                                      case 'cold':
                                        return {
                                          bg: 'bg-blue-100',
                                          text: 'text-blue-800',
                                          border: 'border-blue-200',
                                          gradient: 'from-blue-50/50 to-indigo-50/50'
                                        };
                                      case 'neutral':
                                      default:
                                        return {
                                          bg: 'bg-gray-100',
                                          text: 'text-gray-800',
                                          border: 'border-gray-200',
                                          gradient: 'from-gray-50/50 to-slate-50/50'
                                        };
                                    }
                                  };

                                  const colors = getSentimentColor(sentiment.value);

                                  return (
                                    <div className={`rounded-xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-6`}>
                                      <div className="space-y-4">
                                        {/* Sentiment Value */}
                                        <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground text-sm font-medium">
                                            Lead Temperature:
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className={`${colors.bg} ${colors.text} text-xs font-bold uppercase tracking-wide`}
                                          >
                                            {sentiment.value}
                                          </Badge>
                                        </div>

                                        {/* Sentiment Reason */}
                                        {sentiment.reason && (
                                          <div className="space-y-2">
                                            <h6 className="text-foreground text-xs font-bold uppercase tracking-wide">
                                              Analysis Reason
                                            </h6>
                                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                              {sentiment.reason}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                // Fallback if no sentiment found in JSON
                                return (
                                  <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 p-6">
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                      {selectedChatDetails.chat.analysis}
                                    </p>
                                  </div>
                                );
                              } catch (error) {
                                // Fallback to original display if analysis is not in JSON format
                                return (
                                  <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 p-6">
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                      {selectedChatDetails.chat.analysis}
                                    </p>
                                  </div>
                                );
                              }
                            })()}
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
