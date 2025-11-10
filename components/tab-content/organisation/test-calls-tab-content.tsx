/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
  TimerIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { BasicAudioPlayer } from "@/components/basic-audio-player";
import { AudioProvider } from "@/components/provider/audio-provider";
import SectionHeader from "@/components/section-header/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganisationTestCalls } from "@/lib/hooks/organisation/use-organisation-test-calls";
import { TestCall } from "@/types/test-calls";

export default function TestCallsTabContent() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const [selectedCall, setSelectedCall] = useState<TestCall | null>(null);

  const {
    data: testCallsData,
    isLoading,
    error,
  } = useOrganisationTestCalls(orgSlug);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor((duration * 60) / 60);
    const seconds = Math.floor((duration * 60) % 60);
    return `${minutes}m ${seconds}s`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <AudioProvider>
        <SectionHeader label="Test Calls" />
        <div className="space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AudioProvider>
    );
  }

  if (error || !testCallsData) {
    return (
      <AudioProvider>
        <SectionHeader label="Test Calls" />
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground text-center">
              <PhoneIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">
                Unable to load test calls
              </p>
              <p className="text-sm">
                There was an error loading the test calls data. Please try again
                later.
              </p>
            </div>
          </CardContent>
        </Card>
      </AudioProvider>
    );
  }

  // Safely destructure the response, providing defaults
  // Handle case where API returns array directly or wrapped in testCalls property
  let testCalls: TestCall[] = [];
  let pagination = {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (testCallsData) {
    if (Array.isArray(testCallsData)) {
      // API returned array directly
      testCalls = testCallsData;
    } else if (
      testCallsData.testCalls &&
      Array.isArray(testCallsData.testCalls)
    ) {
      // API returned object with testCalls property
      testCalls = testCallsData.testCalls;
      pagination = testCallsData.pagination || pagination;
    } else {
      console.warn("Unexpected test calls data structure:", testCallsData);
    }
  }

  // Calculate stats
  const totalCalls = testCalls.length;
  const totalDuration = testCalls.reduce(
    (sum: number, call: TestCall) => sum + call.call_duration,
    0
  );
  const avgDuration =
    totalCalls > 0
      ? testCalls.reduce(
          (sum: number, call: TestCall) => sum + call.call_duration,
          0
        ) / totalCalls
      : 0;

  return (
    <AudioProvider>
      <SectionHeader label="Test Calls" />

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <PhoneIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-muted-foreground text-xs">
                {pagination.totalCount} total records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Duration
              </CardTitle>
              <TimerIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(totalDuration)}
              </div>
              <p className="text-muted-foreground text-xs">
                Across all test calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Duration
              </CardTitle>
              <ClockIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(avgDuration)}
              </div>
              <p className="text-muted-foreground text-xs">Per call average</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Calls Table */}
        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {testCalls.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <PhoneIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="mb-2 text-lg font-medium">
                      No test calls found
                    </p>
                    <p className="text-sm">
                      Test calls will appear here once they are made.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[20%]">Caller</TableHead>
                            <TableHead className="w-[15%]">Duration</TableHead>
                            <TableHead className="w-[20%]">Date</TableHead>
                            <TableHead className="w-[45%]">Recording</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testCalls.map((call: TestCall) => (
                            <TableRow
                              key={call.id}
                              className={`cursor-pointer transition-colors ${
                                selectedCall?.id === call.id
                                  ? "bg-muted/50"
                                  : ""
                              }`}
                              onClick={() => setSelectedCall(call)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {/* <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(call.first_name, call.last_name)}
                                    </AvatarFallback>
                                  </Avatar> */}
                                  <div>
                                    <div className="font-medium">
                                      {call.first_name} {call.last_name}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                      {call.phone_number}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {formatDuration(call.call_duration)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(
                                    new Date(call.created_at),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {formatDistanceToNow(
                                    new Date(call.created_at),
                                    { addSuffix: true }
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <BasicAudioPlayer
                                  src={call.recording_url}
                                  callId={call.id}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-4 md:hidden">
                      {testCalls.map((call: TestCall) => (
                        <Card
                          key={call.id}
                          className={`cursor-pointer transition-colors ${
                            selectedCall?.id === call.id ? "bg-muted/50" : ""
                          }`}
                          onClick={() => setSelectedCall(call)}
                        >
                          <CardContent className="space-y-4 p-4">
                            {/* Caller Info */}
                            <div className="flex items-center gap-3">
                              {/* <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm">
                                  {getInitials(call.first_name, call.last_name)}
                                </AvatarFallback>
                              </Avatar> */}
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">
                                  {call.first_name} {call.last_name}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {call.phone_number}
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {formatDuration(call.call_duration)}
                              </Badge>
                            </div>

                            {/* Date Info */}
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <CalendarIcon className="h-3 w-3" />
                              {format(
                                new Date(call.created_at),
                                "MMM dd, yyyy"
                              )}
                              <span className="mx-2">•</span>
                              {formatDistanceToNow(new Date(call.created_at), {
                                addSuffix: true,
                              })}
                            </div>

                            {/* Audio Player - Full Width */}
                            <div className="pt-2">
                              <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-medium">
                                <PhoneIcon className="h-3 w-3" />
                                Call Recording
                              </div>
                              <BasicAudioPlayer
                                src={call.recording_url}
                                callId={call.id}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Call Details Sidebar */}
          {/* <div className="space-y-4">
            {selectedCall ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Call Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Caller
                      </label>
                      <p className="text-sm font-medium">
                        {selectedCall.first_name} {selectedCall.last_name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <p className="text-sm font-mono">
                        {selectedCall.phone_number}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Duration
                      </label>
                      <p className="text-sm">
                        {formatDuration(selectedCall.call_duration)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Organization
                      </label>
                      <p className="text-sm">
                        {selectedCall.organisation.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Call Date
                      </label>
                      <p className="text-sm">
                        {format(new Date(selectedCall.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Call Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(selectedCall.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Updated</span>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(selectedCall.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <Badge variant="outline">
                        {formatDuration(selectedCall.call_duration)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <PhoneIcon className="mx-auto h-8 w-8 mb-3 opacity-50" />
                    <p className="text-sm">
                      Select a call from the table to view details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div> */}
        </div>
      </div>
    </AudioProvider>
  );
}
