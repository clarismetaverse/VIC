import type { CreatorLite } from "@/services/creatorSearch";
import { request } from "@/services/xano";

type UserTurboRecord = {
  id?: number | string;
  name?: string;
  NickName?: string;
  bio?: string;
  tagline?: string;
  description?: string;
  nationality?: string;
  Agency?: string;
  Profession?: string;
  City?: string;
  FakeCity?: string;
  IG_account?: string;
  Tiktok_account?: string;
  Ig_handle?: string;
  user_interest_topics_turbo_id?: Array<number | { id?: number; interest_topics?: string }>;
  Profile_pic?: { url?: string } | null;
};

type PagedUsers = {
  items?: UserTurboRecord[];
};

type VicMembersResponse = {
  approved?: PagedUsers | UserTurboRecord[];
  pending?: PagedUsers | UserTurboRecord[];
};

export type VicMembers = {
  approved: CreatorLite[];
  pending: CreatorLite[];
};

function toItems(group: PagedUsers | UserTurboRecord[] | undefined): UserTurboRecord[] {
  if (Array.isArray(group)) return group;
  return group?.items ?? [];
}

function mapMember(user: UserTurboRecord): CreatorLite {
  return {
    id: Number(user.id),
    name: user.name || user.NickName,
    bio: user.bio,
    tagline: user.tagline,
    description: user.description,
    nationality: user.nationality,
    Agency: user.Agency,
    Profession: user.Profession,
    City: user.City || user.FakeCity,
    IG_account: (user.IG_account && user.IG_account.trim()) || user.Ig_handle,
    Tiktok_account: user.Tiktok_account,
    user_interest_topics_turbo_id: user.user_interest_topics_turbo_id,
    Profile_pic: user.Profile_pic ?? null,
  };
}

function mapGroup(group: PagedUsers | UserTurboRecord[] | undefined): CreatorLite[] {
  return toItems(group)
    .map(mapMember)
    .filter((member) => Number.isFinite(member.id) && member.id > 0);
}

export async function fetchVicMembers(): Promise<VicMembers> {
  try {
    // Public endpoint — no Authorization header needed
    const data = await request<VicMembersResponse>("/members/vic-home", {
      method: "GET",
      skipAuth: true,
    });

    return {
      approved: mapGroup(data.approved),
      pending: mapGroup(data.pending),
    };
  } catch (error) {
    console.error("Failed to fetch VIC members", error);
    return { approved: [], pending: [] };
  }
}
