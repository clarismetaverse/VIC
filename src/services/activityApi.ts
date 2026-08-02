import { xanoFetch } from "@/services/xanoClient";

export type ActivityStatus = "draft" | "active" | "reserved" | "confirmed" | "cancelled";

export type TransportEnum = "Yes" | "Uber" | "Private Ferry" | "Private Driver" | "Flight tickets";

export type ActivityPayload = {
  Name: string;
  Destination: string;
  Starting_Day: string | null;
  Return: string | null;
  VICS: number[];
  Tripcover: Record<string, unknown> | null;
  ParticipantsMinimumNumber: number;
  ActivitiesList: string;
  InvitedUsers: number[];
  event_temp_id: number;
  host: number;
  status: ActivityStatus;
  ModelLimit: number;
  Activity_Name?: string;
  Max_Girls?: number;
  Transport?: TransportEnum;
};

export type Activity = ActivityPayload & {
  id: number;
  created_at?: number;
  updated_at?: number;
  ModelsList?: Array<{ id?: number; name?: string; Profile_pic?: { url?: string } | null }>;
  InvitedUsersExpanded?: Array<{ id?: number; name?: string; Profile_pic?: { url?: string } | null }>;
};

export async function createActivity(payload: ActivityPayload): Promise<Activity> {
  return xanoFetch<Activity>("/activity", {
    method: "POST",
    body: payload,
  });
}

export async function patchActivity(
  activityId: number,
  patch: Partial<Omit<ActivityPayload, "event_temp_id" | "host">>
): Promise<Activity> {
  return xanoFetch<Activity>("/activity/patch", {
    method: "PATCH",
    body: {
      trip_id: activityId,
      ...patch,
    },
  });
}
