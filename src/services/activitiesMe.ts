import type { Activity } from "@/services/activityApi";
import { xanoFetch } from "@/services/xanoClient";

export async function fetchMyActivities(): Promise<Activity[]> {
  const data = await xanoFetch<Activity | Activity[]>("/activities/me", {
    method: "GET",
  });

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "id" in data) return [data];
  return [];
}
