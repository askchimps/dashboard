"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Activity,
  PhoneCall,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const { data, isLoading, error } = useQuery(
    organisationQueries.getLeadDetails(orgSlug, leadId)
  );

  const lead = data?.lead;

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
            <h1 className="text-2xl font-bold">
              {lead.name || "Unnamed Lead"}
            </h1>
            <p className="text-muted-foreground">Lead ID: {lead.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Name
                  </label>
                  <p className="mt-1">{lead.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
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
                  <label className="text-muted-foreground text-sm font-medium">
                    Email
                  </label>
                  <p className="mt-1">{lead.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Phone
                  </label>
                  <p className="mt-1">{lead.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Source
                  </label>
                  <p className="mt-1 capitalize">{lead.source || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Follow-ups
                  </label>
                  <p className="mt-1">
                    {typeof lead.follow_ups === "number" ? lead.follow_ups : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conversations</CardTitle>
              <Badge variant="secondary">{lead.conversations.length}</Badge>
            </CardHeader>
            <CardContent>
              {lead.conversations.length > 0 ? (
                <div className="space-y-3">
                  {lead.conversations.map(conv => (
                    <div
                      key={conv.id}
                      className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                      onClick={() => {
                        const tab =
                          conv.type === "CALL" ? "call-logs" : "chat-logs";
                        router.push(
                          `/${orgSlug}/${tab}?conversation=${conv.id}`
                        );
                      }}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {conv.type === "CALL" ? (
                            <PhoneCall className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <MessageSquare className="text-muted-foreground h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {conv.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conv.type}
                        </Badge>
                      </div>
                      {conv.summary && (
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {conv.summary}
                        </p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>
                          {formatDistanceToNow(new Date(conv.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {conv.duration && (
                          <span>
                            • {Math.floor((conv.duration * 60) / 60)}m{" "}
                            {Math.floor((conv.duration * 60) % 60)}s
                          </span>
                        )}
                        {conv.message_count && (
                          <span>• {conv.message_count} messages</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No conversations yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {lead.additional_info &&
            Object.keys(lead.additional_info).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
                    {JSON.stringify(lead.additional_info, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.agents.length > 0 ? (
                <div className="space-y-3">
                  {lead.agents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {agent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {agent.slug}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No agents assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Lead Created</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(lead.created_at)}
                  </p>
                </div>
              </div>

              {lead.updated_at !== lead.created_at && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(lead.updated_at)}
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
