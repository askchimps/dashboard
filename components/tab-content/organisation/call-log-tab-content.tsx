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
                            <div className="space-y-4">
                              {(() => {
                                try {
                                  const analysis = JSON.parse(
                                    selectedConversationDetails.analysis
                                  );
                                  return (
                                    <>
                                      {/* Sentiment */}
                                      {analysis.sentiment && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                          <h5 className="mb-2 font-medium">
                                            Sentiment
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">
                                                Value:
                                              </span>
                                              <span className="font-medium capitalize">
                                                {analysis.sentiment.value}
                                              </span>
                                            </div>
                                            {analysis.sentiment.reason && (
                                              <p className="text-muted-foreground mt-2">
                                                {analysis.sentiment.reason}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Qualification */}
                                      {analysis.qualification && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                          <h5 className="mb-2 font-medium">
                                            Lead Qualification
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">
                                                Qualified:
                                              </span>
                                              <span
                                                className={`font-medium ${analysis.qualification.qualified?.value === "true" ? "text-green-600" : "text-red-600"}`}
                                              >
                                                {analysis.qualification
                                                  .qualified?.value === "true"
                                                  ? "Yes"
                                                  : "No"}
                                              </span>
                                            </div>
                                            {analysis.qualification.qualified
                                              ?.reason && (
                                              <p className="text-muted-foreground mt-2">
                                                {
                                                  analysis.qualification
                                                    .qualified.reason
                                                }
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Call Quality */}
                                      {analysis.call_quality && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                          <h5 className="mb-2 font-medium">
                                            Call Quality
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">
                                                Rating:
                                              </span>
                                              <span className="font-medium">
                                                {analysis.call_quality.rating}
                                                /10
                                              </span>
                                            </div>
                                            {analysis.call_quality.issues && (
                                              <p className="text-muted-foreground mt-2">
                                                {analysis.call_quality.issues}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Next Steps */}
                                      {analysis.next_steps && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                          <h5 className="mb-2 font-medium">
                                            Next Steps
                                          </h5>
                                          <p className="text-muted-foreground text-sm">
                                            {analysis.next_steps}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  );
                                } catch {
                                  return (
                                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                                      <p className="text-muted-foreground">
                                        {selectedConversationDetails.analysis}
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
