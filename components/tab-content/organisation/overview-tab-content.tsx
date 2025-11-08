"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageCircle, Phone, Users, UserCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import SectionHeader from "@/components/section-header/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import KPICard from "@/components/ui/kpi-card";
import OverviewChart from "@/components/ui/overview-chart";
import { OverviewSkeleton } from "@/components/ui/overview-skeleton";
import { organisationQueries } from "@/lib/query/organisation.query";

export default function OverviewTabContent() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  // Initialize with current month (from start of month to today)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth, "yyyy-MM-dd"),
    endDate: format(now, "yyyy-MM-dd"),
  });

  const {
    data: overview,
    isLoading,
    error,
  } = useQuery({
    ...organisationQueries.getOverview(
      orgSlug,
      dateRange.startDate,
      dateRange.endDate
    ),
  });

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  if (isLoading) {
    return (
      <>
        <SectionHeader label="Overview" />
        <OverviewSkeleton />
      </>
    );
  }

  if (error || !overview) {
    return (
      <>
        <SectionHeader label="Overview" />
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground text-center">
              <p>{error ? "Error loading data" : "No data available"}</p>
              <p className="mt-1 text-sm">
                {error
                  ? "Please try again later"
                  : "Unable to load overview data"}
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const leadConversionRate =
    overview.overview.totalLeads > 0
      ? (
          (overview.overview.qualifiedLeads / overview.overview.totalLeads) *
          100
        ).toFixed(1)
      : "0";

  // Transform daily stats for charts
  const generateEmptyDataIfNeeded = (
    data: Array<{ date: string; count: number }>
  ) => {
    if (data && data.length > 0) return data;

    // Generate empty data for current date range if no data exists
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const emptyData = [];

    const currentDate = new Date(start);
    while (currentDate <= end) {
      emptyData.push({
        date: format(currentDate, "yyyy-MM-dd"),
        count: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return emptyData;
  };

  const chatData = generateEmptyDataIfNeeded(
    overview.dailyStats?.map(stat => ({
      date: stat.date,
      count: stat.chatCount,
    })) || []
  );

  const callData = generateEmptyDataIfNeeded(
    overview.dailyStats?.map(stat => ({
      date: stat.date,
      count: stat.callCount,
    })) || []
  );

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeader label="Overview" />
        <DateRangeFilter
          onApply={handleDateRangeApply}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid gap-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="delay-100 duration-500">
            <KPICard
              title="Total Chats"
              value={overview.overview.totalChats.toLocaleString()}
              description="Chat conversations in period"
              icon={<MessageCircle />}
            />
          </div>

          <div className="delay-200 duration-500">
            <KPICard
              title="Total Calls"
              value={overview.overview.totalCalls.toLocaleString()}
              description="Voice calls in period"
              icon={<Phone />}
            />
          </div>

          <div className="delay-300 duration-500">
            <KPICard
              title="Total Leads"
              value={overview.overview.totalLeads.toLocaleString()}
              description="Leads generated"
              icon={<Users />}
            />
          </div>

          <div className="delay-400 duration-500">
            <KPICard
              title="Qualified Leads"
              value={overview.overview.qualifiedLeads.toLocaleString()}
              description={
                overview.overview.totalLeads > 0
                  ? `${leadConversionRate}% of total leads`
                  : "No leads yet"
              }
              icon={<UserCheck />}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="delay-500 duration-500">
            <OverviewChart
              data={chatData}
              title="Daily Chats"
              description="Chat conversations over time"
              dataKey="count"
              color="hsl(var(--chart-1))"
            />
          </div>

          <div className="delay-600 duration-500">
            <OverviewChart
              data={callData}
              title="Daily Calls"
              description="Voice calls over time"
              dataKey="count"
              color="hsl(var(--chart-2))"
            />
          </div>
        </div>

        {/* Activity Summary */}
        {/* <div className="animate-in fade-in duration-500 delay-700">
          <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Period Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.conversationCount}</div>
                <div className="text-xs text-muted-foreground">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.callCount}</div>
                <div className="text-xs text-muted-foreground">Total Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.leadCount}</div>
                <div className="text-xs text-muted-foreground">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.qualifiedLeadCount}</div>
                <div className="text-xs text-muted-foreground">Qualified Leads</div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div> */}
      </div>
    </>
  );
}
