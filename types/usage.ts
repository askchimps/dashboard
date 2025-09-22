import { z } from "zod";

export const DailyUsageSchema = z.object({
  date: z.string(),
  usedConversationCredits: z.number(),
  usedMessageCredits: z.number(),
});

export const AgentUsageSchema = z.object({
  agent_id: z.number(),
  agent_name: z.string(),
  usedConversationCredits: z.number(),
  usedMessageCredits: z.number(),
});

export const DateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export const OrganisationUsageSchema = z.object({
  creditsPlan: z.string(),
  remainingConversationCredits: z.number(),
  remainingMessageCredits: z.number(),
  remainingCallCredits: z.number(),
  dateRange: DateRangeSchema,
  usedConversationCredits: z.number(),
  usedMessageCredits: z.number(),
  dailyUsage: z.array(DailyUsageSchema),
  agentUsage: z.array(AgentUsageSchema),
});

export type IDailyUsage = z.infer<typeof DailyUsageSchema>;
export type IAgentUsage = z.infer<typeof AgentUsageSchema>;
export type IDateRange = z.infer<typeof DateRangeSchema>;
export type IOrganisationUsage = z.infer<typeof OrganisationUsageSchema>;
