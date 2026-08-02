import type { CreatorLite } from "@/services/creatorSearch";
import { request } from "@/services/xano";

type EndorsementRaw = {
  id?: number;
  name?: string;
  Profile_pic?: { url?: string } | null;
};

type UserTurbo = {
  id?: number;
  name?: string;
  bio?: string;
  tagline?: string;
  description?: string;
  IG_account?: string;
  Tiktok_account?: string;
  Profile_pic?: { url?: string } | null;
  City?: string;
  Agency?: string;
  NickName?: string;
  endorsments?: EndorsementRaw[];
};

type NewInTownResponse = {
  users?: {
    items?: Array<{
      id?: number;
      endorsments?: EndorsementRaw[];
      _user_turbo?: UserTurbo;
    }>;
  };
};

export async function fetchNewInTown(): Promise<CreatorLite[]> {
  try {
    const data = await request<NewInTownResponse>("/newintown", {
      method: "POST",
      body: JSON.stringify({}),
    });

    return (data.users?.items ?? [])
      .map((item) => {
        const u = item._user_turbo;
        return {
          id: Number(u?.id ?? item.id),
          name: u?.name,
          bio: u?.bio,
          tagline: u?.tagline,
          description: u?.description,
          Agency: u?.Agency,
          endorsments: (item.endorsments ?? []).map((e: any) => ({
            id: e.id,
            Name: e.Name,
            Picture: e.Picture,
          })),
          IG_account: u?.IG_account,
          Tiktok_account: u?.Tiktok_account,
          Profile_pic: u?.Profile_pic,
        };
      })
      .filter((item) => Number.isFinite(item.id) && item.id > 0);
  } catch (error) {
    console.error("Failed to fetch new in town creators", error);
    return [];
  }
}
