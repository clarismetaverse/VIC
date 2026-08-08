export interface HangoutModel {
  id: number;
  name?: string;
  avatar?: string;
  status?: string;
}


export interface HangoutGroup {
  key: string;
  restaurantId: number;
  restaurantName: string;
  restaurantCover?: string;
  date: string; // BookingDay YYYY-MM-DD
  timeframe?: string; // e.g. "19:00 – 21:00" or "Anytime"
  isPast: boolean;
  models: HangoutModel[];
}

interface RawHangout {
  id: number;
  user_turbo_id?: number;
  restaurant_id?: number;
  BookingDay?: string | null;
  booking_time?: number | null;
  canceled?: boolean;
  HourStart?: string;
  HourEnd?: string;
  MinuteStart?: string | null;
  MinuteEnd?: string | null;
  _restaurant_turbo?: {
    Name?: string;
    Cover?: { url?: string } | null;
    Adress?: string | null;
    category_venues_turbo_id?: number | number[] | null;
    category_venuesNEW?: unknown;
    _cities_01?: { id?: number; CityName?: string } | null;
  };
  _user_turbo?: {
    id?: number;
    name?: string;
    NickName?: string;
    UserStatus?: string | null;
    Profile_pic?: { url?: string } | null;
  };
}


const BASE = "https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O";
const ROCKFISH_RESTAURANT_ID = 1158;

function buildTimeframe(h: RawHangout): string | undefined {
  const pad = (s?: string | null) => {
    if (!s) return "00";
    const n = String(s).trim();
    return n.length === 1 ? `0${n}` : n;
  };
  if (h.HourStart || h.HourEnd) {
    const start = h.HourStart ? `${pad(h.HourStart)}:${pad(h.MinuteStart)}` : null;
    const end = h.HourEnd ? `${pad(h.HourEnd)}:${pad(h.MinuteEnd)}` : null;
    if (start && end) return `${start} – ${end}`;
    if (start) return `from ${start}`;
    if (end) return `until ${end}`;
  }
  if (h.booking_time && h.booking_time > 0) {
    const d = new Date(h.booking_time);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return undefined;
}

const CITY_IDS: Record<string, number> = {
  milan: 1,
  milano: 1,
  dubai: 2,
  bali: 3,
};

function localDateDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export interface CityHangoutFilters {
  tagIds?: number[];
  keyword?: string;
}

export async function fetchCityHangouts(
  city?: string,
  filters?: CityHangoutFilters,
): Promise<HangoutGroup[]> {
  const url = new URL(`${BASE}/modelhangouts`);
  const cityId = city ? CITY_IDS[city.trim().toLowerCase()] : undefined;
  if (cityId) url.searchParams.set("city_id", String(cityId));
  url.searchParams.set("from_date", localDateDaysAgo(7));

  const tagIds = (filters?.tagIds ?? [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
  for (const id of tagIds) url.searchParams.append("tag_ids[]", String(id));

  const keyword = filters?.keyword?.trim();
  if (keyword) url.searchParams.set("keyword", keyword);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`hangouts ${res.status}`);
  const payload = await res.json();
  const raw: RawHangout[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = new Map<string, HangoutGroup>();
  for (const h of raw) {
    if (h.canceled) continue;
    if (!h.restaurant_id || !h.BookingDay) continue;
    const dateObj = new Date(`${h.BookingDay}T00:00:00`);
    if (Number.isNaN(dateObj.getTime())) continue;


    const key = `${h.restaurant_id}-${h.BookingDay}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        restaurantId: h.restaurant_id,
        restaurantName: h._restaurant_turbo?.Name || "Hangout",
        restaurantCover: h._restaurant_turbo?.Cover?.url,
        date: h.BookingDay,
        timeframe: buildTimeframe(h),
        isPast: dateObj < today,
        models: [],
      };
      groups.set(key, g);
    }
    const userId = h._user_turbo?.id ?? h.user_turbo_id;
    if (userId && !g.models.some((m) => m.id === userId)) {
      g.models.push({
        id: userId,
        name: h._user_turbo?.NickName || h._user_turbo?.name,
        avatar: h._user_turbo?.Profile_pic?.url,
        status: h._user_turbo?.UserStatus || undefined,
      });
    }

  }

  // Rockfish is a weekly activity. Until bookings exist for the next edition,
  // keep its upcoming occurrence visible as a separate, empty card.
  const latestRockfish = Array.from(groups.values())
    .filter((group) => group.restaurantId === ROCKFISH_RESTAURANT_ID)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (latestRockfish?.isPast) {
    const nextDate = new Date(`${latestRockfish.date}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 7);
    const nextDateValue = [
      nextDate.getFullYear(),
      String(nextDate.getMonth() + 1).padStart(2, "0"),
      String(nextDate.getDate()).padStart(2, "0"),
    ].join("-");
    const nextKey = `${latestRockfish.restaurantId}-${nextDateValue}`;

    if (nextDate >= today && !groups.has(nextKey)) {
      groups.set(nextKey, {
        ...latestRockfish,
        key: nextKey,
        date: nextDateValue,
        isPast: false,
        models: [],
      });
    }
  }

  return Array.from(groups.values())
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return b.models.length - a.models.length;
    });
}
