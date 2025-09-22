import { z } from "zod";

export const OrganisationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nonempty("Name is required"),
  slug: z.string().nonempty("Slug is required"),
  is_disabled: z.number().int().min(0).max(1).default(0),
  is_deleted: z.number().int().min(0).max(1).default(0),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  updated_by_user: z.string().nonempty("Updated by user is required"),
});

export type IOrganisation = z.infer<typeof OrganisationSchema>;
