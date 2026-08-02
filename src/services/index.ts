const API_BASE_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";
const AUTH_TOKEN_KEY = "auth_token";
const UNAUTHORIZED_EVENT = "unauthorized";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

type JsonObject = Record<string, unknown>;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonObject | null;
  onUnauthorized?: () => void;
};

function isJsonBody(body: BodyInit | JsonObject | null | undefined): body is JsonObject {
  if (!body || typeof body !== "object") {
    return false;
  }
  return !(body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams || body instanceof ArrayBuffer);
}

function clearSessionAndNotify(onUnauthorized?: () => void) {
  setAuthToken(null);
  onUnauthorized?.();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { onUnauthorized, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers ?? undefined);
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = requestOptions.body;

  if (isJsonBody(body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload: unknown = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : response.statusText || "Request failed";

    const invalidTokenResponse =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message.toLowerCase().includes("token");

    if (response.status === 401 || invalidTokenResponse) {
      clearSessionAndNotify(onUnauthorized);
    }

    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export { API_BASE_URL, UNAUTHORIZED_EVENT };
