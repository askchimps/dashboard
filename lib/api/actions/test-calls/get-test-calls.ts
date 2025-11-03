"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { TestCallsResponse } from "@/types/test-calls";

export interface TestCallFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const getTestCallsAction = async (
  orgSlug: string,
  filters: TestCallFilters = {}
): Promise<TestCallsResponse> => {
  const axios = await createAuthenticatedAxios();

  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString() ? `&${params.toString()}` : "";
  const response = await axios.get(
    `/v1/test-call?organisation=${orgSlug}${queryString}`
  );

  return response.data.data.data;
};
