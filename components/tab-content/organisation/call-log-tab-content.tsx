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
                        className={`hover:bg-muted/70 cursor-pointer rounded-xl p-5 transition-all duration-200 hover:shadow-sm ${
                          selectedConversationId === conversation.id.toString()
                            ? "bg-muted border-border border shadow-sm ring-1 ring-blue-100"
                            : "hover:border-muted border border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-foreground line-clamp-1 text-sm leading-tight font-semibold">
                                  {conversation.name}
                                </h4>
                                {conversation.lead && (
                                  <div className="mt-1.5 flex items-center gap-2.5">
                                    <span className="text-muted-foreground text-sm font-medium">
                                      {conversation.lead.first_name &&
                                      conversation.lead.last_name
                                        ? `${conversation.lead.first_name} ${conversation.lead.last_name}`
                                        : conversation.lead.name ||
                                          "Unknown Lead"}
                                    </span>
                                    {conversation.lead.status && (
                                      <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                          conversation.lead.status ===
                                          "qualified"
                                            ? "bg-green-100 text-green-800"
                                            : conversation.lead.status ===
                                                "not_qualified"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
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
                              <span className="text-muted-foreground shrink-0 text-xs font-medium">
                                {formatTimeAgo(conversation.created_at)}
                              </span>
                            </div>

                            {conversation.summary && (
                              <p className="text-muted-foreground mt-2.5 line-clamp-2 text-xs leading-relaxed">
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
                              <div className="text-muted-foreground mt-2.5 flex items-center gap-4 text-base">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <PhoneCall className="h-4 w-4" />
                                  {Math.floor(
                                    (conversation.duration * 60) / 60
                                  )}
                                  m{" "}
                                  {Math.floor(
                                    (conversation.duration * 60) % 60
                                  )}
                                  s
                                </span>
                                {conversation.source && (
                                  <span className="font-medium">
                                    • {conversation.source}
                                  </span>
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
                <div className="border-border border-b p-7">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-base font-semibold text-blue-700">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-foreground text-lg font-bold">
                        {selectedConversationDetails.agent?.name ||
                          "AI Assistant"}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium">
                        {selectedConversationDetails.source || "Phone"} • Call
                        Session
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tabs */}
                <div className="flex border-b bg-gray-50/50 px-7">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`border-b-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === "chat"
                        ? "border-primary text-primary -mb-px bg-white"
                        : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
                    }`}
                  >
                    <MessageCircle className="mr-2.5 inline h-4 w-4" />
                    Call Transcript
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`border-b-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === "details"
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
                  {activeTab === "chat" ? (
                    <div className="h-full p-7">
                      <div className="h-full space-y-6 overflow-y-auto px-1">
                        {selectedConversationDetails.messages?.map(message => (
                          <div
                            key={message.id}
                            className={`flex gap-4 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {(message.role === "assistant" ||
                              message.role === "bot") && (
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-700">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[80%] rounded-xl px-5 py-4 text-sm shadow-sm ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-100 bg-gray-50 text-gray-900"
                              }`}
                            >
                              <div className="leading-relaxed font-medium break-words whitespace-pre-wrap">
                                {message.content}
                              </div>
                              <div className="mt-2.5 text-xs font-medium opacity-70">
                                {formatTimeAgo(message.created_at)}
                              </div>
                            </div>

                            {message.role === "user" && (
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="bg-green-100 font-medium text-green-700">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-7">
                      <div className="space-y-8">
                        {/* Call Information */}
                        <div>
                          <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                              <PhoneCall className="h-4 w-4 text-blue-700" />
                            </div>
                            <h4 className="text-foreground text-sm font-bold tracking-tight">
                              Call Information
                            </h4>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                            <div className="space-y-4 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Duration:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedConversationDetails.duration
                                    ? `${Math.floor((selectedConversationDetails.duration * 60) / 60)}m ${Math.floor((selectedConversationDetails.duration * 60) % 60)}s`
                                    : "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Source:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedConversationDetails.source ||
                                    "Phone"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Type:
                                </span>
                                <span className="text-foreground font-semibold capitalize">
                                  {selectedConversationDetails.type || "Call"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Messages:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedConversationDetails.messageStats
                                    ?.total ||
                                    selectedConversationDetails.messages
                                      ?.length ||
                                    0}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Created:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {formatDateTime(
                                    selectedConversationDetails.created_at
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lead Information */}
                        {selectedConversationDetails.lead && (
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
                                    {selectedConversationDetails.lead
                                      .first_name &&
                                    selectedConversationDetails.lead.last_name
                                      ? `${selectedConversationDetails.lead.first_name} ${selectedConversationDetails.lead.last_name}`
                                      : selectedConversationDetails.lead.name ||
                                        "Unknown"}
                                  </span>
                                </div>

                                {selectedConversationDetails.lead.email && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Email:
                                    </span>
                                    <span className="text-foreground max-w-[200px] truncate font-semibold">
                                      {selectedConversationDetails.lead.email}
                                    </span>
                                  </div>
                                )}

                                {selectedConversationDetails.lead
                                  .phone_number && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Phone:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {
                                        selectedConversationDetails.lead
                                          .phone_number
                                      }
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground font-medium">
                                    Status:
                                  </span>
                                  <span className="text-foreground font-semibold capitalize">
                                    {selectedConversationDetails.lead.status?.replace(
                                      /_/g,
                                      " "
                                    )}
                                  </span>
                                </div>

                                {selectedConversationDetails.lead.source && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Lead Source:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {selectedConversationDetails.lead
                                        .zoho_lead_source ||
                                        selectedConversationDetails.lead.source}
                                    </span>
                                  </div>
                                )}

                                {selectedConversationDetails.lead.follow_ups !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Follow-ups:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {
                                        selectedConversationDetails.lead
                                          .follow_ups
                                      }
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground font-medium">
                                    Lead Since:
                                  </span>
                                  <span className="text-foreground font-semibold">
                                    {formatDateTime(
                                      selectedConversationDetails.lead
                                        .created_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedConversationDetails.summary && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                <MessageCircle className="h-4 w-4 text-purple-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Conversation Summary
                              </h4>
                            </div>
                            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                              <div className="space-y-4 text-sm">
                                {(() => {
                                  try {
                                    const summary = JSON.parse(
                                      selectedConversationDetails.summary
                                    );
                                    return (
                                      <>
                                        {summary.brief && (
                                          <div>
                                            <h5 className="text-foreground mb-2 text-sm font-bold">
                                              Brief Overview:
                                            </h5>
                                            <p className="text-muted-foreground leading-relaxed font-medium">
                                              {summary.brief}
                                            </p>
                                          </div>
                                        )}
                                        {summary.detailed && (
                                          <div>
                                            <h5 className="text-foreground mb-2 text-sm font-bold">
                                              Detailed Summary:
                                            </h5>
                                            <p className="text-muted-foreground leading-relaxed font-medium">
                                              {summary.detailed}
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    );
                                  } catch {
                                    return (
                                      <p className="text-muted-foreground leading-relaxed font-medium">
                                        {selectedConversationDetails.summary}
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conversation Analysis */}
                        {selectedConversationDetails.analysis && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                                <Activity className="h-4 w-4 text-orange-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Call Analysis
                              </h4>
                            </div>
                            <div className="space-y-5">
                              {(() => {
                                try {
                                  const analysis = JSON.parse(
                                    selectedConversationDetails.analysis
                                  );
                                  return (
                                    <>
                                      {/* Sentiment */}
                                      {analysis.sentiment && (
                                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                                          <h5 className="text-foreground mb-3 text-sm font-bold">
                                            Customer Sentiment
                                          </h5>
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <span
                                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                                                  analysis.sentiment.label ===
                                                  "warm"
                                                    ? "border border-green-200 bg-green-100 text-green-800"
                                                    : analysis.sentiment
                                                          .label === "cold"
                                                      ? "border border-red-200 bg-red-100 text-red-800"
                                                      : "border border-yellow-200 bg-yellow-100 text-yellow-800"
                                                }`}
                                              >
                                                {analysis.sentiment.label.toUpperCase()}
                                              </span>
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                              {analysis.sentiment.explanation}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Qualification */}
                                      {analysis.qualification && (
                                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                                          <h5 className="text-foreground mb-3 text-sm font-bold">
                                            Lead Qualification
                                          </h5>
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <span
                                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                                                  analysis.qualification
                                                    .qualified === "true"
                                                    ? "border border-green-200 bg-green-100 text-green-800"
                                                    : "border border-red-200 bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {analysis.qualification
                                                  .qualified === "true"
                                                  ? "QUALIFIED"
                                                  : "NOT QUALIFIED"}
                                              </span>
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                              {analysis.qualification.reason}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* CRM Status */}
                                      {analysis.crm && (
                                        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 shadow-sm">
                                          <h5 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold">
                                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                            CRM Lead Status
                                          </h5>
                                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                              <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                Status
                                              </div>
                                              <div className="text-sm font-bold text-slate-900">
                                                {analysis.crm.lead_status}
                                              </div>
                                            </div>
                                            <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                              <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                Disposition
                                              </div>
                                              <div className="text-sm font-bold text-slate-900">
                                                {analysis.crm.lead_disposition}
                                              </div>
                                            </div>
                                            {analysis.crm
                                              .lead_status_reason && (
                                              <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-4 md:col-span-2">
                                                <div className="mb-1 text-xs font-bold tracking-wider text-amber-600 uppercase">
                                                  Status Reason
                                                </div>
                                                <div className="text-sm font-bold text-amber-800">
                                                  {
                                                    analysis.crm
                                                      .lead_status_reason
                                                  }
                                                </div>
                                              </div>
                                            )}
                                            {analysis.crm
                                              .lead_disposition_reason && (
                                              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 md:col-span-2">
                                                <div className="mb-1 text-xs font-bold tracking-wider text-blue-600 uppercase">
                                                  Disposition Reason
                                                </div>
                                                <div className="text-sm font-bold text-blue-800">
                                                  {
                                                    analysis.crm
                                                      .lead_disposition_reason
                                                  }
                                                </div>
                                              </div>
                                            )}
                                            {analysis.crm.next_follow_up_date &&
                                              analysis.crm
                                                .next_follow_up_date !==
                                                "not_scheduled" && (
                                                <div className="rounded-lg border border-green-100 bg-green-50/70 p-4 md:col-span-2">
                                                  <div className="mb-1 text-xs font-bold tracking-wider text-green-600 uppercase">
                                                    Next Follow-up Scheduled
                                                  </div>
                                                  <div className="text-sm font-bold text-green-800">
                                                    {
                                                      analysis.crm
                                                        .next_follow_up_date
                                                    }
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Call Quality */}
                                      {analysis.call_quality && (
                                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5">
                                          <h5 className="text-foreground mb-3 text-sm font-bold">
                                            Call Quality Assessment
                                          </h5>
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <span className="text-muted-foreground text-sm font-medium">
                                                Rating:
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-foreground text-lg font-bold">
                                                  {analysis.call_quality.rating}
                                                </span>
                                                <span className="text-muted-foreground text-sm font-medium">
                                                  / 10
                                                </span>
                                              </div>
                                            </div>
                                            {analysis.call_quality.issues && (
                                              <div>
                                                <span className="text-foreground text-sm font-bold">
                                                  Issues Identified:
                                                </span>
                                                <p className="text-muted-foreground mt-1 text-sm leading-relaxed font-medium">
                                                  {analysis.call_quality.issues}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Next Steps */}
                                      {analysis.next_steps &&
                                        analysis.next_steps.items &&
                                        analysis.next_steps.items.length >
                                          0 && (
                                          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5">
                                            <h5 className="text-foreground mb-3 text-sm font-bold">
                                              Recommended Next Steps
                                            </h5>
                                            <ul className="space-y-2.5 text-sm">
                                              {analysis.next_steps.items.map(
                                                (
                                                  step: string,
                                                  index: number
                                                ) => (
                                                  <li
                                                    key={index}
                                                    className="flex items-start gap-3"
                                                  >
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current text-blue-600"></span>
                                                    <span className="text-muted-foreground leading-relaxed font-medium">
                                                      {step}
                                                    </span>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                    </>
                                  );
                                } catch {
                                  return (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                      <p className="text-muted-foreground text-sm font-medium">
                                        Analysis data format not recognized
                                      </p>
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
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                <PhoneCall className="h-4 w-4 text-indigo-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Call Recording
                              </h4>
                            </div>
                            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50/50 p-6">
                              <audio
                                ref={audioRef}
                                controls
                                className="h-12 w-full rounded-lg"
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
