"use client";

import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  PhoneCall,
  MessageCircle,
  User,
  Activity,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ExternalLink,
} from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CallFilters } from "@/lib/api/actions/organisation/get-organisation-calls";
import { organisationQueries } from "@/lib/query/organisation.query";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CallLogTabContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get call ID from query parameter
  const callFromQuery = searchParams.get("call");

  const [selectedCallId, setSelectedCallId] = useState<string | null>(callFromQuery);
  const [activeTab, setActiveTab] = useState("chat");
  const [filters, setFilters] = useState<CallFilters>({
    start_date: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    end_date: format(new Date(), "yyyy-MM-dd"),
    page: 1,
    limit: 100,
  });
  const callRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Track if user has manually scrolled the calls list
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // Update selected call when query parameter changes
  useEffect(() => {
    if (callFromQuery) {
      setSelectedCallId(callFromQuery);
    }
  }, [callFromQuery]);

  // Infinite Query for Calls
  const {
    data: callsData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["organisation", orgSlug, "calls", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await organisationQueries.getCalls(orgSlug, { ...filters, page: pageParam }).queryFn();
      return response;
    },
    getNextPageParam: (lastPage: {pagination?: {current_page: number; total_pages: number}}) => {
      if (!lastPage?.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  const { data: selectedCallDetails, isLoading: isLoadingDetails } = useQuery({
    ...organisationQueries.getCallDetails(orgSlug, selectedCallId || ""),
    enabled: !!selectedCallId,
  });

  // Stop audio playback when call changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedCallId]);

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate,
      page: 1,
    }));
    setSelectedCallId(null);
  };

  // Infinite scroll handler for useInfiniteQuery
  const callsListContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = callsListContainerRef.current;
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

  const handleFilterChange = (
    key: keyof CallFilters,
    value: string | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  // Flatten calls from all pages
  const calls = Array.isArray(callsData?.pages)
    ? callsData.pages.flatMap(page => page.calls || [])
    : [];
  
  // Get unique status options from all pages
  const statusOptions = Array.isArray(callsData?.pages)
    ? Array.from(
        new Map(
          callsData.pages
            .flatMap(page => page.statuses || [])
            .map(status => [status.value, status])
        ).values()
      )
    : [];

  // Scroll selected call into view
  // Scroll selected call into view only if user hasn't manually scrolled
  useEffect(() => {
    if (!selectedCallId || hasUserScrolled) return;
    const el = callRefs.current[selectedCallId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    else {
      fetchNextPage();
    }
  }, [selectedCallId, calls, hasUserScrolled]);

  // Reset hasUserScrolled when filters change or selectedCallId changes (e.g., new navigation)
  useEffect(() => {
    setHasUserScrolled(false);
  }, [filters, selectedCallId]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <SectionHeader label="Call Logs" />
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            onApply={handleDateRangeApply}
            startDate={filters.start_date}
            endDate={filters.end_date}
            isLoading={isLoading}
          />

          <div className="flex gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("status", value)
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        callsData && callsData.pages && callsData.pages[0] && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Calls
                </CardTitle>
                <PhoneCall className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {callsData.pages[0].stats.total_calls}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Calls
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <PhoneIncoming className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {callsData.pages[0].stats.active_calls}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Missed Calls
                </CardTitle>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <PhoneMissed className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {callsData.pages[0].stats.missed_calls}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disconnected
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  <PhoneOutgoing className="h-3 w-3" />
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {callsData.pages[0].stats.disconnected_calls}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-100px)] flex-col gap-6 lg:flex-row">
        {/* Left Panel - Calls List */}
        <div className="h-80 w-full lg:h-full lg:w-80 lg:flex-shrink-0">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            <div className="flex-1 overflow-hidden">
              <div ref={callsListContainerRef} className="h-full overflow-y-auto">
                {isLoading && calls.length === 0 ? (
                  <div className="space-y-1 p-2">
                    {/* Skeleton loading for call list */}
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
                ) : !calls.length ? (
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
                    {calls.map(call => (
                      <div
                        key={call.id}
                        ref={el => { callRefs.current[call.id] = el; }}
                        onClick={() => {
                          setSelectedCallId(call.id.toString());
                          router.push(`/${orgSlug}/call-logs?call=${call.id}`, {
                            scroll: false,
                          });
                        }}
                        className={`hover:bg-muted/70 cursor-pointer rounded-xl p-5 transition-all duration-200 hover:shadow-sm ${selectedCallId === call.id.toString()
                          ? "bg-muted border-border border shadow-sm ring-1 ring-blue-100"
                          : "hover:border-muted border border-transparent"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-foreground line-clamp-1 text-sm leading-tight font-semibold">
                                  {call.lead?.first_name || call.lead?.last_name
                                    ? `${call.lead.first_name ?? ""} ${call.lead.last_name ?? ""}`
                                    : call.lead?.phone_number ||
                                    call.from_number}
                                </h4>
                              </div>
                              <span className="text-muted-foreground shrink-0 text-xs font-medium">
                                {formatTimeAgo(call.started_at)}
                              </span>
                            </div>

                            {call.summary && (
                              <p className="text-muted-foreground mt-2.5 line-clamp-2 text-xs leading-relaxed">
                                {(() => {
                                  try {
                                    const summary = JSON.parse(call.summary);
                                    return summary.short || summary.brief;
                                  } catch {
                                    return call.summary;
                                  }
                                })()}
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

        {/* Right Panel - Call Details Interface */}
        <div className="min-h-0 min-w-0 flex-1">
          <div className="border-border flex h-full flex-col rounded-lg border bg-white">
            {selectedCallId && isLoadingDetails ? (
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
            ) : selectedCallId && selectedCallDetails ? (
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
                        {selectedCallDetails.agent?.name || "AI Assistant"}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium">
                        {selectedCallDetails.source || "Phone"} • Call Session
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tabs */}
                <div className="flex border-b bg-gray-50/50 px-7">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`border-b-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${activeTab === "chat"
                      ? "border-primary text-primary -mb-px bg-white"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/50"
                      }`}
                  >
                    <MessageCircle className="mr-2.5 inline h-4 w-4" />
                    Call Transcript
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
                  {activeTab === "chat" ? (
                    <div className="h-full flex flex-col">
                      {!selectedCallDetails.messages ||
                        selectedCallDetails.messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center text-center">
                          <div className="space-y-4">
                            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                              <MessageCircle className="text-muted-foreground h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-foreground font-medium">
                                No transcript available
                              </h3>
                              <p className="text-muted-foreground max-w-sm text-sm">
                                No messages or transcript found for this call.
                                The conversation may not have been recorded or
                                processed yet.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                            {selectedCallDetails.messages.map(message => (
                              <div
                                key={message.id}
                                className={`flex gap-4 ${message.role === "user"
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
                                  className={`max-w-[80%] rounded-xl px-5 py-4 text-sm shadow-sm ${message.role === "user"
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

                          {/* Sticky Recording at Bottom */}
                          {selectedCallDetails.recording_url && (
                            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 shadow-lg">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100">
                                  <PhoneCall className="h-3 w-3 text-indigo-700" />
                                </div>
                                <h5 className="text-foreground text-sm font-semibold">
                                  Call Recording
                                </h5>
                              </div>
                              <audio
                                ref={audioRef}
                                controls
                                className="h-10 w-full rounded-lg"
                                key={selectedCallId}
                              >
                                <source
                                  src={selectedCallDetails.recording_url}
                                  type="audio/wav"
                                />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                        </>
                      )}
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
                                  {selectedCallDetails.duration
                                    ? `${Math.floor((selectedCallDetails.duration * 60) / 60)}m ${Math.round((selectedCallDetails.duration * 60) % 60)}s`
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Source:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedCallDetails.source || "Phone"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Direction:
                                </span>
                                <span className="text-foreground font-semibold capitalize">
                                  {selectedCallDetails.direction || "Outbound"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Status:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {selectedCallDetails.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-medium">
                                  Started:
                                </span>
                                <span className="text-foreground font-semibold">
                                  {formatDateTime(
                                    selectedCallDetails.started_at
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lead Information */}
                        {selectedCallDetails.lead && (
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
                                  <Link
                                    href={`/${orgSlug}/leads/${selectedCallDetails.lead.id}`}
                                    target="_blank"
                                    className="text-foreground font-semibold hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group"
                                  >
                                    <span>
                                      {selectedCallDetails.lead.first_name ||
                                        selectedCallDetails.lead.last_name
                                        ? `${selectedCallDetails.lead.first_name ?? ""} ${selectedCallDetails.lead.last_name ?? ""}`
                                        : selectedCallDetails.lead.phone_number ||
                                        "Unknown"}
                                    </span>
                                    <ExternalLink className="h-3 w-3 transition-opacity duration-200" />
                                  </Link>
                                </div>
                                {selectedCallDetails.lead.email && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Email:
                                    </span>
                                    <span className="text-foreground max-w-[200px] truncate font-semibold">
                                      {selectedCallDetails.lead.email}
                                    </span>
                                  </div>
                                )}
                                {selectedCallDetails.lead.phone_number && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Phone:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {selectedCallDetails.lead.phone_number}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground font-medium">
                                    Status:
                                  </span>
                                  <span className="text-foreground font-semibold capitalize">
                                    {selectedCallDetails.lead.status?.replace(
                                      /_/g,
                                      " "
                                    )}
                                  </span>
                                </div>
                                {selectedCallDetails.lead.source && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">
                                      Lead Source:
                                    </span>
                                    <span className="text-foreground font-semibold">
                                      {selectedCallDetails.lead.source}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedCallDetails.summary && (
                          <div>
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                <MessageCircle className="h-4 w-4 text-purple-700" />
                              </div>
                              <h4 className="text-foreground text-sm font-bold tracking-tight">
                                Call Summary
                              </h4>
                            </div>
                            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                              <div className="space-y-4 text-sm">
                                {(() => {
                                  try {
                                    const summary = JSON.parse(
                                      selectedCallDetails.summary
                                    );
                                    return (
                                      <>
                                        {summary.short && (
                                          <div>
                                            <h5 className="text-foreground mb-2 text-sm font-bold">
                                              Brief Overview:
                                            </h5>
                                            <p className="text-muted-foreground leading-relaxed font-medium">
                                              {summary.short}
                                            </p>
                                          </div>
                                        )}
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
                                        {selectedCallDetails.summary}
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Analysis */}
                        {selectedCallDetails.analysis && (
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
                                    selectedCallDetails.analysis
                                  );
                                  console.log("Parsed Analysis:", analysis);
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
                                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${(analysis.sentiment?.value ||
                                                  analysis.sentiment
                                                    ?.label) === "warm"
                                                  ? "border border-green-200 bg-green-100 text-green-800"
                                                  : (analysis.sentiment
                                                    ?.value ??
                                                    analysis.sentiment
                                                      ?.label) === "cold"
                                                    ? "border border-red-200 bg-red-100 text-red-800"
                                                    : "border border-yellow-200 bg-yellow-100 text-yellow-800"
                                                  }`}
                                              >
                                                {analysis.sentiment?.value?.toUpperCase() ||
                                                  analysis.sentiment?.label?.toUpperCase()}
                                              </span>
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                              {analysis.sentiment?.reason ??
                                                analysis.sentiment?.explanation}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* CRM Status & Disposition */}
                                      {(analysis.status ||
                                        analysis.disposition) && (
                                          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 shadow-sm">
                                            <h5 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold">
                                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                              CRM Lead Status
                                            </h5>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                              {analysis.status && (
                                                <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                                  <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Status
                                                  </div>
                                                  <div className="text-sm font-bold text-slate-900">
                                                    {analysis.status.value}
                                                  </div>
                                                  {analysis.status.reason && (
                                                    <div className="mt-2 text-xs text-slate-600">
                                                      {analysis.status.reason}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                              {analysis.disposition && (
                                                <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                                  <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Disposition
                                                  </div>
                                                  <div className="text-sm font-bold text-slate-900">
                                                    {analysis.disposition.value}
                                                  </div>
                                                  {analysis.disposition
                                                    .reason && (
                                                      <div className="mt-2 text-xs text-slate-600">
                                                        {
                                                          analysis.disposition
                                                            .reason
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      {(analysis.crm?.lead_status ||
                                        analysis.crm?.lead_disposition) && (
                                          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 shadow-sm">
                                            <h5 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold">
                                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                              CRM Lead Status
                                            </h5>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                              {analysis.crm?.lead_status && (
                                                <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                                  <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Status
                                                  </div>
                                                  <div className="text-sm font-bold text-slate-900">
                                                    {analysis.crm?.lead_status}
                                                  </div>
                                                  {analysis.crm
                                                    ?.lead_status_reason && (
                                                      <div className="mt-2 text-xs text-slate-600">
                                                        {
                                                          analysis.crm
                                                            ?.lead_status_reason
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              )}
                                              {analysis.crm?.lead_disposition && (
                                                <div className="rounded-lg border border-slate-100 bg-white/70 p-4">
                                                  <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                    Disposition
                                                  </div>
                                                  <div className="text-sm font-bold text-slate-900">
                                                    {
                                                      analysis.crm
                                                        ?.lead_disposition
                                                    }
                                                  </div>
                                                  {analysis.crm
                                                    ?.lead_disposition_reason && (
                                                      <div className="mt-2 text-xs text-slate-600">
                                                        {
                                                          analysis.crm
                                                            ?.lead_disposition_reason
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              )}
                                            </div>
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
                        {selectedCallDetails.recording_url && (
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
                                key={selectedCallId}
                              >
                                <source
                                  src={selectedCallDetails.recording_url}
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
    </div>
  );
}
