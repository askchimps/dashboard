"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Building2
} from "lucide-react";

import SectionHeader from "@/components/section-header/section-header";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organisationQueries } from "@/lib/query/organisation.query";
import { LeadFilters } from "@/lib/api/actions/organisation/get-organisation-leads";

interface LeadTabContentProps {
  className?: string;
}

export default function LeadTabContent({ className }: LeadTabContentProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 20,
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // API Integration
  const { data: leadsData, isLoading } = useQuery({
    ...organisationQueries.getLeads(orgSlug, filters),
  });

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery.trim() || undefined, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof LeadFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? undefined : value, page: 1 }));
  };

  const leads = leadsData?.leads || [];

  // Derive unique filter options from actual data
  const uniqueStatuses = [...new Set(leads.map(lead => lead.status).filter(Boolean))];
  const uniqueSources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source?.toLowerCase()) {
      case 'phone': return <PhoneCall className="h-3 w-3" />;
      case 'website': return <MessageSquare className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      default: return <Building2 className="h-3 w-3" />;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              onValueChange={(value: string) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status!} value={status!}>
                    {status!.charAt(0).toUpperCase() + status!.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.source || "all"}
              onValueChange={(value: string) => handleFilterChange('source', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source!} value={source!}>
                    {source!.charAt(0).toUpperCase() + source!.slice(1)}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        ) : leadsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leadsData.pagination.totalCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Page</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Q
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(lead => lead.status === 'qualified').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Converted</CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  C
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(lead => lead.status === 'converted').length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Table */}
        <Card>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Lead</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversations</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: filters.limit || 20 }).map((_, index) => (
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
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : !leads.length ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">
                    {filters.search || filters.status || filters.source ? "No leads found" : "No leads yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {filters.search || filters.status || filters.source
                      ? "Try adjusting your search or filters to find what you're looking for"
                      : "Leads will appear here when customers show interest in your services"
                    }
                  </p>
                  {(filters.search || filters.status || filters.source) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters(prev => ({
                          ...prev,
                          search: undefined,
                          status: undefined,
                          source: undefined,
                          page: 1
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Lead</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversations</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead.id.toString())}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                              {lead.name ? lead.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {lead.name || 'Unnamed Lead'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {lead.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[180px]">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone_number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.phone_number}</span>
                            </div>
                          )}
                          {!lead.email && !lead.phone_number && (
                            <span className="text-xs text-muted-foreground">No contact info</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {lead.source ? (
                          <div className="flex items-center gap-1">
                            {getSourceIcon(lead.source)}
                            <span className="capitalize text-sm">{lead.source}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                          {lead.status || 'Unknown'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {lead.conversations.length}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeAgo(lead.created_at)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead.id.toString());
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {lead.email && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`mailto:${lead.email}`);
                                }}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            {lead.phone_number && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${lead.phone_number}`);
                                }}
                              >
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add export functionality
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {leadsData && leadsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((leadsData.pagination.currentPage - 1) * leadsData.pagination.limit) + 1} to{' '}
                    {Math.min(
                      leadsData.pagination.currentPage * leadsData.pagination.limit,
                      leadsData.pagination.totalCount
                    )}{' '}
                    of {leadsData.pagination.totalCount} leads
                  </div>

                  <Select
                    value={filters.limit?.toString() || "10"}
                    onValueChange={(value: string) => setFilters(prev => ({
                      ...prev,
                      limit: parseInt(value),
                      page: 1
                    }))}
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
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                    disabled={!leadsData.pagination.hasPrevPage}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {leadsData.pagination.currentPage} of {leadsData.pagination.totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                    disabled={!leadsData.pagination.hasNextPage}
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
