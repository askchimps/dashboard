"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IOrganisationOverview } from "@/types/overview";

export const getOrganisationOverviewAction = async (
  idOrSlug: string,
  startDate?: string,
  endDate?: string
): Promise<IOrganisationOverview> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await axios.get(`/v1/organisation/${idOrSlug}/overview${queryString}`);

  return response.data.data;
};