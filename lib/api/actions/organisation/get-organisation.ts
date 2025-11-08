"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IOrganisationDetailed } from "@/types/organisation-detailed";

export const getOrganisationAction = async (
  idOrSlug: string
): Promise<IOrganisationDetailed | undefined> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(`/v1/organisation/${idOrSlug}`);

  return response.data.data;
};
