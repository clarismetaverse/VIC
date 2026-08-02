/**
 * Configure VITE_XANO_API and VITE_XANO_TOKEN in:
 * - Local: .env.local
 * - Lovable: Publish → Build Settings → Environment Variables
 */

export interface XanoImage {
  url?: string;
  name?: string;
  mime?: string;
  size?: number;
  meta?: { width?: number; height?: number };
}

export interface PortfolioBrand {
  id: number;
  BrandName?: string;
  LogoBrand?: XanoImage | null;
}

export interface PortfolioTeamMember {
  id: number;
  NickName?: string;
  Profession?: string;
  Profile_pic?: XanoImage | null;
}

export interface PortfolioItem {
  id: number;
  production_id?: number;
  user_turbo_id?: number;
  Team?: PortfolioTeamMember[];
  Shooting_Location?: number | string;
  Deliverables?: string | null;
  Brand?: PortfolioBrand[];
  Cover?: XanoImage | null;
  Hero?: XanoImage | null;
  Work_Body?: XanoImage[];
  KPI?: Record<string, unknown>[];
  created_at?: number;
  Name?: string;
  About?: string;
}

export interface UserTurbo {
  id: number;
  name?: string;
  Profile_pic?: XanoImage | null;
  City?: string;
  countryCode?: string;
  bio?: string;
}

export interface XanoError {
  message?: string;
  [key: string]: unknown;
}

const API = ((import.meta as any).env?.VITE_XANO_API || "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3").replace(/\/$/, "");
export function getAuthToken(): string {
  try {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("user_turbo_id_token") ||
        localStorage.getItem("user_turbo_token") ||
        localStorage.getItem("auth_token") ||
        ""
      );
    }
  } catch {}
  return "";
}

if (!API) {
  console.error("⚠️ Xano API URL missing");
  throw new Error("Missing Xano API URL");
}

export interface XanoRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function request<T>(path: string, options: XanoRequestOptions = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  // Build headers dynamically so we attach the logged-in auth token when available
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  if (fetchOptions.headers) {
    const opt = new Headers(fetchOptions.headers as HeadersInit);
    opt.forEach((value, key) => headers.set(key, value));
  }

  // If caller didn't provide Authorization, try localStorage token first, then env token
  if (!skipAuth && !headers.has("Authorization")) {
    let token = getAuthToken();
    if (!token) {
      token = (import.meta as any).env?.VITE_XANO_TOKEN || "";
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = /^https?:\/\//i.test(path) ? path : `${API}${path}`;
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error(text.slice(0, 100));
    throw new Error("Invalid response from Xano, expected JSON");
  }

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const msg = (data as XanoError)?.message || res.statusText;
    throw new Error(msg);
  }

  return data as T;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export async function fetchPortfolio() {
  const data = await request<PortfolioItem[] | PortfolioItem>("/portfolio");
  return Array.isArray(data) ? data : data ? [data as PortfolioItem] : [];
}

