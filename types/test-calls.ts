export interface TestCallOrganisation {
  id: number;
  name: string;
  slug: string;
}

export interface TestCall {
  id: number;
  organisation_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  recording_url: string;
  call_duration: number;
  created_at: string;
  updated_at: string;
  organisation: TestCallOrganisation;
}

export interface TestCallsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TestCallsResponse {
  testCalls: TestCall[];
  pagination: TestCallsPagination;
  filters: Record<string, unknown>;
}

export interface TestCallsAPIResponse {
  success: boolean;
  message: string;
  data: TestCallsResponse;
  error: null | string;
  statusCode: number;
}
