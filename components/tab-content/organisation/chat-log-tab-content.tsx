"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { MessageSquare, MessageCircle, User, Activity } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationFilters } from "@/lib/api/actions/organisation/get-organisation-conversations";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function ChatLogTabContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  // Get conversation ID from query parameter
  const conversationFromQuery = searchParams.get("conversation");

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationFromQuery);
  const [activeTab, setActiveTab] = useState("chat");
  const [filters, setFilters] = useState<ConversationFilters>({
    page: 1,
    limit: 50,
    type: "CHAT" as const,
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Update selected conversation when query parameter changes
  useEffect(() => {
    if (conversationFromQuery) {
      setSelectedConversationId(conversationFromQuery);
    }
  }, [conversationFromQuery]);

  // API Integration
  const { data: conversationsData, isLoading } = useQuery({
    ...organisationQueries.getConversations(orgSlug, filters),
  });

  const { data: selectedConversationDetails, isLoading: isLoadingDetails } =
    useQuery({
      ...organisationQueries.getConversationDetails(
        orgSlug,
        selectedConversationId || ""
      ),
      enabled: !!selectedConversationId,
    });

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
  };

  const conversations = conversationsData?.conversations || [];

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

  return (
    <>
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

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-200px)] flex-col gap-6 lg:flex-row">
        {/* Left Panel - Conversations List */}
        <div className="h-80 w-full lg:h-full lg:w-80 lg:flex-shrink-0">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-1 p-2">
                    {/* Skeleton loading for conversation list */}
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
                ) : !conversations.length ? (
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
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversationId(conversation.id.toString());
                          router.push(
                            `/${orgSlug}/chat-logs?conversation=${conversation.id}`,
                            {
                              scroll: false,
                            }
                          );
                        }}
                        className={`hover:bg-muted/50 cursor-pointer rounded-lg p-4 transition-colors ${
                          selectedConversationId === conversation.id.toString()
                            ? "bg-muted border-border border"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-col items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-foreground truncate text-sm font-medium">
                                  {conversation.name}
                                </h4>
                              </div>
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {formatTimeAgo(conversation.created_at)}
                              </span>
                            </div>

                            {conversation.summary && (
                              <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                {conversation.summary}
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

        {/* Right Panel - Chat Interface */}
        <div className="min-h-0 min-w-0 flex-1">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            {selectedConversationId && isLoadingDetails ? (
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
            ) : selectedConversationId && selectedConversationDetails ? (
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="border-border border-b p-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-sm text-green-600">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        {selectedConversationDetails.agent?.name ||
                          "AI Assistant"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedConversationDetails.source || "Website"} • Chat
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tabs */}
                <div className="flex border-b px-6">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "chat"
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <MessageCircle className="mr-2 inline h-4 w-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "details"
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <Activity className="mr-2 inline h-4 w-4" />
                    Details
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "chat" ? (
                    <div className="h-full p-6">
                      <div className="h-full space-y-4 overflow-y-auto px-1">
                        {selectedConversationDetails.messages?.map(message => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-green-100 text-xs text-green-600">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                                message.role === "user"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="break-words whitespace-pre-wrap">
                                {message.content}
                              </div>
                              <div className="mt-2 text-xs opacity-70">
                                {formatTimeAgo(message.created_at)}
                              </div>
                            </div>

                            {message.role === "user" && (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                              General Details
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Source:
                              </span>
                              <span className="font-medium">
                                {selectedConversationDetails.source ||
                                  "Website"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span className="font-medium">Chat</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Messages:
                              </span>
                              <span className="font-medium">
                                {selectedConversationDetails.messages?.length ||
                                  0}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Created:
                              </span>
                              <span className="font-medium">
                                {formatDateTime(
                                  selectedConversationDetails.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedConversationDetails.summary && (
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                Summary
                              </h4>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4 text-sm">
                              {selectedConversationDetails.summary}
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
                      details and chat history
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
