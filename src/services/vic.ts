export type VicUser = {
  id: number;
  Name: string;
  email: string;
  Diamonds: number;
  Invites: number;
  bio?: string;
  Picture?: { url?: string } | null;
};

export async function fetchVicProfile(token: string): Promise<VicUser | null> {
  if (!token) return null;

  try {
    const res = await fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/vic", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[fetchVicProfile] HTTP", res.status, body);
      return null;
    }

    const profile = await res.json() as Record<string, unknown>;

    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return null;

    return {
      id: Number(profile.id),
      Name: String(profile.Name ?? ""),
      email: String(profile.email ?? ""),
      Diamonds: Number(profile.Diamonds ?? 0),
      Invites: Number(profile.Invites ?? 0),
      bio: typeof profile.bio === "string" ? profile.bio : "",
      Picture:
        profile.Picture && typeof profile.Picture === "object"
          ? (profile.Picture as { url?: string })
          : null,
    };
  } catch (err) {
    console.error("[fetchVicProfile] failed:", err);
    return null;
  }
}
