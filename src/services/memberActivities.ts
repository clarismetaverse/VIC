import { xanoFetch } from "@/services/xanoClient";
import type { TransportEnum } from "@/services/activityApi";

export type MemberActivityType = "local" | "Trip";
export type MemberActivityTag = "dinner" | "party" | "event" | "sport";

export type MemberActivityCover = {
  access?: "public" | "private";
  path: string;
  name: string;
  type: string;
  size: number;
  mime: string;
  meta: Record<string, unknown>;
};

export type MemberActivityPayload = {
  Activity_Name?: string;
  user_turbo_id?: number[];
  Destination?: string;
  Departure?: string | null;
  Return?: string | null;
  Max_Girls?: number;
  restaurant_turbo_id?: number;
  vic_location_id?: number;
  type?: MemberActivityType;
  activity?: MemberActivityTag[];
  day?: number | null;
  transport?: TransportEnum | null;
  Cover?: MemberActivityCover | null;
};

export type MemberActivity = MemberActivityPayload & {
  id: number;
  created_at?: number;
};

export async function uploadCoverImage(file: File): Promise<MemberActivityCover> {
  const fd = new FormData();
  fd.append("content", file);
  const result = await xanoFetch<MemberActivityCover>("/upload/image", {
    method: "POST",
    body: fd,
  });
  return result;
}

export async function createMemberActivity(
  payload: MemberActivityPayload
): Promise<MemberActivity> {
  return xanoFetch<MemberActivity>("/memberactivities", {
    method: "POST",
    body: payload,
  });
}
