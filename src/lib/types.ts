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

export interface CallAnalysisQuestion {
  id: string;
  question: string;
  answer: string;
  extracted?: Record<string, unknown>;
}

export interface CallAnalysis {
  summary?: string;
  intent_bucket?: 'high' | 'med' | 'low' | 'disqualified' | null;
  score?: number | null;
  questions?: CallAnalysisQuestion[];
  tags?: string[];
  model?: string;
  generated_at?: string;
  [k: string]: unknown;
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
  analysis: CallAnalysis | null;
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

export type LeadSort = 'recent' | 'oldest' | 'name_asc' | 'name_desc';

export interface LeadListQuery {
  q?: string;
  status?: string;
  source?: string;
  sort?: LeadSort;
}

export interface LeadSummary {
  id: string;
  orgId: string;
  idempotencyKey: string | null;
  name: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
  callCount: number;
  completedCount: number;
  lastCallAt: string | null;
  lastOutcome: string | null;
  bestBucket: string | null;
  bestScore: number | null;
}

export interface LeadCall {
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
  analysis: CallAnalysis | null;
  bolnaCallId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TimelineEventType =
  | 'lead.ingested'
  | 'call.started'
  | 'call.completed'
  | 'lead.qualified'
  | 'lead.disqualified';

export interface TimelineEvent {
  id: string;
  at: string;
  type: TimelineEventType;
  title: string;
  detail?: Record<string, unknown>;
}

export interface LeadDetail
  extends Omit<
    LeadSummary,
    'callCount' | 'completedCount' | 'lastCallAt' | 'lastOutcome' | 'bestBucket' | 'bestScore'
  > {
  calls: LeadCall[];
  timeline: TimelineEvent[];
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
