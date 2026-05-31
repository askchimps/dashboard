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

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
