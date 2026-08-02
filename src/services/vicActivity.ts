import { getAuthToken } from "@/services/xano";
import type { Activity } from "@/services/activityApi";

const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

type MyActivityResponse = {
  id: number;
  created_at?: number;
  Activity_Name?: string;
  user_turbo_id?: number[];
  Destination?: string;
  Departure?: string | null;
  Return?: string | null;
  Max_Girls?: number;
  type?: "local" | "Trip";
  activity?: string[];
  transport?: string | null;
  organizer?: number;
  Cover?: { url?: string | null } | null;
};

function mapMyActivity(item: MyActivityResponse): Activity {
  return {
    id: item.id,
    Name: item.Activity_Name || "Untitled",
    Destination: item.Destination || "",
    Starting_Day: item.Departure || null,
    Return: item.Return || null,
    Tripcover: item.Cover || null,
    ActivitiesList: item.activity?.join(", ") || "",
    InvitedUsers: item.user_turbo_id || [],
    status: "active",
    VICS: [],
    ParticipantsMinimumNumber: 0,
    event_temp_id: 0,
    host: item.organizer || 0,
    ModelLimit: item.Max_Girls || 0,
    Activity_Name: item.Activity_Name,
    Max_Girls: item.Max_Girls,
    Transport: item.transport as Activity["Transport"] || undefined,
    created_at: item.created_at,
  } as Activity;
}

export async function fetchVicActivities(): Promise<Activity[]> {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/myactivities`, { method: "GET", headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`myactivities fetch failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as unknown;
  if (Array.isArray(data)) return (data as MyActivityResponse[]).map(mapMyActivity);
  if (data && typeof data === "object" && "id" in (data as Record<string, unknown>)) {
    return [mapMyActivity(data as MyActivityResponse)];
  }
  return [];
}
