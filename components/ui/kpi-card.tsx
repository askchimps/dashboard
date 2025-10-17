import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export default function KPICard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground h-4 w-4">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive !== false ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.isPositive !== false ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1 text-xs">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
