"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Activity,
  PhoneCall,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const leadId = params.leadId as string;

  // Fetch lead details
  const {
    data: lead,
    isLoading,
    error,
  } = useQuery(organisationQueries.getLeadDetails(orgSlug, leadId));

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="space-y-6 md:col-span-2">
            {/* Basic Information Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversations Card Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Agents Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="mb-1 h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="mb-1 h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-semibold">Lead not found</h2>
          <p className="text-muted-foreground mb-4">
            The lead you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push(`/${orgSlug}/leads`)}>
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${orgSlug}/leads`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.full_name ||
                (lead.first_name && lead.last_name
                  ? `${lead.first_name} ${lead.last_name}`
                  : lead.first_name || "Unnamed Lead")}
            </h1>
            <p className="text-gray-500">Lead ID: {lead.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="mt-1 font-medium text-gray-900">
                      {lead.full_name ||
                        (lead.first_name && lead.last_name
                          ? `${lead.first_name} ${lead.last_name}`
                          : lead.first_name || "Not provided")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">
                      {lead.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <p className="mt-1 text-gray-900">
                      {lead.phone_number || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status
                          ?.replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, l => l.toUpperCase()) || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Source
                    </label>
                    <p className="mt-1 text-gray-900 capitalize">
                      {lead.source || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Follow-ups
                    </label>
                    <p className="mt-1 text-gray-900">
                      {lead.follow_up_count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zoho Information */}
          {lead.zoho_lead && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Zoho CRM Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Zoho ID
                      </label>
                      <p className="mt-1 font-mono text-sm text-gray-900">
                        {lead.zoho_lead.id}
                      </p>
                    </div>
                    {lead.zoho_lead.lead_owner && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Lead Owner
                        </label>
                        <p className="mt-1 text-gray-900">
                          {lead.zoho_lead.lead_owner.first_name}{" "}
                          {lead.zoho_lead.lead_owner.last_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Zoho Status
                      </label>
                      <p className="mt-1 text-gray-900">
                        {lead.zoho_lead.status}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {lead.zoho_lead.disposition && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Disposition
                        </label>
                        <p className="mt-1 text-gray-900">
                          {lead.zoho_lead.disposition}
                        </p>
                      </div>
                    )}
                    {lead.zoho_lead.source && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Zoho Source
                        </label>
                        <p className="mt-1 text-gray-900">
                          {lead.zoho_lead.source}
                        </p>
                      </div>
                    )}
                    {(lead.zoho_lead.city ||
                      lead.zoho_lead.state ||
                      lead.zoho_lead.country) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Location
                        </label>
                        <p className="mt-1 text-gray-900">
                          {[
                            lead.zoho_lead.city,
                            lead.zoho_lead.state,
                            lead.zoho_lead.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {(lead.calls?.length || 0) + (lead.chats?.length || 0)}
              </Badge>
            </CardHeader>
            <CardContent>
              {lead.calls?.length > 0 || lead.chats?.length > 0 ? (
                <div className="space-y-3">
                  {/* Recent Calls */}
                  {lead.calls?.slice(0, 5).map(call => (
                    <div
                      key={`call-${call.id}`}
                      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                      onClick={() => {
                        router.push(`/${orgSlug}/call-logs?call=${call.id}`);
                      }}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <PhoneCall className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {call.agent.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-xs text-gray-600"
                        >
                          {call.status}
                        </Badge>
                      </div>
                      {call.summary && (
                        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {(() => {
                            try {
                              const parsed = JSON.parse(call.summary);
                              return (
                                parsed.short || parsed.detailed || call.summary
                              );
                            } catch {
                              return call.summary;
                            }
                          })()}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(call.started_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {call.duration && (
                          <span>
                            • {Math.floor(call.duration / 60)}m{" "}
                            {Math.floor(call.duration % 60)}s
                          </span>
                        )}
                        <span>• {call.direction}</span>
                        <span>• {call.source}</span>
                      </div>
                    </div>
                  ))}

                  {/* Recent Chats */}
                  {lead.chats?.slice(0, 3).map(chat => (
                    <div
                      key={`chat-${chat.id}`}
                      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                      onClick={() => {
                        router.push(`/${orgSlug}/chat-logs?chat=${chat.id}`);
                      }}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            Chat Session
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-xs text-gray-600"
                        >
                          {chat.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(chat.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          {/* {lead.stats && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Activity Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{lead.stats.total_calls}</div>
                    <div className="text-sm text-gray-500">Total Calls</div>
                    <div className="text-xs text-gray-400 mt-1">Cost: ₹{lead.stats.total_call_cost}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{lead.stats.total_chats}</div>
                    <div className="text-sm text-gray-500">Total Chats</div>
                    <div className="text-xs text-gray-400 mt-1">Cost: ₹{lead.stats.total_chat_cost}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-semibold text-gray-900">₹{lead.stats.total_cost}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Agents */}
          {/* <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Assigned Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.assigned_agents && lead.assigned_agents.length > 0 ? (
                <div className="space-y-3">
                  {lead.assigned_agents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-xs font-medium text-blue-600">
                          {agent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-500">{agent.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No agents assigned</p>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Activity Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Lead Created
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(lead.created_at)}
                  </p>
                </div>
              </div>

              {lead.updated_at !== lead.created_at && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(lead.updated_at)}
                    </p>
                  </div>
                </div>
              )}

              {lead.next_follow_up && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Next Follow-up
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(lead.next_follow_up)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Stats */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Lead Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Activity</span>
                <span className="font-medium text-gray-900">
                  {(lead.calls?.length || 0) + (lead.chats?.length || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Follow-ups</span>
                <span className="font-medium text-gray-900">
                  {lead.follow_up_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reschedules</span>
                <span className="font-medium text-gray-900">
                  {lead.reschedule_count || 0}
                </span>
              </div>
              {lead.is_indian !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Region</span>
                  <span className="font-medium text-gray-900">
                    {lead.is_indian ? "Indian" : "International"}
                  </span>
                </div>
              )}
              {lead.call_active !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Call</span>
                  <span
                    className={`font-medium ${lead.call_active ? "text-green-600" : "text-gray-900"}`}
                  >
                    {lead.call_active ? "Yes" : "No"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(lead.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(lead.updated_at)}
                  </p>
                </div>
              </div>

              {lead.last_follow_up && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                    <PhoneCall className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Last Follow-up
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(lead.last_follow_up)}
                    </p>
                  </div>
                </div>
              )}

              {lead.next_follow_up && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Next Follow-up
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(lead.next_follow_up)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
