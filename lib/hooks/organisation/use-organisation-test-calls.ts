"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getTestCallsAction,
  TestCallFilters,
} from "@/lib/api/actions/test-calls/get-test-calls";

export const useOrganisationTestCalls = (
  orgSlug: string,
  filters: TestCallFilters = {}
) => {
  return useQuery({
    queryKey: ["organisation", orgSlug, "test-calls", filters],
    queryFn: () => getTestCallsAction(orgSlug, filters),
    enabled: !!orgSlug,
  });
};
