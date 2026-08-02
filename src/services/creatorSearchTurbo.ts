import type { CreatorLite } from "@/services/creatorSearch";

const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

type SearchCreatorsTurboParams = {
  q: string;
  topicIds: number[];
  signal?: AbortSignal;
};

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

export async function searchCreatorsTurbo({ q, topicIds, signal }: SearchCreatorsTurboParams): Promise<CreatorLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) return [];

  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    const normalizedToken = token.startsWith("Bearer ") ? token.replace(/^Bearer\s+/i, "") : token;
    headers.Authorization = normalizedToken;
  }

  const normalizedTopicIds = topicIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  const res = await fetch(`${API}/search/user_turbo`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      q: term,
      user_interest_topics_turbo_id: normalizedTopicIds,
    }),
    signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || "Creator search failed");
  }

  const data = (await res.json()) as CreatorLite[];
  return Array.isArray(data) ? data : [];
}
