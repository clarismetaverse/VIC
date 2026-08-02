import { getAuthToken } from "@/services/xano";

const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

export type ActivityInvitedStatus = "invited" | "pending request" | "approved" | "rejected" | "cancelled";
export type ActivityInvitedType = "organizer" | "invited";

export type ActivityInvitedItem = {
  id: number;
  created_at?: number;
  user_turbo_id: number;
  vic_id: number;
  type: ActivityInvitedType;
  plusone?: string[];
  vicmemberactivity_id: number;
  status: ActivityInvitedStatus;
  source?: string | null;
  booking_id?: number | null;
  _user_turbo?: {
    name?: string;
    IG_account?: string;
    Tiktok_account?: string;
    Profile_pic?: { url?: string | null } | null;
  } | null;
  _vic?: {
    Name?: string;
    Picture?: { url?: string | null } | null;
  } | null;
};

export async function submitActivityInvitationDecision(params: {
  activityId: string | number;
  invitation: Pick<ActivityInvitedItem, "id" | "source" | "booking_id">;
  decision: "approve" | "reject";
}): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/activity_invitation_decision`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      vicmembersactivity_id: Number(params.activityId),
      item_id: params.invitation.booking_id ?? params.invitation.id,
      source: params.invitation.source === "claris" ? "claris" : "vic",
      decision: params.decision,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`activity_invitation_decision failed (${res.status}): ${text}`);
  }
}

export async function fetchActivityInvited(vicmembersactivityId: string | number): Promise<ActivityInvitedItem[]> {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API}/activity_invited?vicmembersactivity_id=${encodeURIComponent(String(vicmembersactivityId))}`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`activity_invited fetch failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as ActivityInvitedItem[]) : [];
}
