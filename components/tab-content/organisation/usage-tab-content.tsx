"use client";

import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import SectionHeader from "@/components/section-header/section-header";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganisationUsage } from "@/lib/hooks/organisation/use-organisation-usage";
import { IDailyUsage } from "@/types/usage";

const getChartConfig = (creditsPlan: "CONVERSATION" | "MESSAGE") => {
  const primaryLabel =
    creditsPlan === "CONVERSATION" ? "Conversation Credits" : "Message Credits";
  const primaryKey =
    creditsPlan === "CONVERSATION" ? "conversationCredits" : "messageCredits";

  return {
    [primaryKey]: {
      label: primaryLabel,
      color: "hsl(var(--chart-1))",
    },
    callCredits: {
      label: "Call Credits",
      color: "hsl(var(--chart-2))",
    },
  } as const;
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

const transformChartData = (
  dailyUsage: IDailyUsage[],
  startDate: string,
  endDate: string,
  creditsPlan: "CONVERSATION" | "MESSAGE"
) => {
  const dataMap = new Map<string, IDailyUsage>();
  dailyUsage.forEach(day => {
    dataMap.set(day.date, day);
  });

  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const primaryKey =
    creditsPlan === "CONVERSATION" ? "conversationCredits" : "messageCredits";

  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const dateStr = current.toISOString().split("T")[0];
    const existingData = dataMap.get(dateStr);

    result.push({
      date: formatDate(dateStr),
      fullDate: dateStr,
      [primaryKey]:
        creditsPlan === "CONVERSATION"
          ? existingData?.usedConversationCredits || 0
          : existingData?.usedMessageCredits || 0,
      callCredits: existingData?.usedCallCredits || 0,
    });
  }

  return result;
};

export default function UsageTabContent() {
  const params = useParams();
  const { orgSlug } = params;
  const {
    data: usage,
    isLoading,
    error,
  } = useOrganisationUsage(orgSlug as string);

  if (isLoading) {
    return (
      <>
        <SectionHeader label="Usage" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="@container/card rounded-sm">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div>
          <Card className="rounded-md">
            <CardHeader className="pb-4">
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto pb-2">
                <div className="w-full min-w-[400px]">
                  <div className="h-[320px] w-full p-6">
                    <Skeleton className="h-full w-full rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error || !usage) {
    return (
      <>
        <SectionHeader label="Usage" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <Card className="@container/card rounded-sm">
            <CardHeader>
              <CardDescription>Error loading usage data</CardDescription>
              <CardTitle className="text-destructive text-2xl font-semibold">
                --
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  const chartData = transformChartData(
    usage.dailyUsage,
    usage.dateRange.startDate,
    usage.dateRange.endDate,
    usage.creditsPlan
  );
  const chartConfig = getChartConfig(usage.creditsPlan);
  const primaryKey =
    usage.creditsPlan === "CONVERSATION"
      ? "conversationCredits"
      : "messageCredits";
  const chartSettings = calculateChartConfig(chartData.length);

  return (
    <>
      <SectionHeader label="Usage" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <Card className="@container/card rounded-sm">
          <CardHeader>
            <CardDescription>
              Remaining{" "}
              {usage.creditsPlan === "CONVERSATION"
                ? "Conversation"
                : "Message"}{" "}
              Credits
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage.creditsPlan === "CONVERSATION"
                ? usage.remainingConversationCredits?.toLocaleString() || 0
                : usage.remainingMessageCredits?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="@container/card rounded-sm">
          <CardHeader>
            <CardDescription>
              Used{" "}
              {usage.creditsPlan === "CONVERSATION"
                ? "Conversation"
                : "Message"}{" "}
              Credits
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage.creditsPlan === "CONVERSATION"
                ? usage.usedConversationCredits?.toLocaleString() || 0
                : usage.usedMessageCredits?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="@container/card rounded-sm">
          <CardHeader>
            <CardDescription>Remaining Call Minutes</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage.remainingCallCredits?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="@container/card rounded-sm">
          <CardHeader>
            <CardDescription>Used Call Minutes</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage.usedCallCredits?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div>
        <Card className="rounded-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Usage History
            </CardTitle>
            <CardDescription className="text-sm">
              Daily usage from {formatDate(usage.dateRange.startDate)} to{" "}
              {formatDate(usage.dateRange.endDate)}
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
                  dataKey={primaryKey}
                  fill="hsl(var(--chart-1))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={chartSettings.barSize}
                />
                <Bar
                  dataKey="callCredits"
                  fill="hsl(var(--chart-2))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={chartSettings.barSize}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
