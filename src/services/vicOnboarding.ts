import { API_BASE_URL } from "@/services";
import type { VicUser } from "@/services/vic";

export const VIC_APPLY_DRAFT_KEY = "vic_apply_draft";

export type VicApplyRole = "VIC Host" | "Philanthropist";
export type VicVisibility = "public" | "hidden";

export interface VicApplyDraft {
  Role: VicApplyRole;
  discoverable: boolean;
  MembersClub?: string | Array<{ id: string; name: string; city: string; points: number }>;
  CanHostAtClub?: boolean;
  InvitationCode?: string;
}

export interface VicSignupPayload {
  Name: string;
  email: string;
  password: string;
  bio?: string;
  minibio?: string;
  Homebase?: string;
  language?: string;
  Interests?: string[];
  Social?: string[];
  InvitationCode?: string;
  discoverable?: boolean;
  MembersClub?: string | string[] | Array<{ id: string; name: string; city: string; points: number }>;
  MemberScore?: number;
  CanHostAtClub?: boolean;
  Gallery?: string[];
  Picture?: string;
  Role?: VicApplyRole;
}

interface AuthResponse {
  auth_token?: string;
}

export function getApplyDraft(): VicApplyDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(VIC_APPLY_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as VicApplyDraft;
  } catch {
    return null;
  }
}

export function saveApplyDraft(payload: VicApplyDraft) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(VIC_APPLY_DRAFT_KEY, JSON.stringify(payload));
}

export async function signupVic(payload: VicSignupPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/vic/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function loginVic(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth_vic_login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as AuthResponse;
  if (!data.auth_token) {
    throw new Error("Missing auth token from VIC login response.");
  }

  return data.auth_token;
}

export async function fetchVicProfileByToken(token: string): Promise<VicUser> {
  const response = await fetch(`${API_BASE_URL}/vic`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as VicUser;
}
