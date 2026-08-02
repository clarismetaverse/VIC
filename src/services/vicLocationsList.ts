export type VicLocation = {
  id: number;
  created_at?: number;
  restaurant_turbo_id?: number;
  Title?: string;
  vic_id?: number;
  Adress?: string;
  Tags?: string[];
  About?: string;
  Cover?: { url?: string | null } | null;
  GaIIery?: Array<{ url?: string | null }> | null;
};

const VIC_LOCATION_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:s665uFn5/vic_location";

export async function fetchVicLocations(): Promise<VicLocation[]> {
  const res = await fetch(VIC_LOCATION_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`vic_location request failed (${res.status})`);
  }
  const data = (await res.json()) as VicLocation[];
  return Array.isArray(data) ? data : [];
}
