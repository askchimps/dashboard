export type Role = 'OWNER' | 'USER';

export interface Membership {
  orgId: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  isPlatformAdmin: boolean;
  memberships: Membership[];
}

export interface Org {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  configPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  orgId: string;
  name: string;
  basePrompt: string;
  analysisPrompt: string;
  knowledge: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallLeadLite {
  id: string;
  name: string | null;
  phone: string | null;
  source: string | null;
}

export interface CallSummary {
  id: string;
  leadId: string;
  attempt: number;
  startedAt: string | null;
  endedAt: string | null;
  durationSec: number | null;
  outcome: string | null;
  bucket: string | null;
  score: number | null;
  transcript: string | null;
  recordingUrl: string | null;
  bolnaCallId: string | null;
  createdAt: string;
  updatedAt: string;
  lead: CallLeadLite;
}

export interface CallAnswer {
  id: string;
  callId: string;
  qId: string;
  rawText: string | null;
  extracted: unknown;
}

export interface CallLeadFull extends CallLeadLite {
  orgId: string;
  status: string;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CallDetail extends Omit<CallSummary, 'lead'> {
  lead: CallLeadFull;
  answers: CallAnswer[];
}

export type CallSort =
  | 'recent'
  | 'oldest'
  | 'score_desc'
  | 'score_asc'
  | 'duration_desc';

export interface CallListQuery {
  q?: string;
  outcome?: string;
  bucket?: string;
  sort?: CallSort;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
