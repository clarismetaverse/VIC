import { request } from "@/services/xano";

export type TripActivityApi = {
  id?: number;
  Name?: string;
  Destination?: string;
  cityName?: string;
  InvitedUsers?: unknown;
  [key: string]: unknown;
};

export type TripsInviteResponse = {
  result1: TripActivityApi;
  invite: number;
  invitedtotal: number;
};

export type ValidInvitedUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export function getValidInvitedUsers(input: unknown): ValidInvitedUser[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as { id?: unknown; name?: unknown; Profile_pic?: { url?: unknown } | null };
      const id = Number(candidate.id);
      const avatarUrl = typeof candidate.Profile_pic?.url === "string" && candidate.Profile_pic.url ? candidate.Profile_pic.url : null;

      if (!Number.isFinite(id) || id <= 0) {
        return null;
      }

      return {
        id,
        name: typeof candidate.name === "string" && candidate.name ? candidate.name : "Model",
        avatarUrl,
      };
    })
    .filter((item): item is ValidInvitedUser => item !== null);
}

export async function putTripsInvite(trip_id: number, invited_users: number[]): Promise<TripsInviteResponse> {
  const normalizedInvitedUsers = Array.from(
    new Set(
      invited_users
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )
  ).sort((a, b) => a - b);

  const response = await request<Partial<TripsInviteResponse>>("/trips/invite", {
    method: "PUT",
    body: JSON.stringify({
      trip_id,
      invited_users: normalizedInvitedUsers,
    }),
  });

  const rawResult = response?.result1;
  const result1 = rawResult && typeof rawResult === "object" ? (rawResult as TripActivityApi) : {};

  return {
    result1,
    invite: Number(response?.invite) || 0,
    invitedtotal: Number(response?.invitedtotal) || 0,
  };
}
