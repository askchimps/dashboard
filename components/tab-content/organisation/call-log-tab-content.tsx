"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { PhoneCall, MessageCircle, User, Activity } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationFilters } from "@/lib/api/actions/organisation/get-organisation-conversations";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function CallLogTabContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get conversation ID from query parameter
  const conversationFromQuery = searchParams.get("conversation");

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationFromQuery);
  const [activeTab, setActiveTab] = useState("chat");
  const [filters, setFilters] = useState<ConversationFilters>({
    page: 1,
    limit: 50,
    type: "CALL" as const,
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

  // Stop audio playback when conversation changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedConversationId]);

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
    setSelectedConversationId(null);
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
          <SectionHeader label="Call Logs" />
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
                        <PhoneCall className="text-muted-foreground h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-foreground font-medium">
                          No call logs yet
                        </h3>
                        <p className="text-muted-foreground max-w-sm text-sm">
                          Call logs will appear here when customers start
                          calling your agents
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
                            `/${orgSlug}/call-logs?conversation=${conversation.id}`,
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
                          {/* <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                              <Phone className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar> */}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-foreground line-clamp-1 text-sm font-medium">
                                  {conversation.name}
                                </h4>
                                {conversation.lead && (
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                      {conversation.lead.name}
                                    </span>
                                    {conversation.lead.status && (
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                          conversation.lead.status ===
                                          "qualified"
                                            ? "bg-green-100 text-green-700"
                                            : conversation.lead.status ===
                                                "not_qualified"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {conversation.lead.status.replace(
                                          /_/g,
                                          " "
                                        )}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {formatTimeAgo(conversation.created_at)}
                              </span>
                            </div>

                            {conversation.summary && (
                              <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
                                {(() => {
                                  try {
                                    const summary = JSON.parse(
                                      conversation.summary
                                    );
                                    return (
                                      summary.brief || conversation.summary
                                    );
                                  } catch {
                                    return conversation.summary;
                                  }
                                })()}
                              </p>
                            )}

                            {conversation.duration && (
                              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="h-3 w-3" />
                                  {Math.floor(conversation.duration / 60)}m{" "}
                                  {Math.floor(conversation.duration % 60)}s
                                </span>
                                {conversation.source && (
                                  <span>• {conversation.source}</span>
                                )}
                              </div>
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
                      <AvatarFallback className="bg-blue-100 text-sm text-blue-600">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-foreground font-semibold">
                        {selectedConversationDetails.agent?.name ||
                          "AI Assistant"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedConversationDetails.source || "Phone"} • Call
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
                    Transcript
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
                    Details & Analysis
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
                            {(message.role === "assistant" ||
                              message.role === "bot") && (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-blue-100 text-xs text-blue-600">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
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
                                <AvatarFallback className="bg-green-100 text-green-600">
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
                        {/* Call Information */}
                        <div>
                          <div className="mb-4 flex items-center gap-2">
                            <PhoneCall className="h-4 w-4" />
                            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                              Call Information
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span className="font-medium">
                                {selectedConversationDetails.duration
                                  ? `${Math.floor((selectedConversationDetails.duration * 60) / 60)}m ${Math.floor((selectedConversationDetails.duration * 60) % 60)}s`
                                  : "N/A"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Source:
                              </span>
                              <span className="font-medium">
                                {selectedConversationDetails.source || "Phone"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span className="font-medium capitalize">
                                {selectedConversationDetails.type || "Call"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Messages:
                              </span>
                              <span className="font-medium">
                                {selectedConversationDetails.messageStats
                                  ?.total ||
                                  selectedConversationDetails.messages
                                    ?.length ||
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

                        {/* Lead Information */}
                        {selectedConversationDetails.lead && (
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                Lead Information
                              </h4>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Name:
                                </span>
                                <span className="font-medium">
                                  {selectedConversationDetails.lead.name}
                                </span>
                              </div>

                              {selectedConversationDetails.lead.email && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Email:
                                  </span>
                                  <span className="max-w-[200px] truncate font-medium">
                                    {selectedConversationDetails.lead.email}
                                  </span>
                                </div>
                              )}

                              {selectedConversationDetails.lead
                                .phone_number && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Phone:
                                  </span>
                                  <span className="font-medium">
                                    {
                                      selectedConversationDetails.lead
                                        .phone_number
                                    }
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Status:
                                </span>
                                <span className="font-medium capitalize">
                                  {selectedConversationDetails.lead.status?.replace(
                                    /_/g,
                                    " "
                                  )}
                                </span>
                              </div>

                              {selectedConversationDetails.lead.source && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Lead Source:
                                  </span>
                                  <span className="font-medium">
                                    {selectedConversationDetails.lead.source}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedConversationDetails.summary && (
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                Conversation Summary
                              </h4>
                            </div>
                            <div className="bg-muted/50 space-y-3 rounded-lg p-4 text-sm">
                              {(() => {
                                try {
                                  const summary = JSON.parse(
                                    selectedConversationDetails.summary
                                  );
                                  return (
                                    <>
                                      {summary.brief && (
                                        <div>
                                          <h5 className="mb-1 font-medium">
                                            Brief:
                                          </h5>
                                          <p className="text-muted-foreground">
                                            {summary.brief}
                                          </p>
                                        </div>
                                      )}
                                      {summary.detailed && (
                                        <div>
                                          <h5 className="mb-1 font-medium">
                                            Details:
                                          </h5>
                                          <p className="text-muted-foreground">
                                            {summary.detailed}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  );
                                } catch {
                                  return (
                                    <p className="text-muted-foreground">
                                      {selectedConversationDetails.summary}
                                    </p>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Analysis */}
                        {selectedConversationDetails.analysis && (
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                Call Analysis
                              </h4>
                            </div>
                            <div className="space-y-6">
                              {(() => {
                                try {
                                  const analysis = JSON.parse(
                                    selectedConversationDetails.analysis
                                  );
                                  return (
                                    <>
                                      {/* Lead Status */}
                                      {analysis.lead_status && (
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                          <div className="mb-4 flex items-center gap-3">
                                            <div
                                              className={`rounded-lg p-2 ${
                                                analysis.lead_status.value ===
                                                "Can be a Client"
                                                  ? "bg-green-100"
                                                  : analysis.lead_status
                                                        .value ===
                                                      "Potential Client"
                                                    ? "bg-blue-100"
                                                    : analysis.lead_status
                                                          .value ===
                                                        "Visit Store"
                                                      ? "bg-purple-100"
                                                      : analysis.lead_status
                                                            .value ===
                                                          "Future Prospect"
                                                        ? "bg-yellow-100"
                                                        : analysis.lead_status
                                                              .value ===
                                                            "Out of Budget"
                                                          ? "bg-red-100"
                                                          : "bg-gray-100"
                                              }`}
                                            >
                                              <User
                                                className={`h-5 w-5 ${
                                                  analysis.lead_status.value ===
                                                  "Can be a Client"
                                                    ? "text-green-600"
                                                    : analysis.lead_status
                                                          .value ===
                                                        "Potential Client"
                                                      ? "text-blue-600"
                                                      : analysis.lead_status
                                                            .value ===
                                                          "Visit Store"
                                                        ? "text-purple-600"
                                                        : analysis.lead_status
                                                              .value ===
                                                            "Future Prospect"
                                                          ? "text-yellow-600"
                                                          : analysis.lead_status
                                                                .value ===
                                                              "Out of Budget"
                                                            ? "text-red-600"
                                                            : "text-gray-600"
                                                }`}
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-900">
                                                Lead Classification
                                              </h5>
                                              <p className="text-sm text-gray-500">
                                                Current status and potential
                                              </p>
                                            </div>
                                            <span
                                              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                                analysis.lead_status.value ===
                                                "Can be a Client"
                                                  ? "border border-green-200 bg-green-100 text-green-800"
                                                  : analysis.lead_status
                                                        .value ===
                                                      "Potential Client"
                                                    ? "border border-blue-200 bg-blue-100 text-blue-800"
                                                    : analysis.lead_status
                                                          .value ===
                                                        "Visit Store"
                                                      ? "border border-purple-200 bg-purple-100 text-purple-800"
                                                      : analysis.lead_status
                                                            .value ===
                                                          "Future Prospect"
                                                        ? "border border-yellow-200 bg-yellow-100 text-yellow-800"
                                                        : analysis.lead_status
                                                              .value ===
                                                            "Out of Budget"
                                                          ? "border border-red-200 bg-red-100 text-red-800"
                                                          : "border border-gray-200 bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {analysis.lead_status.value}
                                            </span>
                                          </div>
                                          {analysis.lead_status.reason && (
                                            <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4">
                                              <div className="flex items-start gap-2">
                                                <div className="mt-0.5 rounded-full bg-gray-200 p-1">
                                                  <div className="h-1.5 w-1.5 rounded-full bg-gray-600"></div>
                                                </div>
                                                <div>
                                                  <p className="mb-1 text-sm font-medium text-gray-700">
                                                    Assessment Reason
                                                  </p>
                                                  <p className="text-sm leading-relaxed text-gray-600">
                                                    {
                                                      analysis.lead_status
                                                        .reason
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Customer Interest Level */}
                                      {analysis.sentiment && (
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                          <div className="mb-4 flex items-center gap-3">
                                            <div
                                              className={`rounded-lg p-2 ${
                                                analysis.sentiment.value ===
                                                "hot"
                                                  ? "bg-red-100"
                                                  : analysis.sentiment.value ===
                                                      "warm"
                                                    ? "bg-orange-100"
                                                    : analysis.sentiment
                                                          .value === "cold"
                                                      ? "bg-blue-100"
                                                      : "bg-gray-100"
                                              }`}
                                            >
                                              <Activity
                                                className={`h-5 w-5 ${
                                                  analysis.sentiment.value ===
                                                  "hot"
                                                    ? "text-red-600"
                                                    : analysis.sentiment
                                                          .value === "warm"
                                                      ? "text-orange-600"
                                                      : analysis.sentiment
                                                            .value === "cold"
                                                        ? "text-blue-600"
                                                        : "text-gray-600"
                                                }`}
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-900">
                                                Interest Level
                                              </h5>
                                              <p className="text-sm text-gray-500">
                                                Customer engagement and
                                                enthusiasm
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div
                                                className={`h-3 w-3 rounded-full ${
                                                  analysis.sentiment.value ===
                                                  "hot"
                                                    ? "animate-pulse bg-red-500"
                                                    : analysis.sentiment
                                                          .value === "warm"
                                                      ? "bg-orange-500"
                                                      : analysis.sentiment
                                                            .value === "cold"
                                                        ? "bg-blue-500"
                                                        : "bg-gray-500"
                                                }`}
                                              ></div>
                                              <span
                                                className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                                                  analysis.sentiment.value ===
                                                  "hot"
                                                    ? "border border-red-200 bg-red-100 text-red-800"
                                                    : analysis.sentiment
                                                          .value === "warm"
                                                      ? "border border-orange-200 bg-orange-100 text-orange-800"
                                                      : analysis.sentiment
                                                            .value === "cold"
                                                        ? "border border-blue-200 bg-blue-100 text-blue-800"
                                                        : "border border-gray-200 bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {analysis.sentiment.value}
                                              </span>
                                            </div>
                                          </div>
                                          {analysis.sentiment.reason && (
                                            <div
                                              className={`rounded-lg border-l-4 p-4 ${
                                                analysis.sentiment.value ===
                                                "hot"
                                                  ? "border-red-300 bg-red-50"
                                                  : analysis.sentiment.value ===
                                                      "warm"
                                                    ? "border-orange-300 bg-orange-50"
                                                    : analysis.sentiment
                                                          .value === "cold"
                                                      ? "border-blue-300 bg-blue-50"
                                                      : "border-gray-300 bg-gray-50"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div
                                                  className={`mt-0.5 rounded-full p-1 ${
                                                    analysis.sentiment.value ===
                                                    "hot"
                                                      ? "bg-red-200"
                                                      : analysis.sentiment
                                                            .value === "warm"
                                                        ? "bg-orange-200"
                                                        : analysis.sentiment
                                                              .value === "cold"
                                                          ? "bg-blue-200"
                                                          : "bg-gray-200"
                                                  }`}
                                                >
                                                  <div
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                      analysis.sentiment
                                                        .value === "hot"
                                                        ? "bg-red-600"
                                                        : analysis.sentiment
                                                              .value === "warm"
                                                          ? "bg-orange-600"
                                                          : analysis.sentiment
                                                                .value ===
                                                              "cold"
                                                            ? "bg-blue-600"
                                                            : "bg-gray-600"
                                                    }`}
                                                  ></div>
                                                </div>
                                                <div>
                                                  <p
                                                    className={`mb-1 text-sm font-medium ${
                                                      analysis.sentiment
                                                        .value === "hot"
                                                        ? "text-red-700"
                                                        : analysis.sentiment
                                                              .value === "warm"
                                                          ? "text-orange-700"
                                                          : analysis.sentiment
                                                                .value ===
                                                              "cold"
                                                            ? "text-blue-700"
                                                            : "text-gray-700"
                                                    }`}
                                                  >
                                                    Interest Analysis
                                                  </p>
                                                  <p
                                                    className={`text-sm leading-relaxed ${
                                                      analysis.sentiment
                                                        .value === "hot"
                                                        ? "text-red-600"
                                                        : analysis.sentiment
                                                              .value === "warm"
                                                          ? "text-orange-600"
                                                          : analysis.sentiment
                                                                .value ===
                                                              "cold"
                                                            ? "text-blue-600"
                                                            : "text-gray-600"
                                                    }`}
                                                  >
                                                    {analysis.sentiment.reason}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Qualification Status */}
                                      {analysis.qualification && (
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                          <div className="mb-4 flex items-center gap-3">
                                            <div
                                              className={`rounded-lg p-2 ${
                                                analysis.qualification.qualified
                                                  ?.value === "true"
                                                  ? "bg-green-100"
                                                  : analysis.qualification
                                                        .qualified?.value ===
                                                      "false"
                                                    ? "bg-red-100"
                                                    : "bg-yellow-100"
                                              }`}
                                            >
                                              <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                  analysis.qualification
                                                    .qualified?.value === "true"
                                                    ? "border-green-600 bg-green-600"
                                                    : analysis.qualification
                                                          .qualified?.value ===
                                                        "false"
                                                      ? "border-red-600"
                                                      : "border-yellow-600"
                                                }`}
                                              >
                                                {analysis.qualification
                                                  .qualified?.value ===
                                                  "true" && (
                                                  <svg
                                                    className="h-3 w-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"
                                                    ></path>
                                                  </svg>
                                                )}
                                                {analysis.qualification
                                                  .qualified?.value ===
                                                  "false" && (
                                                  <svg
                                                    className="h-3 w-3 text-red-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                      clipRule="evenodd"
                                                    ></path>
                                                  </svg>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-900">
                                                Qualification Status
                                              </h5>
                                              <p className="text-sm text-gray-500">
                                                Lead readiness and fit
                                                assessment
                                              </p>
                                            </div>
                                            <span
                                              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                                analysis.qualification.qualified
                                                  ?.value === "true"
                                                  ? "border border-green-200 bg-green-100 text-green-800"
                                                  : analysis.qualification
                                                        .qualified?.value ===
                                                      "false"
                                                    ? "border border-red-200 bg-red-100 text-red-800"
                                                    : "border border-yellow-200 bg-yellow-100 text-yellow-800"
                                              }`}
                                            >
                                              {analysis.qualification.qualified
                                                ?.value === "true"
                                                ? "Qualified"
                                                : analysis.qualification
                                                      .qualified?.value ===
                                                    "false"
                                                  ? "Not Qualified"
                                                  : "Pending Review"}
                                            </span>
                                          </div>
                                          {analysis.qualification.qualified
                                            ?.reason && (
                                            <div
                                              className={`rounded-lg border-l-4 p-4 ${
                                                analysis.qualification.qualified
                                                  ?.value === "true"
                                                  ? "border-green-300 bg-green-50"
                                                  : analysis.qualification
                                                        .qualified?.value ===
                                                      "false"
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-yellow-300 bg-yellow-50"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div
                                                  className={`mt-0.5 rounded-full p-1 ${
                                                    analysis.qualification
                                                      .qualified?.value ===
                                                    "true"
                                                      ? "bg-green-200"
                                                      : analysis.qualification
                                                            .qualified
                                                            ?.value === "false"
                                                        ? "bg-red-200"
                                                        : "bg-yellow-200"
                                                  }`}
                                                >
                                                  <div
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                      analysis.qualification
                                                        .qualified?.value ===
                                                      "true"
                                                        ? "bg-green-600"
                                                        : analysis.qualification
                                                              .qualified
                                                              ?.value ===
                                                            "false"
                                                          ? "bg-red-600"
                                                          : "bg-yellow-600"
                                                    }`}
                                                  ></div>
                                                </div>
                                                <div>
                                                  <p
                                                    className={`mb-1 text-sm font-medium ${
                                                      analysis.qualification
                                                        .qualified?.value ===
                                                      "true"
                                                        ? "text-green-700"
                                                        : analysis.qualification
                                                              .qualified
                                                              ?.value ===
                                                            "false"
                                                          ? "text-red-700"
                                                          : "text-yellow-700"
                                                    }`}
                                                  >
                                                    Qualification Reasoning
                                                  </p>
                                                  <p
                                                    className={`text-sm leading-relaxed ${
                                                      analysis.qualification
                                                        .qualified?.value ===
                                                      "true"
                                                        ? "text-green-600"
                                                        : analysis.qualification
                                                              .qualified
                                                              ?.value ===
                                                            "false"
                                                          ? "text-red-600"
                                                          : "text-yellow-600"
                                                    }`}
                                                  >
                                                    {
                                                      analysis.qualification
                                                        .qualified.reason
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Project Readiness */}
                                      {/* {analysis.site_readiness && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                          <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${
                                              analysis.site_readiness.ready === "true" ? 'bg-green-100' : 'bg-orange-100'
                                            }`}>
                                              <PhoneCall className={`h-5 w-5 ${
                                                analysis.site_readiness.ready === "true" ? 'text-green-600' : 'text-orange-600'
                                              }`} />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-900">Project Readiness</h5>
                                              <p className="text-sm text-gray-500">Installation and timeline status</p>
                                            </div>
                                            <span className={`font-medium px-3 py-1.5 rounded-full text-sm ${
                                              analysis.site_readiness.ready === "true" ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                                            }`}>
                                              {analysis.site_readiness.ready === "true" ? "Ready" : "Not Ready"}
                                            </span>
                                          </div>
                                          <div className="space-y-3">
                                            {analysis.site_readiness.expected_timeline && analysis.site_readiness.expected_timeline !== "unknown" && (
                                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-700">Expected Timeline:</span>
                                                <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded border">{analysis.site_readiness.expected_timeline}</span>
                                              </div>
                                            )}
                                            {analysis.site_readiness.evidence && (
                                              <div className={`rounded-lg p-4 border-l-4 ${
                                                analysis.site_readiness.ready === "true" ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'
                                              }`}>
                                                <div className="flex items-start gap-2">
                                                  <div className={`rounded-full p-1 mt-0.5 ${
                                                    analysis.site_readiness.ready === "true" ? 'bg-green-200' : 'bg-orange-200'
                                                  }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                      analysis.site_readiness.ready === "true" ? 'bg-green-600' : 'bg-orange-600'
                                                    }`}></div>
                                                  </div>
                                                  <div>
                                                    <p className={`text-sm font-medium mb-1 ${
                                                      analysis.site_readiness.ready === "true" ? 'text-green-700' : 'text-orange-700'
                                                    }`}>Readiness Details</p>
                                                    <p className={`text-sm leading-relaxed ${
                                                      analysis.site_readiness.ready === "true" ? 'text-green-600' : 'text-orange-600'
                                                    }`}>{analysis.site_readiness.evidence}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )} */}

                                      {/* Follow-up Required */}
                                      {analysis.reschedule &&
                                        analysis.reschedule.required ===
                                          "true" && (
                                          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm">
                                            <div className="mb-4 flex items-center gap-3">
                                              <div className="rounded-lg bg-amber-100 p-2">
                                                <svg
                                                  className="h-5 w-5 text-amber-600"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                    clipRule="evenodd"
                                                  ></path>
                                                </svg>
                                              </div>
                                              <div className="flex-1">
                                                <h5 className="font-semibold text-amber-900">
                                                  Follow-up Scheduled
                                                </h5>
                                                <p className="text-sm text-amber-700">
                                                  Next interaction planned
                                                </p>
                                              </div>
                                              <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
                                                Scheduled
                                              </span>
                                            </div>
                                            {analysis.reschedule.date_time && (
                                              <div className="rounded-lg border border-amber-200 bg-white p-4">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <svg
                                                      className="h-4 w-4 text-amber-600"
                                                      fill="currentColor"
                                                      viewBox="0 0 20 20"
                                                    >
                                                      <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                        clipRule="evenodd"
                                                      ></path>
                                                    </svg>
                                                    <span className="text-sm font-medium text-amber-800">
                                                      Scheduled Time:
                                                    </span>
                                                  </div>
                                                  <span className="rounded border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">
                                                    {new Date(
                                                      analysis.reschedule.date_time
                                                    ).toLocaleString()}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                            {analysis.reschedule.criteria && (
                                              <div className="mt-3 rounded-lg border-l-4 border-amber-300 bg-amber-50 p-4">
                                                <div className="flex items-start gap-2">
                                                  <div className="mt-0.5 rounded-full bg-amber-200 p-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-600"></div>
                                                  </div>
                                                  <div>
                                                    <p className="mb-1 text-sm font-medium text-amber-700">
                                                      Reschedule Reason
                                                    </p>
                                                    <p className="text-sm leading-relaxed text-amber-600">
                                                      {
                                                        analysis.reschedule
                                                          .criteria
                                                      }
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                      {/* Call Quality */}
                                      {analysis.call_quality && (
                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                          <div className="mb-4 flex items-center gap-3">
                                            <div
                                              className={`rounded-lg p-2 ${
                                                parseInt(
                                                  analysis.call_quality.rating
                                                ) >= 8
                                                  ? "bg-green-100"
                                                  : parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      ) >= 6
                                                    ? "bg-yellow-100"
                                                    : "bg-red-100"
                                              }`}
                                            >
                                              <PhoneCall
                                                className={`h-5 w-5 ${
                                                  parseInt(
                                                    analysis.call_quality.rating
                                                  ) >= 8
                                                    ? "text-green-600"
                                                    : parseInt(
                                                          analysis.call_quality
                                                            .rating
                                                        ) >= 6
                                                      ? "text-yellow-600"
                                                      : "text-red-600"
                                                }`}
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-900">
                                                Call Quality
                                              </h5>
                                              <p className="text-sm text-gray-500">
                                                Audio quality and connection
                                                assessment
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1">
                                                {[...Array(10)].map((_, i) => (
                                                  <div
                                                    key={i}
                                                    className={`h-2 w-2 rounded-full ${
                                                      i <
                                                      parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      )
                                                        ? "bg-green-500"
                                                        : "bg-gray-200"
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                              <span
                                                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                                                  parseInt(
                                                    analysis.call_quality.rating
                                                  ) >= 8
                                                    ? "border-green-200 bg-green-100 text-green-800"
                                                    : parseInt(
                                                          analysis.call_quality
                                                            .rating
                                                        ) >= 6
                                                      ? "border-yellow-200 bg-yellow-100 text-yellow-800"
                                                      : "border-red-200 bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {analysis.call_quality.rating}
                                                /10
                                              </span>
                                            </div>
                                          </div>
                                          {analysis.call_quality.issues && (
                                            <div
                                              className={`rounded-lg border-l-4 p-4 ${
                                                parseInt(
                                                  analysis.call_quality.rating
                                                ) >= 8
                                                  ? "border-green-300 bg-green-50"
                                                  : parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      ) >= 6
                                                    ? "border-yellow-300 bg-yellow-50"
                                                    : "border-red-300 bg-red-50"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div
                                                  className={`mt-0.5 rounded-full p-1 ${
                                                    parseInt(
                                                      analysis.call_quality
                                                        .rating
                                                    ) >= 8
                                                      ? "bg-green-200"
                                                      : parseInt(
                                                            analysis
                                                              .call_quality
                                                              .rating
                                                          ) >= 6
                                                        ? "bg-yellow-200"
                                                        : "bg-red-200"
                                                  }`}
                                                >
                                                  <div
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                      parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      ) >= 8
                                                        ? "bg-green-600"
                                                        : parseInt(
                                                              analysis
                                                                .call_quality
                                                                .rating
                                                            ) >= 6
                                                          ? "bg-yellow-600"
                                                          : "bg-red-600"
                                                    }`}
                                                  ></div>
                                                </div>
                                                <div>
                                                  <p
                                                    className={`mb-1 text-sm font-medium ${
                                                      parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      ) >= 8
                                                        ? "text-green-700"
                                                        : parseInt(
                                                              analysis
                                                                .call_quality
                                                                .rating
                                                            ) >= 6
                                                          ? "text-yellow-700"
                                                          : "text-red-700"
                                                    }`}
                                                  >
                                                    Quality Assessment
                                                  </p>
                                                  <p
                                                    className={`text-sm leading-relaxed ${
                                                      parseInt(
                                                        analysis.call_quality
                                                          .rating
                                                      ) >= 8
                                                        ? "text-green-600"
                                                        : parseInt(
                                                              analysis
                                                                .call_quality
                                                                .rating
                                                            ) >= 6
                                                          ? "text-yellow-600"
                                                          : "text-red-600"
                                                    }`}
                                                  >
                                                    {
                                                      analysis.call_quality
                                                        .issues
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Next Steps */}
                                      {analysis.next_steps && (
                                        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
                                          <div className="mb-4 flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-100 p-2">
                                              <svg
                                                className="h-5 w-5 text-blue-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                  clipRule="evenodd"
                                                ></path>
                                              </svg>
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-blue-900">
                                                Next Steps
                                              </h5>
                                              <p className="text-sm text-blue-700">
                                                Recommended actions and
                                                follow-up
                                              </p>
                                            </div>
                                            <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800">
                                              Action Required
                                            </span>
                                          </div>
                                          <div className="space-y-4">
                                            {analysis.next_steps
                                              .description && (
                                              <div className="rounded-lg border border-blue-200 bg-white p-4">
                                                <div className="text-sm leading-relaxed text-blue-700">
                                                  {typeof analysis.next_steps
                                                    .description ===
                                                  "string" ? (
                                                    analysis.next_steps.description
                                                      .split(/\d+\.\s|\-\s|•\s/)
                                                      .filter((step: string) =>
                                                        step.trim()
                                                      ).length > 1 ? (
                                                      <ul className="space-y-2">
                                                        {analysis.next_steps.description
                                                          .split(
                                                            /\d+\.\s|\-\s|•\s/
                                                          )
                                                          .filter(
                                                            (step: string) =>
                                                              step.trim()
                                                          )
                                                          .map(
                                                            (
                                                              step: string,
                                                              index: number
                                                            ) => (
                                                              <li
                                                                key={index}
                                                                className="flex items-start gap-3"
                                                              >
                                                                <div className="mt-1 rounded-full bg-blue-100 p-1">
                                                                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                                                </div>
                                                                <span className="leading-relaxed font-medium text-gray-800">
                                                                  {step.trim()}
                                                                </span>
                                                              </li>
                                                            )
                                                          )}
                                                      </ul>
                                                    ) : (
                                                      <p className="leading-relaxed font-medium text-gray-800">
                                                        {
                                                          analysis.next_steps
                                                            .description
                                                        }
                                                      </p>
                                                    )
                                                  ) : (
                                                    <p className="leading-relaxed font-medium text-gray-800">
                                                      {String(
                                                        analysis.next_steps
                                                          .description
                                                      )}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            {/* {analysis.next_steps.examples && Array.isArray(analysis.next_steps.examples) && analysis.next_steps.examples.length > 0 && (
                                              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-300">
                                                <p className="text-sm font-medium text-blue-700 mb-2">Additional Action Items:</p>
                                                <ul className="space-y-2">
                                                  {analysis.next_steps.examples.map((step: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                      <div className="bg-blue-200 rounded-full p-1 mt-1">
                                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                      </div>
                                                      <span className="text-blue-700 text-sm leading-relaxed">{step}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                            {typeof analysis.next_steps === 'string' && (
                                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                <div className="text-blue-700 text-sm leading-relaxed">
                                                  {analysis.next_steps.split(/\d+\.\s|\-\s|•\s/).filter((step: string) => step.trim()).length > 1 ? (
                                                    <ul className="space-y-2">
                                                      {analysis.next_steps.split(/\d+\.\s|\-\s|•\s/).filter((step: string) => step.trim()).map((step: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                          <div className="bg-blue-100 rounded-full p-1 mt-1">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                          </div>
                                                          <span className="text-gray-800 font-medium leading-relaxed">{step.trim()}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  ) : (
                                                    <p className="text-gray-800 font-medium leading-relaxed">{analysis.next_steps}</p>
                                                  )}
                                                </div>
                                              </div>
                                            )} */}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                } catch {
                                  return (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                          <Activity className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-gray-900">
                                            Analysis Unavailable
                                          </h5>
                                          <p className="text-sm text-gray-600">
                                            No analysis data available for this
                                            conversation
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Recording */}
                        {selectedConversationDetails.recording_url && (
                          <div>
                            <div className="mb-4 flex items-center gap-2">
                              <PhoneCall className="h-4 w-4" />
                              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                Call Recording
                              </h4>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                              <audio
                                ref={audioRef}
                                controls
                                className="w-full"
                                key={selectedConversationId}
                              >
                                <source
                                  src={
                                    selectedConversationDetails.recording_url
                                  }
                                  type="audio/wav"
                                />
                                Your browser does not support the audio element.
                              </audio>
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
                      Select a call to view details
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Choose a call log from the list to see the transcript,
                      lead information, and detailed analysis
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
