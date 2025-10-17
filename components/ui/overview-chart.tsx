"use client";

import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { IDailyCount } from "@/types/overview";
import { format, parseISO, differenceInDays, eachDayOfInterval } from "date-fns";

interface OverviewChartProps {
  data: IDailyCount[];
  title: string;
  description?: string;
  dataKey: string;
  color?: string;
}

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "hsl(var(--chart-1))",
  },
  calls: {
    label: "Calls", 
    color: "hsl(var(--chart-2))",
  },
};

export default function OverviewChart({ 
  data, 
  title, 
  description, 
  dataKey,
  color = "hsl(var(--chart-1))"
}: OverviewChartProps) {
  
  // Create a complete date range with all dates (fill missing dates with count: 0)
  const createCompleteDataRange = (data: IDailyCount[]) => {
    if (data.length === 0) return [];
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startDate = parseISO(sortedData[0].date);
    const endDate = parseISO(sortedData[sortedData.length - 1].date);
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const dataMap = new Map(data.map(item => [item.date, item.count]));
    
    return allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
        displayDate: format(date, 'MMM dd')
      };
    });
  };

  const completeData = createCompleteDataRange(data);
  const totalCount = completeData.reduce((sum, item) => sum + item.count, 0);
  const maxValue = Math.max(...completeData.map(item => item.count));
  const hasNonZeroData = completeData.some(item => item.count > 0);
  
  // Smart tick interval based on data length
  const getTickInterval = (dataLength: number) => {
    if (dataLength <= 7) return 0; // Show all dates for week or less
    if (dataLength <= 15) return 1; // Every other day
    if (dataLength <= 30) return Math.ceil(dataLength / 7); // ~Weekly intervals
    return Math.ceil(dataLength / 8); // ~8 ticks for longer periods
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const daysDiff = differenceInDays(parseISO(completeData[completeData.length - 1]?.date || dateString), parseISO(completeData[0]?.date || dateString));
      
      if (daysDiff <= 7) {
        return format(date, 'MMM dd'); // "Jan 15"
      } else if (daysDiff <= 30) {
        return format(date, 'MM/dd'); // "01/15"
      } else {
        return format(date, 'MMM dd'); // "Jan 15"
      }
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            Total: {totalCount}
          </span>
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">No data available</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {!hasNonZeroData && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 rounded">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg mb-1">0</div>
                  <p className="text-xs">No activity in this period</p>
                </div>
              </div>
            )}
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={completeData} 
                  margin={{ top: 20, bottom: 5, left: -20 }}
                  barCategoryGap={completeData.length > 30 ? "10%" : "30%"}
                >
                  <CartesianGrid 
                    strokeDasharray="3 4" 
                    className="stroke-muted/20"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                    interval={getTickInterval(completeData.length)}
                    // angle={completeData.length > 15 ? -45 : 0}
                    // textAnchor={completeData.length > 15 ? "end" : "middle"}
                    tick={{ fontSize: 10 }}
                    height={completeData.length > 15 ? 60 : 40}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                    domain={[0, (dataMax: number) => {
                      if (dataMax === 0) return 5;
                      const roundedMax = Math.ceil(dataMax * 1.1);
                      return roundedMax < 5 ? 5 : roundedMax;
                    }]}
                    allowDataOverflow={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const num = Number(value);
                      return Number.isInteger(num) ? num.toString() : Math.round(num).toString();
                    }}
                    allowDecimals={false}
                    type="number"
                  />
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      labelFormatter={(value) => {
                        try {
                          return format(parseISO(value as string), 'EEEE, MMM dd, yyyy');
                        } catch {
                          return value as string;
                        }
                      }}
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString()}`,
                        chartConfig[dataKey as keyof typeof chartConfig]?.label || dataKey
                      ]}
                    />
                  }
                />
                  <Bar
                    dataKey="count"
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={completeData.length <= 7 ? 80 : completeData.length <= 15 ? 60 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}