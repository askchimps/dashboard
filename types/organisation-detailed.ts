import { z } from "zod";

import { OrganisationSchema } from "./organisation";

// Extended organization schema with all fields from the API response
export const OrganisationDetailedSchema = OrganisationSchema.extend({
  chat_credits: z.number(),
  call_credits: z.number(),
  expenses: z.number(),
  active_indian_calls: z.number(),
  active_international_calls: z.number(),
  available_indian_channels: z.number(),
  available_international_channels: z.number(),
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      is_super_admin: z.number(),
      created_at: z.string(),
    })
  ),
  agents: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      type: z.string(),
      image_url: z.string().nullable(),
      is_disabled: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
  recent_credit_history: z.array(
    z.object({
      id: z.number(),
      change_amount: z.number(),
      change_type: z.enum(["increment", "decrement"]),
      change_field: z.enum(["call_credits", "chat_credits"]),
      reason: z.string(),
      created_at: z.string(),
    })
  ),
  stats: z.object({
    total_leads: z.number(),
    total_calls: z.number(),
    total_chats: z.number(),
    total_agents: z.number(),
    total_users: z.number(),
    recent_leads: z.number(),
    recent_calls: z.number(),
    recent_chats: z.number(),
    qualified_leads: z.number(),
    active_calls: z.number(),
    active_chats: z.number(),
    total_costs: z.number(),
    credit_balance: z.number(),
  }),
  latest_activities: z.object({
    calls: z.array(z.any()),
    chats: z.array(z.any()),
    leads: z.array(z.any()),
  }),
});

export type IOrganisationDetailed = z.infer<typeof OrganisationDetailedSchema>;
