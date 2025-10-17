"use client";

import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
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

  // Initialize with last 30 days
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 29), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
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
    overview.leadCount > 0
      ? ((overview.qualifiedLeadCount / overview.leadCount) * 100).toFixed(1)
      : "0";

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
              title="Total Conversations"
              value={overview.conversationCount.toLocaleString()}
              description="Chat conversations in period"
              icon={<MessageCircle />}
            />
          </div>

          <div className="delay-200 duration-500">
            <KPICard
              title="Total Calls"
              value={overview.callCount.toLocaleString()}
              description="Voice calls in period"
              icon={<Phone />}
            />
          </div>

          <div className="delay-300 duration-500">
            <KPICard
              title="Total Leads"
              value={overview.leadCount.toLocaleString()}
              description="Leads generated"
              icon={<Users />}
            />
          </div>

          <div className="delay-400 duration-500">
            <KPICard
              title="Qualified Leads"
              value={overview.qualifiedLeadCount.toLocaleString()}
              description={
                overview.leadCount > 0
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
              data={overview.conversationCountPerDay}
              title="Daily Conversations"
              description="Chat conversations over time"
              dataKey="conversations"
              color="hsl(var(--chart-1))"
            />
          </div>

          <div className="delay-600 duration-500">
            <OverviewChart
              data={overview.callCountPerDay}
              title="Daily Calls"
              description="Voice calls over time"
              dataKey="calls"
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
