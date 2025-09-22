"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IOrganisation } from "@/types/organisation";

export const getOrganisationsAction = async (): Promise<IOrganisation[]> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(`/v1/organisation/all`);

  return response.data.data;
};
