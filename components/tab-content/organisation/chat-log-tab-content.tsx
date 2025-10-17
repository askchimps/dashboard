"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  MessageCircle,
  User,
  Activity,
  MessagesSquare
} from "lucide-react";

import SectionHeader from "@/components/section-header/section-header";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { organisationQueries } from "@/lib/query/organisation.query";

import { ConversationFilters } from "@/lib/api/actions/organisation/get-organisation-conversations";

interface ChatLogTabContentProps {
  className?: string;
}

export default function ChatLogTabContent({ className }: ChatLogTabContentProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [filters, setFilters] = useState<ConversationFilters>({
    page: 1,
    limit: 50,
    type: "CHAT" as const,
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // API Integration
  const { data: conversationsData, isLoading } = useQuery({
    ...organisationQueries.getConversations(orgSlug, filters),
  });

  const { data: selectedConversationDetails, isLoading: isLoadingDetails } = useQuery({
    ...organisationQueries.getConversationDetails(orgSlug, selectedConversationId || ""),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Conversations List */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 h-80 lg:h-full">
          <div className="h-full bg-white border border-border rounded-lg flex flex-col">
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-1 p-2">
                    {/* Skeleton loading for conversation list */}
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-transparent"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
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
                  <div className="flex items-center justify-center h-full text-center p-6">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-foreground">No chat logs yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Chat logs will appear here when customers start chatting with your agents
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id.toString())}
                        className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedConversationId === conversation.id.toString()
                            ? 'bg-muted border border-border'
                            : 'border border-transparent'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-col items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-foreground truncate">
                                  {conversation.name}
                                </h4>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatTimeAgo(conversation.created_at)}
                              </span>
                            </div>

                            {conversation.summary && (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
        <div className="flex-1 min-w-0 min-h-0">
          <div className="h-full bg-white border border-border rounded-lg flex flex-col">
            {selectedConversationId && isLoadingDetails ? (
              <div className="h-full flex flex-col">
                {/* Header Skeleton */}
                <div className="p-6 border-b border-border">
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
                      <div key={index} className={`flex gap-3 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        {index % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                        <div className="space-y-2 max-w-[80%]">
                          <Skeleton className="h-16 w-full rounded-lg" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        {index % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedConversationId && selectedConversationDetails ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversationDetails.agent?.name || "AI Assistant"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 inline" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Activity className="h-4 w-4 mr-2 inline" />
                    Details
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "chat" ? (
                    <div className="h-full p-6">
                      <div className="h-full overflow-y-auto space-y-4 px-1">
                        {selectedConversationDetails.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                          >
                            {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${message.role === 'user'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                              <div className="text-xs opacity-70 mt-2">
                                {formatTimeAgo(message.created_at)}
                              </div>
                            </div>

                            {message.role === 'user' && (
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
                          <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-4 w-4" />
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                              General Details
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Source:</span>
                              <span className="font-medium">
                                {selectedConversationDetails.source || "Website"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-medium">Chat</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Messages:</span>
                              <span className="font-medium">
                                {selectedConversationDetails.messages?.length || 0}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span className="font-medium">
                                {formatDateTime(selectedConversationDetails.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedConversationDetails.summary && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <MessageCircle className="h-4 w-4" />
                              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                                Summary
                              </h4>
                            </div>
                            <div className="text-sm bg-muted/50 rounded-lg p-4">
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
              <div className="flex items-center justify-center h-full text-center p-8">
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">Select a chat to view details</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a chat log from the list to see the conversation details and chat history
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
