"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IOrganisation } from "@/types/organisation";

export const getOrganisationAction = async (idOrSlug: string): Promise<IOrganisation | undefined> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(`/v1/organisation/${idOrSlug}`);

  return response.data.data;
};
