import { z } from "zod";

export const DailyStatsSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  chatCount: z.number(),
  callCount: z.number(),
});

export const OverviewOrganisationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const OverviewSchema = z.object({
  totalChats: z.number(),
  totalCalls: z.number(),
  totalLeads: z.number(),
  qualifiedLeads: z.number(),
});

export const PeriodSchema = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const OrganisationOverviewSchema = z.object({
  organisation: OverviewOrganisationSchema,
  overview: OverviewSchema,
  dailyStats: z.array(DailyStatsSchema).default([]),
  period: PeriodSchema,
});

export type IDailyStats = z.infer<typeof DailyStatsSchema>;
export type IOverviewOrganisation = z.infer<typeof OverviewOrganisationSchema>;
export type IOverview = z.infer<typeof OverviewSchema>;
export type IPeriod = z.infer<typeof PeriodSchema>;
export type IOrganisationOverview = z.infer<typeof OrganisationOverviewSchema>;
