/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Users, User, MessageSquare, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Lead,
  LeadFilters,
} from "@/lib/api/actions/organisation/get-organisation-leads";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function LeadTabContent() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  // const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 20,
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isLeadDetailsOpen, setIsLeadDetailsOpen] = useState(false);

  // API Integration
  const { data: leadsData, isLoading } = useQuery({
    ...organisationQueries.getLeads(orgSlug, filters),
  });

  const { data: selectedLeadDetails, isLoading: isLoadingLeadDetails } =
    useQuery({
      ...organisationQueries.getLeadDetails(orgSlug, selectedLeadId || ""),
      enabled: !!selectedLeadId,
    });

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
  };

  // const handleSearch = () => {
  //   setFilters(prev => ({
  //     ...prev,
  //     search: searchQuery.trim() || undefined,
  //     page: 1,
  //   }));
  // };

  // const handleClearSearch = () => {
  //   setSearchQuery("");
  //   setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
  // };

  const handleFilterChange = (
    key: keyof LeadFilters,
    value: string | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const leads = leadsData?.leads || [];

  // Use status and source options from API response
  const statusOptions = leadsData?.status || [];
  const sourceOptions = leadsData?.sources || [];

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "follow_up":
        return "bg-yellow-100 text-yellow-800";
      case "not_qualified":
        return "bg-red-100 text-red-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      case "lost":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const getSourceIcon = (source?: string) => {
  //   switch (source?.toLowerCase()) {
  //     case "ivr":
  //     case "phone":
  //       return <PhoneCall className="h-3 w-3" />;
  //     case "zoho":
  //       return <Building2 className="h-3 w-3" />;
  //     case "instagram":
  //       return <MessageSquare className="h-3 w-3" />;
  //     case "whatsapp":
  //       return <MessageSquare className="h-3 w-3" />;
  //     case "email":
  //       return <Mail className="h-3 w-3" />;
  //     default:
  //       return <Building2 className="h-3 w-3" />;
  //   }
  // };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <SectionHeader label="Leads" />
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            onApply={handleDateRangeApply}
            startDate={filters.startDate}
            endDate={filters.endDate}
            isLoading={isLoading}
          />
          {/* Filters */}
          <div className="flex gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("status", value)
              }
            >
              <SelectTrigger className="w-32">
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

            <Select
              value={filters.source || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("source", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sourceOptions.map(source => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      {/* <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>


      </div> */}

      {/* Content */}
      <div className="space-y-6">
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
          leadsData && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Leads
                  </CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadsData.stats.total_leads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    New
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadsData.stats.new_leads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qualified
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Q
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadsData.stats.qualified_leads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Junk Leads
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Junk
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadsData.stats.junk_leads}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Lead</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Source
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Conversations
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: filters.limit || 20 }).map(
                      (_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-3 w-3 rounded" />
                              <Skeleton className="h-4 w-4" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded" />
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              ) : !leads.length ? (
                <div className="px-6 py-12 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-foreground font-medium">
                      {filters.search || filters.status || filters.source
                        ? "No leads found"
                        : "No leads yet"}
                    </h3>
                    <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                      {filters.search || filters.status || filters.source
                        ? "Try adjusting your search or filters to find what you're looking for"
                        : "Leads will appear here when customers show interest in your services"}
                    </p>
                    {(filters.search || filters.status || filters.source) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // setSearchQuery("");
                          setFilters(prev => ({
                            ...prev,
                            search: undefined,
                            status: undefined,
                            source: undefined,
                            page: 1,
                          }));
                        }}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Lead</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Source
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Conversations
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Created
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map(lead => (
                        <TableRow
                          key={lead.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedLeadId(lead.id.toString());
                            setIsLeadDetailsOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-sm text-blue-600">
                                  {lead.full_name || lead.first_name ? (
                                    (lead.full_name || lead.first_name)
                                      ?.charAt(0)
                                      .toUpperCase()
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {lead.full_name ||
                                    (lead.first_name && lead.last_name
                                      ? `${lead.first_name} ${lead.last_name}`
                                      : lead.first_name ||
                                        lead.email ||
                                        "Unknown")}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  ID: {lead.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              {lead.email ? (
                                <span
                                  className="block max-w-[150px] truncate"
                                  title={lead.email}
                                >
                                  {lead.email}
                                </span>
                              ) : lead.phone_number ? (
                                <span className="block">
                                  {lead.phone_number}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No contact
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`text-xs ${getStatusColor(lead.status)}`}
                            >
                              {lead.status
                                ? statusOptions.find(
                                    option => option.value === lead.status
                                  )?.label
                                : "Unknown"}
                            </Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm capitalize">
                              {lead.source || "Unknown"}
                            </span>
                          </TableCell>

                          {/* <TableCell>
                            {lead.agents && lead.agents.length > 0 ? (
                              <div className="text-sm">
                                {lead.agents.map((agent, idx) => (
                                  <span key={agent.id}>
                                    {idx > 0 && ", "}
                                    <span className="font-medium">{agent.name}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No agents</span>
                            )}
                          </TableCell> */}

                          <TableCell className="hidden lg:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <MessageSquare className="text-muted-foreground h-3 w-3" />
                                <span>
                                  {(lead.total_calls || 0) +
                                    (lead.total_chats || 0)}{" "}
                                  conversation
                                  {(lead.total_calls || 0) +
                                    (lead.total_chats || 0) !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                              {(lead.latest_call || lead.latest_chat) && (
                                <div className="text-muted-foreground text-xs">
                                  Latest:{" "}
                                  {lead.latest_call && lead.latest_chat
                                    ? formatTimeAgo(
                                        new Date(lead.latest_call.started_at) >
                                          new Date(lead.latest_chat.created_at)
                                          ? lead.latest_call.started_at
                                          : lead.latest_chat.created_at
                                      )
                                    : lead.latest_call
                                      ? formatTimeAgo(
                                          lead.latest_call.started_at
                                        )
                                      : lead.latest_chat
                                        ? formatTimeAgo(
                                            lead.latest_chat.created_at
                                          )
                                        : "N/A"}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <div className="text-muted-foreground text-sm">
                              {formatTimeAgo(lead.created_at)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 cursor-pointer p-0"
                              onClick={() =>
                                router.push(`/${orgSlug}/leads/${lead.id}`)
                              }
                            >
                              <span className="sr-only">Open menu</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {leadsData && leadsData.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between border-t p-6">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground text-sm">
                    Showing{" "}
                    {(leadsData.pagination.current_page - 1) *
                      leadsData.pagination.per_page +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      leadsData.pagination.current_page *
                        leadsData.pagination.per_page,
                      leadsData.pagination.total
                    )}{" "}
                    of {leadsData.pagination.total} leads
                  </div>

                  <Select
                    value={filters.limit?.toString() || "10"}
                    onValueChange={(value: string) =>
                      setFilters(prev => ({
                        ...prev,
                        limit: parseInt(value),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters(prev => ({ ...prev, page: prev.page! - 1 }))
                    }
                    disabled={leadsData.pagination.current_page === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Page {leadsData.pagination.current_page} of{" "}
                      {leadsData.pagination.total_pages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters(prev => ({ ...prev, page: prev.page! + 1 }))
                    }
                    disabled={
                      leadsData.pagination.current_page ===
                      leadsData.pagination.total_pages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
