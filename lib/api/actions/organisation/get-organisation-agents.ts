"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IAgent } from "@/types/agent";

export const getOrganisationAgentsAction = async (
  idOrSlug: string
): Promise<IAgent[]> => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(`/v1/organisation/${idOrSlug}/agents`);

  return response.data.data;
};
