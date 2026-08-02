import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Mail, MapPin, Plane, Palmtree, ChevronRight, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createEvent, fetchEventTemps, type EventTemp, type InviteLite, type TripActivity } from "@/services/activities";
import { fetchVicActivities } from "@/services/vicActivity";
import type { Activity, ActivityStatus } from "@/services/activityApi";
import InviteExperienceSheet from "@/components/vic/InviteExperienceSheet";
import { fetchVicLocations, type VicLocation } from "@/services/vicLocationsList";
import { fetchActivityInvited } from "@/services/activityInvited";
type ActivitySeed = {
  title: string;
  city?: string;
  tags?: string[];
  imageUrl?: string;
  timing?: "Tonight" | "Weekend";
};

type ActivityFormState = {
  name: string;
  city: string;
  date: string;
  tags: string[];
};

const availableTags = ["Fashion", "Nightlife", "Yachting", "Wellness", "Luxury", "Editorial"];

const cinematicTemplates: ActivitySeed[] = [
  {
    title: "Cannes",
    city: "Cannes",
    tags: ["Luxury", "Fashion"],
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Ibiza Opening",
    city: "Ibiza",
    tags: ["Nightlife", "Yachting"],
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Art Basel",
    city: "Miami",
    tags: ["Editorial", "Luxury"],
    imageUrl:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Fashion Week Closing Party",
    city: "Paris",
    tags: ["Fashion", "Nightlife"],
    imageUrl:
      "https://images.unsplash.com/photo-1495121605193-b116b5b09a7e?auto=format&fit=crop&w=1400&q=80",
  },
];




const easeOut = { duration: 0.35, ease: "easeOut" as const };
const ACTIVITY_PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80";

const statusLabelMap: Record<ActivityStatus, string> = {
  draft: "Draft",
  active: "Invited",
  reserved: "Reserved",
  confirmed: "Accepted",
  cancelled: "Cancelled",
};

const toInviteStatus = (status?: ActivityStatus): InviteLite["status"] => {
  if (status === "confirmed") return "accepted";
  if (status === "cancelled") return "rejected";
  return "invited";
};

const mapActivityToTrip = (activity: Activity): TripActivity => {
  const invitedExpanded =
    activity.ModelsList && activity.ModelsList.length > 0 ? activity.ModelsList : activity.InvitedUsersExpanded ?? [];

  const invites: InviteLite[] = invitedExpanded.slice(0, 3).map((user, index) => ({
    id: String(user.id ?? `${activity.id}-${index}`),
    status: toInviteStatus(activity.status),
    creator: {
      name: user.name || "Invited creator",
      avatarUrl: user.Profile_pic?.url || "https://i.pravatar.cc/100?img=65",
      ig: "",
    },
  }));

  return {
    id: String(activity.id),
    title: activity.Name || "Untitled",
    subtitle: activity.Destination || "Local",
    coverUrl:
      activity.Tripcover && typeof activity.Tripcover === "object" && "url" in activity.Tripcover
        ? String((activity.Tripcover as { url?: string }).url || ACTIVITY_PLACEHOLDER_COVER)
        : ACTIVITY_PLACEHOLDER_COVER,
    dateLabel: activity.Starting_Day || "",
    locationLabel: activity.Destination || "Local",
    notes: activity.ActivitiesList || "",
    invites,
  };
};

export default function ActivitiesHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ActivityFormState>({ name: "", city: "", date: "", tags: [] });
  const [myActivities, setMyActivities] = useState<TripActivity[]>([]);
  const [myActivitiesRaw, setMyActivitiesRaw] = useState<Activity[]>([]);
  const [myActivitiesLoading, setMyActivitiesLoading] = useState(true);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [inviteFilterType, setInviteFilterType] = useState<"local" | "trip" | "bali">("local");
  const [eventTemps, setEventTemps] = useState<EventTemp[]>([]);
  const [eventTempsLoading, setEventTempsLoading] = useState(true);
  const [suggestedLocations, setSuggestedLocations] = useState<VicLocation[]>([]);
  const [suggestedLocationsLoading, setSuggestedLocationsLoading] = useState(true);
  const [invitedByActivity, setInvitedByActivity] = useState<Record<number, Array<{ id: number; name: string; avatarUrl: string }>>>({});

  useEffect(() => {
    const loadActivities = async () => {
      setMyActivitiesLoading(true);
      try {
        const activities = await fetchVicActivities();
        setMyActivitiesRaw(activities);
        setMyActivities(activities.map(mapActivityToTrip));

        // Fetch invited creators per activity in parallel
        const entries = await Promise.all(
          activities.map(async (a) => {
            try {
              const invited = await fetchActivityInvited(a.id);
              const creators = invited
                .filter((i) => i.type === "invited" && i._user_turbo)
                .map((i) => ({
                  id: i.user_turbo_id,
                  name: i._user_turbo?.name || "Invited",
                  avatarUrl: i._user_turbo?.Profile_pic?.url || "",
                }))
                .filter((c) => c.avatarUrl);
              return [a.id, creators] as const;
            } catch {
              return [a.id, []] as const;
            }
          })
        );
        setInvitedByActivity(Object.fromEntries(entries));
      } catch (error) {
        console.error("Failed to load activities/me", error);
        setMyActivitiesRaw([]);
        setMyActivities([]);
      } finally {
        setMyActivitiesLoading(false);
      }
    };

    const loadEventTemps = async () => {
      setEventTempsLoading(true);
      try {
        const temps = await fetchEventTemps();
        setEventTemps(temps.filter((t) => t.Name));
      } catch (error) {
        console.error("Failed to load event temps", error);
        setEventTemps([]);
      } finally {
        setEventTempsLoading(false);
      }
    };

    const loadSuggestedLocations = async () => {
      setSuggestedLocationsLoading(true);
      try {
        const items = await fetchVicLocations();
        setSuggestedLocations(items);
      } catch (error) {
        console.error("Failed to load vic_location", error);
        setSuggestedLocations([]);
      } finally {
        setSuggestedLocationsLoading(false);
      }
    };

    void loadActivities();
    void loadEventTemps();
    void loadSuggestedLocations();
  }, []);

  const inviteRoute = useMemo(
    () =>
      location.pathname.startsWith("/memberspass/vic/activities")
        ? "/memberspass/vic/activities/invite"
        : "/activities/invite",
    [location.pathname]
  );

  const openCreateSheet = (seed?: ActivitySeed) => {
    setForm({
      name: seed?.title ?? "",
      city: seed?.city ?? "",
      date: "",
      tags: seed?.tags ?? [],
    });
    setSheetOpen(true);
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-[#FAFAFA]/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-4 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-neutral-900">Activities</h1>
              <p className="text-xs text-neutral-500">Create &amp; invite models</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-6 px-4 pb-16 pt-5">
        {(() => {
          const hasActivities = !myActivitiesLoading && myActivities.length > 0;

          const upcomingSection = (
            <motion.section
              key="upcoming"
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={easeOut}
            >
              <div className="mb-3 px-1">
                <h2 className="text-sm font-semibold text-neutral-900">Your upcoming activities</h2>
              </div>
              {myActivitiesLoading ? (
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pt-1">
                  {[0, 1].map((item) => (
                    <div key={item} className="h-60 w-[84%] shrink-0 animate-pulse rounded-3xl border border-neutral-200 bg-neutral-200/70" />
                  ))}
                </div>
              ) : myActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                  No activities yet
                </div>
              ) : (
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pt-1">
                  {myActivities.map((activity, index) => {
                    const raw = myActivitiesRaw[index];
                    const statusLabel = raw?.status ? statusLabelMap[raw.status] : "Invited";
                    const statusAccepted = raw?.status === "confirmed";
                    const fetchedInvited = invitedByActivity[Number(activity.id)] || [];
                    const previewAvatars = fetchedInvited.length > 0
                      ? fetchedInvited.slice(0, 4).map((c) => ({ id: String(c.id), creator: { name: c.name, avatarUrl: c.avatarUrl, ig: "" }, status: "invited" as const }))
                      : activity.invites;
                    const totalInvited = fetchedInvited.length > 0 ? fetchedInvited.length : (raw?.InvitedUsers?.length ?? 0);


                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            location.pathname.startsWith("/memberspass/vic/activities")
                              ? `/memberspass/vic/activities/${activity.id}`
                              : `/activities/${activity.id}`
                          )
                        }
                        className="relative h-72 w-[92%] shrink-0 snap-start overflow-hidden rounded-3xl border border-neutral-200 text-left shadow-[0_18px_38px_rgba(10,10,20,0.16)]"
                      >
                        <img src={activity.coverUrl} alt={activity.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
                        <div className="absolute left-4 top-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                              statusAccepted
                                ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                                : "border-neutral-200 bg-white/90 text-neutral-700"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 space-y-2.5">
                          <div>
                            <p className="text-base font-semibold text-white">{activity.title}</p>
                            <p className="text-xs text-white/80">{activity.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/40 bg-black/25 p-1 text-white">
                              {(previewAvatars.length > 0 || totalInvited > 0) ? <Mail className="h-3 w-3" /> : <UserRound className="h-3 w-3" />}
                            </span>
                            {previewAvatars.length > 0 ? (
                              <div className="flex items-center -space-x-2">
                                {previewAvatars.map((invite) => (
                                  <img
                                    key={invite.id}
                                    src={invite.creator.avatarUrl}
                                    alt={invite.creator.name}
                                    className="h-7 w-7 rounded-full border border-white/80 object-cover"
                                  />
                                ))}
                                {totalInvited > previewAvatars.length && (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-black/45 text-[10px] font-semibold text-white">
                                    +{totalInvited - previewAvatars.length}
                                  </span>
                                )}
                              </div>
                            ) : totalInvited > 0 ? (
                              <p className="text-xs text-white/85">{totalInvited} invited creator{totalInvited > 1 ? "s" : ""}</p>
                            ) : (
                              <p className="text-xs text-white/85">No invited creators yet</p>
                            )}
                          </div>

                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.section>
          );

          const createSection = (
            <motion.section
              key="create"
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...easeOut, delay: 0.05 }}
              className="relative"
            >
              <div className="flex items-center gap-2 px-1">
                <span className="h-px w-5 bg-[#c9a86a]/80" />
                <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#c9a86a]">By invitation</span>
              </div>
              <h2 className={`mt-2 px-1 font-serif leading-[1.1] tracking-tight text-neutral-900 ${hasActivities ? "text-[17px]" : "text-[22px]"}`}>
                Curate a moment
              </h2>
              {!hasActivities && (
                <p className="mt-1 px-1 text-[12px] leading-relaxed text-neutral-500">
                  Choose the form your gathering will take.
                </p>
              )}

              <div className={`grid grid-cols-2 gap-2.5 ${hasActivities ? "mt-3" : "mt-4"}`}>
                {([
                  { label: "Local activity", hint: "An intimate evening, close to home", icon: MapPin, type: "local" as const },
                  { label: "A trip", hint: "Days away, with chosen company", icon: Plane, type: "trip" as const },
                ]).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setInviteFilterType(item.type);
                      setInviteSheetOpen(true);
                    }}
                    className={`group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 sunset-gradient text-left transition hover:border-[#c9a86a]/40 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:scale-[0.99] ${
                      hasActivities ? "p-3" : "aspect-square p-3.5"
                    }`}
                  >
                    <span className={`flex items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition group-hover:border-[#c9a86a]/50 group-hover:text-[#c9a86a] ${hasActivities ? "h-7 w-7" : "h-9 w-9"}`}>
                      <item.icon className={hasActivities ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.5} />
                    </span>
                    <span className={`block ${hasActivities ? "mt-2" : ""}`}>
                      <span className={`block font-medium tracking-tight text-neutral-900 ${hasActivities ? "text-[13px]" : "text-[14px]"}`}>{item.label}</span>
                      {!hasActivities && (
                        <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">{item.hint}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setInviteFilterType("bali");
                  setInviteSheetOpen(true);
                }}
                className={`group mt-2.5 flex w-full items-center gap-3 rounded-2xl border border-neutral-200/80 sunset-gradient text-left transition hover:border-[#c9a86a]/40 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:scale-[0.99] ${
                  hasActivities ? "px-3.5 py-2.5" : "px-4 py-3.5"
                }`}
              >
                <span className={`flex shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition group-hover:border-[#c9a86a]/50 group-hover:text-[#c9a86a] ${hasActivities ? "h-7 w-7" : "h-9 w-9"}`}>
                  <Palmtree className={hasActivities ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.5} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`font-medium tracking-tight text-neutral-900 ${hasActivities ? "text-[13px]" : "text-[14px]"}`}>Bali</span>
                    <span className="h-px w-4 bg-[#c9a86a]/60" />
                    <span className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#c9a86a]">Featured</span>
                  </span>
                  {!hasActivities && (
                    <span className="mt-0.5 block truncate text-[11px] text-neutral-500">On the island, by invitation</span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-[#c9a86a]" />
              </button>
            </motion.section>
          );

          return hasActivities ? (
            <>
              {upcomingSection}
              {createSection}
            </>
          ) : (
            <>
              {createSection}
              {upcomingSection}
            </>
          );
        })()}

        <motion.section
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...easeOut, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="px-1">
            <h2 className="text-sm font-semibold text-neutral-900">✨ Highlights and International events 🌍</h2>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {eventTempsLoading ? (
              [0, 1].map((i) => (
                <div key={i} className="h-56 w-[76%] shrink-0 animate-pulse rounded-3xl border border-neutral-200 bg-neutral-200/70" />
              ))
            ) : eventTemps.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                No event templates yet
              </div>
            ) : (
              eventTemps.map((template) => {
                const coverUrl = template.Cover?.url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80";
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => navigate(`/activities/${template.id}`)}
                    className="relative h-56 w-[76%] shrink-0 snap-start overflow-hidden rounded-3xl border border-neutral-200 text-left shadow-[0_14px_34px_rgba(0,0,0,0.12)]"
                  >
                    <img src={coverUrl} alt={template.Name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-800">
                      {template.Type || "Template"}
                    </span>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-lg font-semibold text-white">{template.Name}</p>
                      {template.Date_start && <p className="text-xs text-white/80">{template.Date_start}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...easeOut, delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="px-1 text-sm font-semibold text-neutral-900">Suggested locations</h2>
          <div className="space-y-3">
            {suggestedLocationsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-[68px] animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100" />
              ))
            ) : suggestedLocations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                No locations yet
              </div>
            ) : (
              suggestedLocations.slice(0, 6).map((loc) => {
                const cover = loc.Cover?.url || loc.GaIIery?.[0]?.url || ACTIVITY_PLACEHOLDER_COVER;
                const title = loc.Title || "Untitled location";
                const likedCount = 6 + ((loc.id * 13) % 38);
                const avatarSeeds = [
                  ((loc.id * 7) % 70) + 1,
                  ((loc.id * 11) % 70) + 1,
                  ((loc.id * 17) % 70) + 1,
                ];
                return (
                  <article
                    key={loc.id}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
                  >
                    <img src={cover} alt={title} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{title}</p>
                      {loc.Adress && <p className="truncate text-xs text-neutral-500">{loc.Adress}</p>}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {avatarSeeds.map((seed, i) => (
                            <img
                              key={i}
                              src={`https://i.pravatar.cc/40?img=${seed}`}
                              alt=""
                              className="h-4 w-4 rounded-full border border-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[10.5px] font-medium text-neutral-500">
                          Liked by {likedCount} models · {2 + ((loc.id * 5) % 14)} events held
                        </span>

                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateSheet({ title, city: loc.Adress })}
                      className="rounded-full border border-neutral-200 sunset-gradient px-3 py-1.5 text-xs font-semibold text-neutral-700"
                    >
                      Use
                    </button>
                  </article>
                );
              })

            )}
          </div>

        </motion.section>
      </main>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close create activity"
            />
            <motion.section
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              transition={easeOut}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-3xl border border-neutral-200 bg-white px-4 pb-20 pt-4"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
              <h3 className="text-base font-semibold text-neutral-900">Create activity</h3>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Activity name"
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">City / area (optional)</span>
                  <input
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="Cannes"
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Date (optional)</span>
                  <input
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    placeholder="May 10"
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </label>

                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-600">Tags (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const selected = form.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            selected
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting || !form.name.trim()}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await createEvent({
                      Name: form.name.trim(),
                      cities_id: null,
                      Date: form.date.trim() || null,
                      Tags: form.tags,
                      Cover: null,
                    });
                    setSheetOpen(false);
                    navigate(inviteRoute, {
                      state: {
                        activityName: form.name.trim(),
                        city: form.city.trim(),
                        date: form.date.trim(),
                        tags: form.tags,
                      },
                    });
                  } catch (err) {
                    console.error("Failed to create event:", err);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="mt-5 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Continue"}
              </button>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <InviteExperienceSheet
        open={inviteSheetOpen}
        onClose={() => setInviteSheetOpen(false)}
        creator={null}
        filterType={inviteFilterType}
      />
    </div>
  );
}
