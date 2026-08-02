// ActivityDetail.tsx — PATCH (replace file contents or apply changes)
// Notes:
// - Keeps your existing Edit modal + View all modal.
// - Adds: InvitedSummaryRow (top) + AcceptedVerticalCarousel.
// - Adds Chat overlay button (currently stubbed: console.log)

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Calendar, ChevronLeft, MapPin, MessageCircle, Search, User, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";
import type { CreatorLite } from "@/services/creatorSearch";
import { fetchActivityById, type ActivityDetailResponse, type InviteLite, type InviteStatus, type TripActivity } from "@/services/activities";
import { fetchActivityInvited, submitActivityInvitationDecision, type ActivityInvitedItem } from "@/services/activityInvited";
import { toast } from "sonner";
import { getValidInvitedUsers, putTripsInvite } from "@/services/tripsInvite";
import LocalActivityInviteModelsModal from "@/features/activities/LocalActivityInviteModelsModal";
import PendingModelsSheet from "@/components/vic/PendingModelsSheet";
import InvitesSentPopup from "@/components/vic/InvitesSentPopup";
import { useAuth } from "@/hooks/useAuth";

const easeOut = { duration: 0.3, ease: "easeOut" };

type EditableActivityFields = Pick<TripActivity, "title" | "dateLabel" | "locationLabel" | "notes">;
const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=65";

const extractIgHandle = (igAccount?: string, fallbackName?: string) => {
  if (igAccount) {
    const trimmed = igAccount.trim();
    if (trimmed) {
      const match = trimmed.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
      if (match?.[1]) return match[1];
      if (trimmed.startsWith("@")) return trimmed.slice(1);
      return trimmed;
    }
  }
  return fallbackName || "";
};
type PersonLiteStatus = "confirmed" | "pending" | "invited" | "rejected";
type InviteModalTabKey = "participants" | "discover" | "invited" | "pending" | "accepted" | "rejected";
type PersonLite = {
  id: string;
  name: string;
  ig: string;
  avatarUrl: string;
  status: PersonLiteStatus;
};

function ParticipantsStrip({ people, onViewAll, onSelect }: { people: PersonLite[]; onViewAll: () => void; onSelect?: (person: PersonLite) => void }) {
  if (!people.length) return null;

  const statusPillStyles: Record<PersonLiteStatus, string> = {
    confirmed: "border-emerald-200 bg-emerald-50/95 text-emerald-700",
    pending: "border-amber-200 bg-amber-50/95 text-amber-700",
    invited: "border-sky-200 bg-sky-50/95 text-sky-700",
    rejected: "border-rose-200 bg-rose-50/95 text-rose-700",
  };

  const CARD_H = "h-[156px]";
  const CARD_W_SCROLL = "w-[calc((100%-24px)/3)]";
  const CARD_W_GRID = "w-full";

  const Card = ({ person }: { person: PersonLite }) => (
    <article
      className={`relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_18px_48px_rgba(0,0,0,0.10)] ${CARD_H} cursor-pointer active:scale-[0.97] transition-transform`}
      onClick={() => onSelect?.(person)}
    >
      <img src={person.avatarUrl} alt={person.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />

      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

      <div className="absolute bottom-3 left-3 right-3">
        <p className="truncate text-sm font-semibold text-white drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]">{person.name}</p>
      </div>
    </article>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...easeOut, delay: 0.052 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Participants</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700"
          >
            View all
          </button>
          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
            {people.length} total
          </span>
        </div>
      </div>

      {people.length <= 2 ? (
        <div className="grid grid-cols-2 gap-3">
          {people.map((person) => (
            <div key={person.id} className={CARD_W_GRID}>
              <Card person={person} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="-mx-4 overflow-x-auto px-4 pr-[28px] snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3">
              {people.map((person) => (
                <motion.div
                  key={person.id}
                  className={`${CARD_W_SCROLL} shrink-0 snap-start`}
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.9 }}
                >
                  <Card person={person} />
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-neutral-400">Swipe to see more</p>
        </>
      )}
    </motion.section>
  );
}

function AvatarStack({ people, size = 36 }: { people: InviteLite[]; size?: 32 | 36 | 40 }) {
  const shown = people.slice(0, 6);
  const overflow = Math.max(0, people.length - shown.length);
  const avatarSizeClass = size === 32 ? "h-8 w-8" : size === 40 ? "h-10 w-10" : "h-9 w-9";
  const overflowPillClass = size === 32 ? "h-8" : size === 40 ? "h-10" : "h-9";

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((invite) => (
          <div
            key={invite.id}
            className={`${avatarSizeClass} overflow-hidden rounded-full border-2 border-white shadow-[0_10px_20px_rgba(0,0,0,0.08)]`}
          >
            <img
              src={invite.creator.avatarUrl}
              alt={invite.creator.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {overflow > 0 && (
        <div className={`ml-3 inline-flex ${overflowPillClass} items-center rounded-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-[0_10px_20px_rgba(0,0,0,0.06)]`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-[0_10px_22px_rgba(0,0,0,0.06)] backdrop-blur">
      <span className="text-neutral-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/**
 * Invited models — MUST BE UP.
 * Shows pending + rejected counters.
 * Pending = status === "invited" (and "pending" if exists in backend later)
 */
function InvitedSummaryRow({ invited, accepted, rejected, onViewAll, onSelect }: {
  invited: InviteLite[];
  accepted: InviteLite[];
  rejected: InviteLite[];
  onViewAll: () => void;
  onSelect?: (invite: InviteLite) => void;
}) {
  const pendingCount = invited.length;
  const invitedCount = invited.length + accepted.length + rejected.length;
  const rejectedCount = rejected.length;

  const allInvited: InviteLite[] = [...accepted, ...invited, ...rejected];

  const chipStyles: Record<InviteStatus, string> = {
    accepted: "border-emerald-200 bg-emerald-50/95 text-emerald-700",
    invited: "border-amber-200 bg-amber-50/95 text-amber-700",
    rejected: "border-rose-200 bg-rose-50/95 text-rose-700",
  };
  const chipLabel: Record<InviteStatus, string> = {
    accepted: "Approved",
    invited: "Pending",
    rejected: "Rejected",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...easeOut, delay: 0.06 }}
      className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            Invited models <span className="text-lg">• {invitedCount}</span>
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {accepted.length} approved · {pendingCount} pending · {rejectedCount} rejected
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700"
        >
          View all
        </button>
      </div>

      {allInvited.length > 0 ? (
        <div className="-mx-4 mt-4 overflow-x-auto px-4 pr-[28px] snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3">
            {allInvited.map((invite) => (
              <motion.article
                key={invite.id}
                role="button"
                tabIndex={0}
                aria-label={`${invite.creator.name} — ${chipLabel[invite.status]}`}
                onClick={() => onSelect?.(invite)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.(invite);
                  }
                }}
                className="relative w-[calc((100%-24px)/3)] min-w-[110px] h-[156px] shrink-0 snap-start overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_18px_48px_rgba(0,0,0,0.10)] cursor-pointer active:scale-[0.97] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"

                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.9 }}
              >
                <img
                  src={invite.creator.avatarUrl}
                  alt={invite.creator.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                <span
                  className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${chipStyles[invite.status]}`}
                >
                  {chipLabel[invite.status]}
                </span>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="truncate text-xs font-semibold text-white drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                    {invite.creator.name}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-neutral-500">No one yet</p>
      )}
    </motion.section>
  );
}

/**
 * Accepted models — VERTICAL CINEMATIC CAROUSEL (snap-y)
 * Chat overlay button on each card.
 */
function AcceptedVerticalCarousel({
  accepted,
  onChat,
  onViewAll,
}: {
  accepted: InviteLite[];
  onChat: (invite: InviteLite) => void;
  onViewAll: () => void;
}) {
  if (!accepted.length) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ ...easeOut, delay: 0.08 }}
        className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Accepted models</h3>
            <p className="text-xs text-neutral-500">No one accepted yet</p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
            0
          </span>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...easeOut, delay: 0.08 }}
      className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">Accepted models</h3>
          <div className="mt-1 flex items-center gap-3">
            <AvatarStack people={accepted} size={32} />
            <p className="text-xs text-neutral-500">Accepted ({accepted.length})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-neutral-700"
          >
            View all
          </button>
          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
            {accepted.length}
          </span>
        </div>
      </div>

      <div className="mt-3 h-[380px] overflow-y-auto pr-1 snap-y snap-mandatory">
        <div className="space-y-4">
          {accepted.map((invite, idx) => (
            <motion.div
              key={invite.id}
              className="snap-start"
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 24,
                mass: 0.9,
                delay: idx * 0.03,
              }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.10)]">
                <div className="relative h-[300px] w-full">
                  <img
                    src={invite.creator.avatarUrl}
                    alt={invite.creator.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <button
                    type="button"
                    onClick={() => onChat(invite)}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/85 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-[0_10px_25px_rgba(0,0,0,0.14)] backdrop-blur transition active:scale-95"
                    aria-label={`Chat with ${invite.creator.name}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-base font-semibold text-white drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                      {invite.creator.name}
                    </div>
                    <div className="text-xs text-white/80">@{invite.creator.ig}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activityId } = useParams();

  const [activity, setActivity] = useState<TripActivity | null>(null);
  const [activityRaw, setActivityRaw] = useState<ActivityDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [viewingStatus, setViewingStatus] = useState<InviteStatus | null>(null);
  const [search, setSearch] = useState("");
  const [showRejected, setShowRejected] = useState(false);
  const [inviteModelsOpen, setInviteModelsOpen] = useState(false);
  const [inviteModalInitialTab, setInviteModalInitialTab] = useState<InviteModalTabKey>("discover");
  const [profileSheetCreator, setProfileSheetCreator] = useState<CreatorLite | null>(null);
  const [profileSheetStatus, setProfileSheetStatus] = useState<"accepted" | "invited" | "pending" | "rejected" | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<ActivityInvitedItem | null>(null);
  const [invitedRaw, setInvitedRaw] = useState<ActivityInvitedItem[]>([]);
  const [pendingModelsOpen, setPendingModelsOpen] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [invitedReloadKey, setInvitedReloadKey] = useState(0);
  const [invitesSentPopup, setInvitesSentPopup] = useState<{ open: boolean; tripName: string; cityName?: string; total: number; delta: number; avatars: Array<{ id: number; name: string; url: string | null }>; hostAvatarUrl?: string | null }>({
    open: false,
    tripName: "",
    total: 0,
    delta: 0,
    avatars: [],
    hostAvatarUrl: null,
  });
  const [editForm, setEditForm] = useState<EditableActivityFields>({
    title: "",
    dateLabel: "",
    locationLabel: "",
    notes: "",
  });

  useEffect(() => {

    const mapToInvites = (a: ActivityDetailResponse): InviteLite[] => {
      const invitedUsers = Array.isArray(a.InvitedUsers) ? a.InvitedUsers : [];

      return invitedUsers.map((user, i) => {
        const creatorName = user.NickName || user.name || "Invited creator";

        return {
          id: String(user.id ?? `${a.id}-${i}`),
          status: "invited",
          creator: {
            name: creatorName,
            avatarUrl: user.Profile_pic?.url || FALLBACK_AVATAR,
            ig: extractIgHandle(user.IG_account, user.NickName),
          },
        };
      });
    };

    const mapToTrip = (a: ActivityDetailResponse): TripActivity => {
      const invites = mapToInvites(a);

      return {
        id: String(a.id),
        title: a.Name || "Untitled",
        subtitle: a.Destination || "Local",
        coverUrl:
          a.Tripcover && typeof a.Tripcover === "object" && "url" in a.Tripcover
            ? String((a.Tripcover as { url?: string }).url || PLACEHOLDER_COVER)
            : PLACEHOLDER_COVER,
        dateLabel: a.Starting_Day || "",
        locationLabel: a.Destination || "Local",
        notes: a.ActivitiesList || "",
        invites,
      };
    };

    const mapInvitedToInvites = (items: ActivityInvitedItem[]): InviteLite[] => {
      const statusMap: Record<string, InviteStatus> = {
        approved: "accepted",
        invited: "invited",
        "pending request": "invited",
        rejected: "rejected",
        cancelled: "rejected",
      };
      return items
        .filter((it) => it.type !== "organizer")
        .map((it) => {
          const u = it._user_turbo;
          const name = u?.name || "Invited creator";
          return {
            id: String(it.id),
            status: statusMap[it.status] ?? "invited",
            creator: {
              name,
              avatarUrl: u?.Profile_pic?.url || FALLBACK_AVATAR,
              ig: extractIgHandle(u?.IG_account, name),
            },
          };
        });
    };

    const load = async () => {
      if (!activityId) return;

      try {
        setLoading(true);
        const [data, invitedList] = await Promise.all([
          fetchActivityById(activityId),
          fetchActivityInvited(activityId).catch((err) => {
            console.warn("activity_invited fetch failed", err);
            return [] as ActivityInvitedItem[];
          }),
        ]);
        const mapped = mapToTrip(data);
        if (invitedList.length > 0) {
          mapped.invites = mapInvitedToInvites(invitedList);
        }
        setInvitedRaw(invitedList);
        setActivityRaw(data);
        setActivity(mapped);
        setEditForm({
          title: mapped.title,
          dateLabel: mapped.dateLabel,
          locationLabel: mapped.locationLabel,
          notes: mapped.notes,
        });
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error && error.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to load activity", error);
        }
        setActivityRaw(null);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [activityId, navigate, invitedReloadKey]);

  const pendingClarisInvites = useMemo(
    () =>
      invitedRaw.filter(
        (item) =>
          item.source === "claris" &&
          (item.status === "pending request" || item.status === "invited")
      ),
    [invitedRaw]
  );

  const handleInvitationDecision = async (decision: "approve" | "reject") => {
    if (!activityId) return;
    // Always use the exact raw invitation object (keeps id, source and booking_id intact).
    const invitation =
      selectedInvitation &&
      (invitedRaw.find((item) => item.id === selectedInvitation.id) ?? selectedInvitation);
    if (!invitation) {
      toast.error("Could not find this invitation");
      return;
    }

    setDecisionPending(true);
    try {
      await submitActivityInvitationDecision({ activityId, invitation, decision });
      toast.success(decision === "approve" ? "Model approved" : "Model rejected");
      setProfileSheetCreator(null);
      setProfileSheetStatus(null);
      setSelectedInvitation(null);
      setInvitedReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error("[ActivityDetail] decision failed", error);
      toast.error(
        error instanceof Error ? `Could not save decision: ${error.message}` : "Could not save decision"
      );
    } finally {
      setDecisionPending(false);
    }
  };


  const groupedInvites = useMemo(() => {
    if (!activity) return { accepted: [], invited: [], rejected: [] } as Record<InviteStatus, InviteLite[]>;

    return {
      accepted: activity.invites.filter((invite) => invite.status === "accepted"),
      invited: activity.invites.filter((invite) => invite.status === "invited"),
      rejected: activity.invites.filter((invite) => invite.status === "rejected"),
    };
  }, [activity]);

  const participantsPeople = useMemo<PersonLite[]>(() => {
    if (!activityRaw) return [];

    type RawUserTurbo = {
      id?: number | string;
      name?: string;
      NickName?: string;
      IG_account?: string;
      Profile_pic?: { url?: string } | null;
    };

    type RawParticipant = {
      user_turbo_id?: number | string;
      statusapp?: string | null;
      _user_turbo_vic?: RawUserTurbo | null;
      // sometimes Xano might flatten user fields:
      id?: number | string;
      name?: string;
      NickName?: string;
      IG_account?: string;
      Profile_pic?: { url?: string } | null;
    };

    const normalizeStatus = (status?: string | null): PersonLiteStatus => {
      const value = String(status || "").toLowerCase();
      if (value === "confirmed" || value === "accepted") return "confirmed";
      if (value === "pending") return "pending";
      if (value === "invited") return "invited";
      if (value === "rejected" || value === "declined" || value === "cancelled") return "rejected";
      return "pending";
    };

    const pickUser = (participant: RawParticipant): RawUserTurbo => {
      if (participant._user_turbo_vic && typeof participant._user_turbo_vic === "object") {
        return participant._user_turbo_vic;
      }

      return {
        id: participant.id,
        name: participant.name,
        NickName: participant.NickName,
        IG_account: participant.IG_account,
        Profile_pic: participant.Profile_pic,
      };
    };

    const getParticipantsArray = (): RawParticipant[] => {
      const anyRaw = activityRaw as unknown as {
        participant?: RawParticipant[];
        Participants?: RawParticipant[];
        Tripcover?: { Participants?: RawParticipant[] } | null;
      };

      if (Array.isArray(anyRaw.participant)) return anyRaw.participant;
      if (Array.isArray(anyRaw.Participants)) return anyRaw.Participants;
      if (anyRaw.Tripcover && Array.isArray(anyRaw.Tripcover.Participants)) return anyRaw.Tripcover.Participants;

      return [];
    };

    const map = new Map<string, PersonLite>();

    const participants = getParticipantsArray();

    for (const participant of participants) {
      const user = pickUser(participant);
      const key = String(participant.user_turbo_id ?? user.id ?? "").trim();
      if (!key) continue;

      const name = user.NickName || user.name || "Participant";
      map.set(key, {
        id: key,
        name,
        ig: extractIgHandle(user.IG_account, user.NickName || user.name),
        avatarUrl: user.Profile_pic?.url || FALLBACK_AVATAR,
        status: normalizeStatus(participant.statusapp),
      });
    }

    const invitedUsers = Array.isArray(activityRaw.InvitedUsers) ? activityRaw.InvitedUsers : [];
    for (const user of invitedUsers) {
      const key = String((user as { user_turbo_id?: number | string }).user_turbo_id ?? user.id ?? "").trim();
      if (!key || map.has(key)) continue;
      const name = user.NickName || user.name || "Invited creator";
      map.set(key, {
        id: key,
        name,
        ig: extractIgHandle(user.IG_account, user.NickName),
        avatarUrl: user.Profile_pic?.url || FALLBACK_AVATAR,
        status: "invited",
      });
    }

    const order: Record<PersonLiteStatus, number> = { confirmed: 0, pending: 1, invited: 2, rejected: 3 };

    return Array.from(map.values()).sort((a, b) => {
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [activityRaw]);

  const peopleByTab = useMemo(() => {
    const participants = participantsPeople.map((person) => ({
      ...person,
      status: (person.status === "confirmed" ? "accepted" : person.status) as "invited" | "pending" | "accepted" | "rejected",
    }));
    const invited = participantsPeople
      .filter((person) => person.status === "invited")
      .map((person) => ({ ...person, status: "invited" as const }));
    const pending = participantsPeople
      .filter((person) => person.status === "pending")
      .map((person) => ({ ...person, status: "pending" as const }));
    const accepted = participantsPeople
      .filter((person) => person.status === "confirmed")
      .map((person) => ({ ...person, status: "accepted" as const }));
    const rejected = participantsPeople
      .filter((person) => person.status === "rejected")
      .map((person) => ({ ...person, status: "rejected" as const }));

    return { participants, invited, pending, accepted, rejected };
  }, [participantsPeople]);

  const activeList = viewingStatus ? groupedInvites[viewingStatus] : [];
  const filteredList = activeList.filter((invite) => {
    const q = search.toLowerCase();
    return invite.creator.name.toLowerCase().includes(q) || invite.creator.ig.toLowerCase().includes(q);
  });

  const cityValue = activity?.locationLabel || "—";
  const venueValue = activity?.subtitle || "Venue";
  const dateValue = activity?.dateLabel || "—";
  const notesValue = activity?.notes || "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-sm text-neutral-500">Loading activity…</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-6 text-sm text-neutral-500">Activity not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F] pb-12">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-[#FAFAFA]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">Activity</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-5 px-4 pt-5">
        <motion.section
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={easeOut}
          className="relative overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_14px_38px_rgba(0,0,0,0.14)]"
        >
          <img src={activity.coverUrl} alt={activity.title} className="h-60 w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/80 px-3 py-1 text-[11px] font-medium text-neutral-900 backdrop-blur">
              {activity.subtitle || "Local activity"}
            </span>
          </div>
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-900 backdrop-blur">
            {user?.Picture?.url ? (
              <img src={user.Picture.url} alt={user.Name} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                <User className="h-3.5 w-3.5 text-neutral-600" />
              </span>
            )}
            Hosted by {user?.Name || ""}
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <h2 className="text-2xl font-semibold text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)]">{activity.title || "—"}</h2>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...easeOut, delay: 0.05 }}
          className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Details</h2>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: MapPin, label: "City", value: cityValue },
                { icon: Calendar, label: "Date / time", value: dateValue },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-500">{item.label}</p>
                    <p className="text-sm font-medium text-neutral-900">{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="pt-1 text-xs text-neutral-500">{notesValue}</p>
          </div>
        </motion.section>

        <InvitedSummaryRow
          invited={groupedInvites.invited}
          accepted={groupedInvites.accepted}
          rejected={groupedInvites.rejected}
          onViewAll={() => {
            setPendingModelsOpen(true);
          }}
          onSelect={(invite) => {
            // Resolve the raw invitation: primary by invitation id, fallback by user/vic identity.
            const raw =
              invitedRaw.find((item) => String(item.id) === String(invite.id)) ??
              invitedRaw.find(
                (item) =>
                  item.type !== "organizer" &&
                  (String(item.user_turbo_id) === String(invite.id) ||
                    (item._user_turbo?.name && item._user_turbo.name === invite.creator.name))
              ) ??
              null;

            setProfileSheetCreator({
              id: Number(raw?.user_turbo_id ?? invite.id) || 0,
              name: invite.creator.name,
              IG_account: invite.creator.ig || undefined,
              Profile_pic: invite.creator.avatarUrl ? { url: invite.creator.avatarUrl } : null,
            });
            setProfileSheetStatus(invite.status as any);
            setSelectedInvitation(raw);
          }}
        />


        <ParticipantsStrip
          people={participantsPeople}
          onViewAll={() => {
            setInviteModalInitialTab("participants");
            setInviteModelsOpen(true);
          }}
          onSelect={(person) => {
            setProfileSheetCreator({
              id: Number(person.id) || 0,
              name: person.name,
              IG_account: person.ig || undefined,
              Profile_pic: person.avatarUrl ? { url: person.avatarUrl } : null,
            });
          }}
        />

        <motion.section
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...easeOut, delay: 0.055 }}
          className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
        >
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setInviteModalInitialTab("discover");
                setInviteModelsOpen(true);
              }}
              className="rounded-full bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-white"
            >
              Invite more models
            </button>
            <button
              type="button"
              onClick={() => console.log("[ActivityDetail] complete table booking")}
              className="rounded-full border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700"
            >
              Complete table booking
            </button>
          </div>
        </motion.section>

        {groupedInvites.accepted.length > 0 && (
          <AcceptedVerticalCarousel
            accepted={groupedInvites.accepted}
            onViewAll={() => {
              setInviteModalInitialTab("participants");
              setInviteModelsOpen(true);
            }}
            onChat={(invite) => {
              // Hook this to your chat route/modal
              console.log("[ActivityDetail] chat with", invite.creator);
            }}
          />
        )}

        {/* Rejected (optional, collapsable) */}
        <motion.section
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...easeOut, delay: 0.1 }}
          className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Rejected models</h3>
              <p className="text-xs text-neutral-500">{groupedInvites.rejected.length} total</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRejected((prev) => !prev)}
                className="text-xs font-medium text-neutral-500"
              >
                {showRejected ? "Collapse" : "Expand"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewingStatus("rejected");
                  setSearch("");
                }}
                className="text-xs font-semibold text-neutral-700"
              >
                View all
              </button>
            </div>
          </div>

          {showRejected && (
            <div className="mt-3">
              <AvatarStack people={groupedInvites.rejected} />
            </div>
          )}
        </motion.section>
      </main>

      {/* Edit sheet (unchanged) */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.button
              type="button"
              onClick={() => setEditing(false)}
              className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.section
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              transition={easeOut}
              className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border border-neutral-200 bg-white px-4 pb-6 pt-4"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
              <h3 className="text-base font-semibold text-neutral-900">Edit details</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["title", "Name"],
                  ["dateLabel", "Date / time"],
                  ["locationLabel", "City / venue"],
                ].map(([field, label]) => (
                  <label className="block" key={field}>
                    <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
                    <input
                      value={editForm[field as keyof EditableActivityFields]}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, [field]: event.target.value }))}
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Notes</span>
                  <textarea
                    value={editForm.notes}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivity((prev) => (prev ? { ...prev, ...editForm } : prev));
                  setEditing(false);
                }}
                className="mt-4 w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Save
              </button>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      {/* View all modal (unchanged, but will now be triggered by Invited/Accepted/Rejected buttons) */}
      <AnimatePresence>
        {viewingStatus && (
          <>
            <motion.button
              type="button"
              onClick={() => setViewingStatus(null)}
              className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.section
              initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }}
              transition={easeOut}
              className="fixed inset-6 z-40 mx-auto flex max-w-md flex-col rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {viewingStatus[0].toUpperCase() + viewingStatus.slice(1)} models
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingStatus(null)}
                  className="rounded-full border border-neutral-200 p-1.5 text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="mb-3 flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or IG"
                  className="w-full text-sm focus:outline-none"
                />
              </label>

              <div className="space-y-2 overflow-y-auto pr-1">
                {filteredList.map((invite) => (
                  <div key={invite.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-2.5">
                    <img src={invite.creator.avatarUrl} alt={invite.creator.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{invite.creator.name}</p>
                      <p className="text-xs text-neutral-500">@{invite.creator.ig}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        invite.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700"
                          : invite.status === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {invite.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <InvitesSentPopup
        open={invitesSentPopup.open}
        onClose={() => setInvitesSentPopup((prev) => ({ ...prev, open: false }))}
        onDone={() => {
          setInvitesSentPopup((prev) => ({ ...prev, open: false }));
          navigate("/activities");
        }}
        tripName={invitesSentPopup.tripName}
        cityName={invitesSentPopup.cityName}
        total={invitesSentPopup.total}
        delta={invitesSentPopup.delta}
        hostAvatarUrl={invitesSentPopup.hostAvatarUrl}
        avatars={invitesSentPopup.avatars}
      />
      <LocalActivityInviteModelsModal
        open={inviteModelsOpen}
        onClose={() => setInviteModelsOpen(false)}
        initialTab={inviteModalInitialTab}
        venueLabel={activity?.subtitle || activity?.title}
        cityName={activity?.locationLabel || "your city"}
        selectedTopicIds={[]}
        peopleByTab={peopleByTab}
        onConfirm={async (selected) => {
          if (!activityId || selected.length === 0) return;
          try {
            const creatorIds = selected.map((c) => Number(c.id));
            const response = await putTripsInvite(Number(activityId), creatorIds);
            const trip = response.result1 && typeof response.result1 === "object" ? response.result1 : {};
            const validInvitedUsers = getValidInvitedUsers(trip.InvitedUsers);
            const delta = Number(response.invite) || 0;
            const total = Number(response.invitedtotal) || validInvitedUsers.length;
            setInvitesSentPopup({
              open: true,
              tripName: typeof trip.Name === "string" && trip.Name ? trip.Name : activity?.title || "",
              cityName: activity?.locationLabel || undefined,
              total,
              delta,
              avatars: validInvitedUsers.slice(0, 3).map((user) => ({ id: user.id, name: user.name, url: user.avatarUrl })),
              hostAvatarUrl: user?.Picture?.url || null,
            });

            const data = await fetchActivityById(activityId);
            const newInvites: InviteLite[] = (data.InvitedUsers ?? []).map((user, i) => ({
              id: String(user.id ?? `${data.id}-${i}`),
              status: "invited",
              creator: {
                name: user.NickName || user.name || "Invited creator",
                avatarUrl: user.Profile_pic?.url || "https://i.pravatar.cc/100?img=65",
                ig: (() => {
                  const account = user.IG_account?.trim();
                  if (account) {
                    const match = account.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
                    if (match?.[1]) return match[1];
                    if (account.startsWith("@")) return account.slice(1);
                    return account;
                  }
                  return user.NickName || "";
                })(),
              },
            }));
            setActivity((prev) => (prev ? { ...prev, invites: newInvites } : prev));
          } catch (err) {
            console.error("[ActivityDetail] Failed to send invites", err);
          }
          setInviteModelsOpen(false);
        }}
      />
      <PendingModelsSheet
        open={pendingModelsOpen}
        items={pendingClarisInvites}
        onClose={() => setPendingModelsOpen(false)}
        onSelect={(item) => {
          setPendingModelsOpen(false);
          setProfileSheetCreator({
            id: Number(item.user_turbo_id) || 0,
            name: item._user_turbo?.name || "Model",
            IG_account: item._user_turbo?.IG_account || undefined,
            Tiktok_account: item._user_turbo?.Tiktok_account || undefined,
            Profile_pic: item._user_turbo?.Profile_pic?.url ? { url: item._user_turbo.Profile_pic.url } : null,
          });
          setProfileSheetStatus("pending");
          setSelectedInvitation(item);
        }}
      />
      <CreatorProfileSheet
        creator={profileSheetCreator}
        open={!!profileSheetCreator}
        onClose={() => {
          if (decisionPending) return;
          setProfileSheetCreator(null);
          setProfileSheetStatus(null);
          setSelectedInvitation(null);
        }}
        variant="vic"
        profileType="candidate"
        invitationStatus={profileSheetStatus}
        onDecision={selectedInvitation ? (decision) => void handleInvitationDecision(decision) : undefined}
        decisionPending={decisionPending}
      />
    </div>
  );
}
