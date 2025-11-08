"use client";

import { PhoneCall, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisationUsage } from "@/lib/hooks/organisation/use-organisation-usage";
import { cn } from "@/lib/utils";

interface CreditsDisplayProps {
  className?: string;
}

export default function CreditsDisplay({ className }: CreditsDisplayProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  
  const { data: usage, isLoading, refetch } = useOrganisationUsage(orgSlug);

  // Refetch usage data every 2 minutes to keep it fresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  if (!orgSlug || isLoading) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const primaryCredits =
    usage.creditsPlan === "CONVERSATION"
      ? {
          remaining: usage.remainingConversationCredits,
          label: "Conversations",
          icon: MessageSquare,
        }
      : {
          remaining: usage.remainingMessageCredits,
          label: "Messages",
          icon: MessageSquare,
        };

  const callCredits = {
    remaining: usage.remainingCallCredits,
    label: "Call Minutes",
    icon: PhoneCall,
  };

  const getCreditsColor = (remaining: number, type: "primary" | "call") => {
    if (type === "call") {
      // For call minutes, consider low when less than 30 minutes
      if (remaining < 30) return "text-destructive";
      if (remaining < 100) return "text-orange-600";
      return "text-emerald-600";
    } else {
      // For conversations/messages, consider low when less than 50
      if (remaining < 50) return "text-destructive";
      if (remaining < 200) return "text-orange-600";
      return "text-emerald-600";
    }
  };

  const formatCredits = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3", className)}>
        {/* Primary Credits (Conversations or Messages) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="flex cursor-default items-center gap-1.5 border bg-background px-3 py-1.5 transition-colors hover:bg-secondary/80"
            >
              <primaryCredits.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={cn(
                  "text-sm font-medium",
                  getCreditsColor(primaryCredits.remaining, "primary")
                )}
              >
                {formatCredits(primaryCredits.remaining)}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              <span className="font-medium">
                {primaryCredits.remaining.toLocaleString()}
              </span>{" "}
              {primaryCredits.label} remaining
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Call Credits */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="flex cursor-default items-center gap-1.5 border bg-background px-3 py-1.5 transition-colors hover:bg-secondary/80"
            >
              <callCredits.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={cn(
                  "text-sm font-medium",
                  getCreditsColor(callCredits.remaining, "call")
                )}
              >
                {formatCredits(callCredits.remaining)}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              <span className="font-medium">
                {callCredits.remaining.toLocaleString()}
              </span>{" "}
              {callCredits.label} remaining
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}