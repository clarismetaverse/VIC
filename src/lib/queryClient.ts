import { QueryClient, dehydrate, hydrate, type DehydratedState } from "@tanstack/react-query";

const SESSION_CACHE_KEY = "vic-query-cache-v1";
const SESSION_CACHE_MAX_AGE = 12 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: SESSION_CACHE_MAX_AGE,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

function restoreQueryCache() {
  if (typeof window === "undefined") return;

  try {
    const serialized = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!serialized) return;

    const cached = JSON.parse(serialized) as { savedAt?: number; state?: DehydratedState };
    if (!cached.savedAt || !cached.state || Date.now() - cached.savedAt > SESSION_CACHE_MAX_AGE) {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return;
    }

    hydrate(queryClient, cached.state);
  } catch {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  }
}

function persistQueryCache() {
  if (typeof window === "undefined") return;

  try {
    const state = dehydrate(queryClient, {
      shouldDehydrateQuery: (query) =>
        query.state.status === "success" && query.meta?.persist !== false,
    });
    sessionStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), state }),
    );
  } catch {
    // Keep the in-memory cache when browser storage is unavailable or full.
  }
}

export function clearQueryCache() {
  queryClient.clear();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  }
}

restoreQueryCache();

if (typeof window !== "undefined") {
  let persistHandle: number | undefined;
  queryClient.getQueryCache().subscribe(() => {
    window.clearTimeout(persistHandle);
    persistHandle = window.setTimeout(persistQueryCache, 200);
  });
}
