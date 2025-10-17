import { z } from "zod";

export const DailyCountSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  count: z.number(),
});

export const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const OrganisationOverviewSchema = z.object({
  conversationCount: z.number(),
  callCount: z.number(), 
  leadCount: z.number(),
  qualifiedLeadCount: z.number(),
  dateRange: DateRangeSchema,
  conversationCountPerDay: z.array(DailyCountSchema),
  callCountPerDay: z.array(DailyCountSchema),
});

export type IDailyCount = z.infer<typeof DailyCountSchema>;
export type IDateRange = z.infer<typeof DateRangeSchema>;
export type IOrganisationOverview = z.infer<typeof OrganisationOverviewSchema>;