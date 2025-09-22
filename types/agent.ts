import { z } from "zod";

export const AgentSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  phone_number: z.string().optional().nullable(),
  organisation_id: z.number().int(),
  base_prompt: z.string().min(1, "Base prompt is required"),
  image_url: z.string().url("Invalid URL").optional().nullable(),
  initial_prompt: z.string().optional().nullable(),
  analysis_prompt: z.string().optional().nullable(),
  is_disabled: z.number().int().default(0),
  is_deleted: z.number().int().default(0),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  updated_by_user: z.string().min(1, "Updated by user is required"),
});

export type IAgent = z.infer<typeof AgentSchema>;
