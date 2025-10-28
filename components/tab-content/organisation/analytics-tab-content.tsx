"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  TrendingUp,
  MessageSquare,
  Phone,
  Users,
  Clock,
  Calendar,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import SectionHeader from "@/components/section-header/section-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsFilters } from "@/lib/api/actions/organisation/get-organisation-analytics";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function AnalyticsTabContent() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // API Integration
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    ...organisationQueries.getAnalytics(orgSlug, filters),
  });

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleFilterChange = (
    key: keyof AnalyticsFilters,
    value: string | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateChartConfig = (dataLength: number) => {
    const minBarWidth = 24;
    const maxBarWidth = 60;
    const baseWidth = 400;

    const calculatedWidth = Math.max(baseWidth, dataLength * minBarWidth);
    const maxWidth =
      typeof window !== "undefined" ? window.innerWidth - 100 : 1200;
    const finalWidth = Math.min(calculatedWidth, maxWidth);

    let interval: number | "preserveStartEnd";
    if (dataLength <= 7) {
      interval = 0;
    } else if (dataLength <= 14) {
      interval = 1;
    } else if (dataLength <= 30) {
      interval = Math.floor(dataLength / 8);
    } else {
      interval = Math.floor(dataLength / 10);
    }

    return {
      width: finalWidth,
      interval,
      barSize: Math.min(
        maxBarWidth,
        Math.max(minBarWidth, (finalWidth - 100) / dataLength)
      ),
    };
  };

  const chartConfig = {
    conversations: {
      label: "Conversations",
      color: "hsl(var(--chart-1))",
    },
    calls: {
      label: "Calls",
      color: "hsl(var(--chart-2))",
    },
    leads: {
      label: "Leads",
      color: "hsl(var(--chart-3))",
    },
  } as const;

  // Transform daily breakdown data for charts
  const chartData =
    analyticsData?.dailyBreakdown.map(day => ({
      date: formatDate(day.date),
      fullDate: day.date,
      conversations: day.conversations,
      calls: day.calls,
      leads: day.leads,
    })) || [];

  const chartSettings = calculateChartConfig(chartData.length);

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <SectionHeader label="Analytics" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 1 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[320px] w-full p-6">
                  <Skeleton className="h-full w-full rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  // Error state
  if (error || !analyticsData) {
    return (
      <>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <SectionHeader label="Analytics" />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-destructive text-lg font-medium">
                Error loading analytics
              </div>
              <div className="text-muted-foreground">
                Please try again later
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Use filter options from API response
  const typeOptions = analyticsData?.types || [];
  const sourceOptions = analyticsData?.sources || [];
  const agentOptions = analyticsData?.agents || [];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <SectionHeader label="Analytics" />
          {/* <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {analyticsData.creditsPlan}
                    </Badge> */}
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
              value={filters.type || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("type", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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

            <Select
              value={filters.agent || "all"}
              onValueChange={(value: string) =>
                handleFilterChange("agent", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agentOptions.map(agent => (
                  <SelectItem key={agent.value} value={agent.value}>
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Core Metrics */}
          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversations
              </CardTitle>
              <MessageSquare className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.conversationAnalytics.totalConversations.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                Used credits:{" "}
                {analyticsData.usedConversationCredits.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.conversationAnalytics.totalCalls.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                Used credits: {analyticsData.usedCallCredits.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leads Generated
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.conversationAnalytics.totalLeadsGenerated.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                From selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Chat Length
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.conversationAnalytics.averageConversationLength.toFixed(
                  1
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Messages per chat
              </p>
            </CardContent>
          </Card>

          {/* Credits & Performance */}
          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining{" "}
                {analyticsData.creditsPlan === "CONVERSATION"
                  ? "Conversation"
                  : "Message"}{" "}
                Credits
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.remainingConversationCredits.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">Available credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Call Credits
              </CardTitle>
              <Phone className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.remainingCallCredits.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">Available minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Call Length
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(analyticsData.conversationAnalytics.averageCallLength)}m{" "}
                {Math.floor((analyticsData.conversationAnalytics.averageCallLength % 1) * 60)}s
              </div>
              <p className="text-muted-foreground text-xs">Average duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-grow flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date Range</CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {formatDate(analyticsData.dateRange.startDate)} -{" "}
                {formatDate(analyticsData.dateRange.endDate)}
              </div>
              <p className="text-muted-foreground text-xs">Analysis period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Daily Activity
              </CardTitle>
              <CardDescription className="text-sm">
                Conversations, calls, and leads over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[320px] w-full"
              >
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    className="text-muted-foreground"
                    interval={chartSettings.interval}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    className="text-muted-foreground"
                    tickMargin={10}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value, payload) => {
                          if (payload && payload[0] && payload[0].payload) {
                            return new Date(
                              payload[0].payload.fullDate
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                          }
                          return value;
                        }}
                        formatter={(value, name) => [
                          <span key="value" className="font-mono font-medium">
                            {typeof value === "number"
                              ? value.toLocaleString()
                              : value}
                          </span>,
                          <span key="label" className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]
                              ?.label || name}
                          </span>,
                        ]}
                        className="bg-background/95 rounded-lg border shadow-lg backdrop-blur-sm"
                        indicator="dot"
                        hideLabel={false}
                      />
                    }
                  />
                  <Bar
                    dataKey="conversations"
                    fill="hsl(var(--chart-1))"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={chartSettings.barSize}
                  />
                  <Bar
                    dataKey="calls"
                    fill="hsl(var(--chart-2))"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={chartSettings.barSize}
                  />
                  <Bar
                    dataKey="leads"
                    fill="hsl(var(--chart-3))"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={chartSettings.barSize}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Trend Analysis Chart */}
          {/* <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Trend Analysis</CardTitle>
                            <CardDescription className="text-sm">
                                Performance trends over the selected period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
                                <LineChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--border))"
                                        strokeOpacity={0.3}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        className="text-muted-foreground"
                                        interval={chartSettings.interval}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        className="text-muted-foreground"
                                        tickMargin={10}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value, payload) => {
                                                    if (payload && payload[0] && payload[0].payload) {
                                                        return new Date(payload[0].payload.fullDate).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        });
                                                    }
                                                    return value;
                                                }}
                                                formatter={(value, name) => [
                                                    <span key="value" className="font-mono font-medium">
                                                        {typeof value === "number" ? value.toLocaleString() : value}
                                                    </span>,
                                                    <span key="label" className="text-muted-foreground">
                                                        {chartConfig[name as keyof typeof chartConfig]?.label || name}
                                                    </span>,
                                                ]}
                                                className="bg-background/95 rounded-lg border shadow-lg backdrop-blur-sm"
                                                indicator="dot"
                                                hideLabel={false}
                                            />
                                        }
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="conversations"
                                        stroke="hsl(var(--chart-1))"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="calls"
                                        stroke="hsl(var(--chart-2))"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="hsl(var(--chart-3))"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card> */}
        </div>

        {/* Active Filters Display */}
        {/* {(filters.type || filters.source || filters.agent) && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Active Filters:</span>
                                </div>
                                <div className="flex gap-2">
                                    {filters.type && (
                                        <Badge variant="secondary">
                                            Type: {filters.type}
                                        </Badge>
                                    )}
                                    {filters.source && (
                                        <Badge variant="secondary">
                                            Source: {filters.source}
                                        </Badge>
                                    )}
                                    {filters.agent && (
                                        <Badge variant="secondary">
                                            Agent: {filters.agent}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFilters(prev => ({
                                            startDate: prev.startDate,
                                            endDate: prev.endDate,
                                        }))}
                                        className="h-6 px-2 text-xs"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )} */}
      </div>
    </>
  );
}
