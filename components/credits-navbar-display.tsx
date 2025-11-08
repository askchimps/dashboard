"use client";

import { PhoneCall, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { organisationQueries } from "@/lib/query/organisation.query";
import { cn } from "@/lib/utils";
import { IOrganisationDetailed } from "@/types/organisation-detailed";

interface CreditsNavbarDisplayProps {
  className?: string;
}

export default function CreditsNavbarDisplay({ className }: CreditsNavbarDisplayProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  
  const { data: organization, isLoading } = useQuery({
    ...organisationQueries.getOne(orgSlug),
    enabled: !!orgSlug,
  });

  if (!orgSlug || isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  // Access credits directly from organization data
  const org = organization as IOrganisationDetailed;
  const callCredits = org.call_credits || 0;
  const chatCredits = org.chat_credits || 0;

  const getCreditsColor = (credits: number, type: "call" | "chat") => {
    if (type === "call") {
      // For call credits, consider low when less than 50
      if (credits < 50) return "text-destructive";
      if (credits < 200) return "text-orange-600";
      return "text-emerald-600";
    } else {
      // For chat credits, consider low when less than 100
      if (credits < 100) return "text-destructive";
      if (credits < 500) return "text-orange-600";
      return "text-emerald-600";
    }
  };

  const formatCredits = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(2);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Chat Credits */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="flex cursor-default items-center gap-1.5 border bg-background/50 px-2.5 py-1 text-md transition-colors hover:bg-secondary/80"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground mr-1" />
              <span
                className={cn(
                  "font-medium",
                  getCreditsColor(chatCredits, "chat")
                )}
              >
                {formatCredits(chatCredits)}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-md">
              <span className="font-medium">
                {chatCredits.toFixed(2)}
              </span>{" "}
              Chat Credits
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Call Credits */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="flex cursor-default items-center gap-1.5 border bg-background/50 px-2.5 py-1 text-md transition-colors hover:bg-secondary/80"
            >
              <PhoneCall className="h-4 w-4 text-muted-foreground mr-1" />
              <span
                className={cn(
                  "font-medium",
                  getCreditsColor(callCredits, "call")
                )}
              >
                {formatCredits(callCredits)}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-md">
              <span className="font-medium">
                {callCredits.toFixed(2)}
              </span>{" "}
              Call Credits
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}