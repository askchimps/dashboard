"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export const getOrganisationAction = async (idOrSlug: string) => {
  const axios = await createAuthenticatedAxios();

  const response = await axios.get(`/v1/organisation/${idOrSlug}`);

  return response.data;
};
