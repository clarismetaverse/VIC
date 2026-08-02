import { xanoFetch } from "@/services/xanoClient";
import { request } from "@/services/xano";
import type { Activity } from "@/services/activityApi";

export type InviteStatus = "invited" | "accepted" | "rejected";

export type InviteLite = {
  id: string;
  status: InviteStatus;
  creator: {
    name: string;
    avatarUrl: string;
    ig: string;
  };
};

export type TripActivity = {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  dateLabel: string;
  locationLabel: string;
  notes: string;
  invites: InviteLite[];
};

const placeholderTrips: TripActivity[] = [
  {
    id: "cannes-sunrise-session",
    title: "Cannes Sunrise Session",
    subtitle: "Editorial + marina golden hour",
    coverUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    dateLabel: "May 14, 7:00 AM",
    locationLabel: "Cannes Marina",
    notes: "Bring neutral looks and one swimwear option.",
    invites: [
      {
        id: "i1",
        status: "accepted",
        creator: {
          name: "Sofia Hart",
          avatarUrl: "https://i.pravatar.cc/100?img=11",
          ig: "@sofia.hart",
        },
      },
      {
        id: "i2",
        status: "accepted",
        creator: {
          name: "Mila Jones",
          avatarUrl: "https://i.pravatar.cc/100?img=21",
          ig: "@milajones",
        },
      },
      {
        id: "i3",
        status: "invited",
        creator: {
          name: "Amelia Rose",
          avatarUrl: "https://i.pravatar.cc/100?img=41",
          ig: "@ameliarose",
        },
      },
      {
        id: "i4",
        status: "rejected",
        creator: {
          name: "Clara Lynn",
          avatarUrl: "https://i.pravatar.cc/100?img=47",
          ig: "@claralynn",
        },
      },
    ],
  },
  {
    id: "monaco-rooftop-brunch",
    title: "Monaco Rooftop Brunch",
    subtitle: "Private terrace + lifestyle captures",
    coverUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    dateLabel: "May 15, 11:30 AM",
    locationLabel: "Hôtel de Paris, Monaco",
    notes: "White palette preferred. Meet at lobby 20 min before.",
    invites: [
      {
        id: "i5",
        status: "invited",
        creator: {
          name: "Nina Vale",
          avatarUrl: "https://i.pravatar.cc/100?img=32",
          ig: "@ninavale",
        },
      },
      {
        id: "i6",
        status: "invited",
        creator: {
          name: "Raya Kim",
          avatarUrl: "https://i.pravatar.cc/100?img=25",
          ig: "@rayakim",
        },
      },
      {
        id: "i7",
        status: "invited",
        creator: {
          name: "Lana Voss",
          avatarUrl: "https://i.pravatar.cc/100?img=18",
          ig: "@lana.voss",
        },
      },
      {
        id: "i8",
        status: "invited",
        creator: {
          name: "Tia Moss",
          avatarUrl: "https://i.pravatar.cc/100?img=15",
          ig: "@tiamoss",
        },
      },
      {
        id: "i9",
        status: "rejected",
        creator: {
          name: "Ivy Chase",
          avatarUrl: "https://i.pravatar.cc/100?img=56",
          ig: "@ivychase",
        },
      },
    ],
  },
  {
    id: "porto-cervo-sunset",
    title: "Porto Cervo Sunset",
    subtitle: "Yacht-side portraits & motion",
    coverUrl:
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80",
    dateLabel: "May 18, 6:45 PM",
    locationLabel: "Porto Cervo Harbour",
    notes: "Wind-ready styling and flat shoes for dock walk.",
    invites: [
      {
        id: "i10",
        status: "accepted",
        creator: {
          name: "Aria Bloom",
          avatarUrl: "https://i.pravatar.cc/100?img=37",
          ig: "@ariabloom",
        },
      },
      {
        id: "i11",
        status: "accepted",
        creator: {
          name: "Zoe Cruz",
          avatarUrl: "https://i.pravatar.cc/100?img=44",
          ig: "@zoecruz",
        },
      },
      {
        id: "i12",
        status: "accepted",
        creator: {
          name: "Kira Lane",
          avatarUrl: "https://i.pravatar.cc/100?img=12",
          ig: "@kiralane",
        },
      },
      {
        id: "i13",
        status: "accepted",
        creator: {
          name: "Mina Fox",
          avatarUrl: "https://i.pravatar.cc/100?img=28",
          ig: "@minafox",
        },
      },
      {
        id: "i14",
        status: "accepted",
        creator: {
          name: "Gia Rae",
          avatarUrl: "https://i.pravatar.cc/100?img=65",
          ig: "@giarae",
        },
      },
    ],
  },
];

export async function fetchTrips(): Promise<TripActivity[]> {
  return Promise.resolve(placeholderTrips);
}

export type ActivityDetailInvitedUser = {
  id: number;
  name?: string;
  NickName?: string;
  IG_account?: string;
  Tiktok_account?: string;
  Profile_pic?: { url?: string } | null;
};

export type ActivityDetailResponse = Omit<Activity, "InvitedUsers" | "InvitedUsersExpanded"> & {
  InvitedUsers?: ActivityDetailInvitedUser[];
  InvitedUsersExpanded?: ActivityDetailInvitedUser[];
  Participants?: unknown[];
};

type ActivityDetailWrappedResponse = {
  self?: ActivityDetailResponse;
  participants?: unknown[];
};

const normalizeActivityDetail = (
  payload: ActivityDetailResponse | ActivityDetailWrappedResponse
): ActivityDetailResponse => {
  const wrapped = payload as ActivityDetailWrappedResponse;
  const base = wrapped?.self && typeof wrapped.self === "object"
    ? wrapped.self
    : (payload as ActivityDetailResponse);

  const participants = Array.isArray(wrapped?.participants)
    ? wrapped.participants
    : Array.isArray(base?.Participants)
      ? base.Participants
      : [];

  return {
    ...base,
    Participants: participants,
  };
};

const VIC_ACTIVITY_API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

type VicActivityRaw = {
  id: number;
  Activity_Name?: string;
  Name?: string;
  Destination?: string;
  Departure?: string | null;
  Starting_Day?: string | null;
  Return?: string | null;
  Max_Girls?: number;
  ModelLimit?: number;
  activity?: string[];
  ActivitiesList?: string;
  user_turbo_id?: number[] | ActivityDetailInvitedUser[];
  InvitedUsers?: ActivityDetailInvitedUser[];
  InvitedUsersExpanded?: ActivityDetailInvitedUser[];
  organizer?: number;
  host?: number;
  transport?: string | null;
  Transport?: string | null;
  Cover?: { url?: string | null } | null;
  Tripcover?: { url?: string | null } | null;
  Participants?: unknown[];
  [key: string]: unknown;
};

const mapVicActivity = (item: VicActivityRaw): ActivityDetailResponse => {
  const invitedRaw = (item.InvitedUsersExpanded ?? item.InvitedUsers ?? item.user_turbo_id ?? []) as unknown[];
  const invitedUsers: ActivityDetailInvitedUser[] = invitedRaw.map((u) =>
    typeof u === "number" ? ({ id: u } as ActivityDetailInvitedUser) : (u as ActivityDetailInvitedUser)
  );

  return {
    ...(item as unknown as ActivityDetailResponse),
    id: item.id,
    Name: item.Activity_Name || item.Name || "Untitled",
    Activity_Name: item.Activity_Name || item.Name,
    Destination: item.Destination || "",
    Starting_Day: item.Departure ?? item.Starting_Day ?? null,
    Return: item.Return ?? null,
    Tripcover: (item.Cover ?? item.Tripcover ?? null) as ActivityDetailResponse["Tripcover"],
    ActivitiesList: item.ActivitiesList || (item.activity?.join(", ") ?? ""),
    InvitedUsers: invitedUsers,
    InvitedUsersExpanded: invitedUsers,
    host: item.organizer ?? item.host ?? 0,
    ModelLimit: item.Max_Girls ?? item.ModelLimit ?? 0,
    Max_Girls: item.Max_Girls,
    Transport: (item.transport ?? item.Transport ?? undefined) as ActivityDetailResponse["Transport"],
    Participants: Array.isArray(item.Participants) ? item.Participants : [],
    status: (item as { status?: ActivityDetailResponse["status"] }).status ?? "active",
    VICS: (item as { VICS?: number[] }).VICS ?? [],
    ParticipantsMinimumNumber: (item as { ParticipantsMinimumNumber?: number }).ParticipantsMinimumNumber ?? 0,
    event_temp_id: (item as { event_temp_id?: number }).event_temp_id ?? 0,
  } as ActivityDetailResponse;
};

export async function fetchActivityById(id: string): Promise<ActivityDetailResponse> {
  const token = (await import("@/services/xano")).getAuthToken?.();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${VIC_ACTIVITY_API}/vic_activity?vicmembersactivity_id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`vic_activity fetch failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as unknown;

  const list: VicActivityRaw[] = Array.isArray(data)
    ? (data as VicActivityRaw[])
    : data && typeof data === "object"
      ? [data as VicActivityRaw]
      : [];

  const targetId = Number(id);
  const match =
    list.find((it) => Number(it.id) === targetId) ??
    list.find((it) => String(it.id) === String(id)) ??
    list[0];

  if (!match) {
    throw new Error(`Activity ${id} not found in /vic_activity`);
  }

  return normalizeActivityDetail(mapVicActivity(match));
}

export type CreateEventPayload = {
  Name: string;
  cities_id?: number | null;
  Date?: string | null;
  Tags?: string[];
  Cover?: string | null;
};

export type CreateEventResponse = {
  id: number;
  created_at: number;
  Name: string;
  cities_id: number | null;
  Date: string | null;
  Tags: string[];
  Cover: string | null;
};

export async function createEvent(payload: CreateEventPayload): Promise<CreateEventResponse> {
  const { request } = await import("@/services/xano");
  return request<CreateEventResponse>("/event_temp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type EventTemp = {
  id: number;
  created_at: number;
  Name: string;
  cities_id: number | null;
  Date_start: string | null;
  Date_end: string | null;
  Tags: string[];
  Type: "local" | "trip" | "bali";
  Cover: {
    access?: string;
    path?: string;
    url: string;
    name?: string;
    type?: string;
    mime?: string;
    size?: number;
    meta?: { width?: number; height?: number };
  } | null;
};

export async function fetchEventTemps(): Promise<EventTemp[]> {
  const { request } = await import("@/services/xano");
  return request<EventTemp[]>("/event_temp");
}

export type InvitePayload = {
  activity_id: number;
  user_turbo_id: number[];
};

export type InviteResponse = {
  id: number;
  [key: string]: unknown;
};

export async function sendActivityInvites(
  activityId: number,
  creatorIds: number[]
): Promise<InviteResponse> {
  return xanoFetch<InviteResponse>("/activities/invite", {
    method: "POST",
    body: {
      activity_id: activityId,
      user_turbo_id: creatorIds,
    },
  });
}
