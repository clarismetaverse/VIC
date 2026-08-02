import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CreatorLite } from "@/services/creatorSearch";
import { searchCreatorsTurbo } from "@/services/creatorSearchTurbo";
import { fetchNewInTown } from "@/services/newInTown";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";

type TabKey = "participants" | "discover" | "invited" | "pending" | "accepted" | "rejected";

type PersonLiteStatus = "invited" | "pending" | "accepted" | "rejected";

type PersonLite = {
  id: string | number;
  name: string;
  ig?: string;
  avatarUrl?: string | null;
  status: PersonLiteStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  venueLabel?: string;
  cityName?: string;
  maxInvites?: number;
  initialSelected?: CreatorLite[];
  selectedTopicIds?: number[];
  onConfirm: (selected: CreatorLite[]) => void;
  initialTab?: TabKey;
  peopleByTab?: Partial<Record<Exclude<TabKey, "discover">, PersonLite[]>>;
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheet = {
  hidden: { y: "10%", opacity: 0, scale: 0.99 },
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: { y: "10%", opacity: 0, scale: 0.99 },
};

function useDebounced<T>(value: T, delay = 260) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function LocalActivityInviteModelsModal({
  open,
  onClose,
  venueLabel,
  cityName = "your city",
  maxInvites = 8,
  initialSelected = [],
  selectedTopicIds = [],
  onConfirm,
  initialTab,
  peopleByTab,
}: Props) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<TabKey>("discover");
  const dq = useDebounced(q, 260);
  const [loading, setLoading] = useState(false);
  const [newInTownLoading, setNewInTownLoading] = useState(false);
  const [newInTown, setNewInTown] = useState<CreatorLite[]>([]);
  const [results, setResults] = useState<CreatorLite[]>([]);
  const [selected, setSelected] = useState<Map<number, CreatorLite>>(new Map());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [profileCreator, setProfileCreator] = useState<CreatorLite | null>(null);
  const latestSearchRequestIdRef = useRef(0);

  const normalizedTopicIds = useMemo(
    () => selectedTopicIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
    [selectedTopicIds],
  );

  const initialSelectedKey = useMemo(
    () =>
      initialSelected
        .map((x) => Number(x.id))
        .sort((a, b) => a - b)
        .join(","),
    [initialSelected],
  );

  useEffect(() => {
    if (!open) return;

    setTab(initialTab ?? "discover");

    const m = new Map<number, CreatorLite>();
    initialSelected.forEach((x) => m.set(Number(x.id), x));
    setSelected(m);

    setQ("");
    setResults([]);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, initialSelectedKey, initialTab]);

  useEffect(() => {
    if (!open) return;
    if (tab !== "discover") return;

    let active = true;
    const load = async () => {
      setNewInTownLoading(true);
      try {
        const items = await fetchNewInTown();
        if (!active) return;
        setNewInTown(items);
      } catch {
        if (active) setNewInTown([]);
      } finally {
        if (active) setNewInTownLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [open, initialSelectedKey, tab]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (tab !== "discover") return;

    const query = dq.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;
    const requestId = latestSearchRequestIdRef.current + 1;
    latestSearchRequestIdRef.current = requestId;

    const run = async () => {
      setLoading(true);
      try {
        const found = await searchCreatorsTurbo({
          q: query,
          topicIds: normalizedTopicIds,
          signal: abortController.signal,
        });
        if (cancelled || requestId !== latestSearchRequestIdRef.current) return;
        setResults((found ?? []).slice(0, 40));
      } catch (err) {
        if (
          !cancelled &&
          requestId === latestSearchRequestIdRef.current &&
          !(err instanceof DOMException && err.name === "AbortError")
        ) {
          setResults([]);
        }
      } finally {
        if (!cancelled && requestId === latestSearchRequestIdRef.current) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [dq, normalizedTopicIds, open, tab]);

  const selectedCount = selected.size;
  const invitesLeft = Math.max(0, maxInvites - selectedCount);
  const canAddMore = selectedCount < maxInvites;

  const baseList = useMemo(() => {
    if (dq.trim().length >= 2) return results;
    return newInTown;
  }, [dq, results, newInTown]);

  const displayList = useMemo(() => {
    const out: CreatorLite[] = [];
    selected.forEach((v) => out.push(v));
    const ids = new Set(out.map((x) => Number(x.id)));
    baseList.forEach((r) => {
      if (!ids.has(Number(r.id))) out.push(r);
    });
    return out;
  }, [baseList, selected]);

  const statusBaseList = useMemo<PersonLite[]>(() => {
    if (tab === "discover") return [];
    const list = peopleByTab?.[tab as Exclude<TabKey, "discover">] ?? [];
    return Array.isArray(list) ? list : [];
  }, [peopleByTab, tab]);

  const statusDisplayList = useMemo<PersonLite[]>(() => {
    if (tab === "discover") return [];
    const query = q.trim().toLowerCase();
    if (!query) return statusBaseList;

    return statusBaseList.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const ig = (p.ig || "").toLowerCase();
      return name.includes(query) || ig.includes(query);
    });
  }, [q, statusBaseList, tab]);

  const statusPillStyles: Record<PersonLiteStatus, string> = {
    accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    invited: "border-sky-200 bg-sky-50 text-sky-700",
    rejected: "border-rose-200 bg-rose-50 text-rose-700",
  };

  const toggle = (c: CreatorLite) => {
    const id = Number(c.id);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!canAddMore) return next;
      next.set(id, c);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selected.values()));
    onClose();
  };

  const headerTitle =
    tab === "discover"
      ? dq.trim().length >= 2
        ? "Search results"
        : `New in ${cityName}`
      : tab === "participants"
        ? "Participants"
        : `${tab.charAt(0).toUpperCase()}${tab.slice(1)} models`;
  const showSkeletons = tab === "discover" && newInTownLoading && dq.trim().length < 2 && !newInTown.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            variants={sheet}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-neutral-200 bg-[#FAFAFA] text-neutral-900 shadow-[0_-10px_60px_rgba(0,0,0,0.15)]"
          >
            <div className="relative overflow-hidden px-5 pb-4 pt-5">
              <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-blue-500/8 blur-3xl" />
              <div className="pointer-events-none absolute -left-14 -bottom-20 h-56 w-56 rounded-full bg-purple-500/8 blur-3xl" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    Premium invites
                  </p>
                  <p className="mt-2 text-xl font-semibold text-neutral-900">Invite models</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {venueLabel ? `For ${venueLabel}` : "Select the right people for this table."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-500 hover:bg-neutral-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name or IG…"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {loading && tab === "discover" && (
                  <span className="text-[11px] font-semibold text-neutral-400">Searching…</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {([
                  ["participants", "Participants"],
                  ["discover", "Discover"],
                  ["invited", "Invited"],
                  ["pending", "Pending"],
                  ["accepted", "Accepted"],
                  ["rejected", "Rejected"],
                ] as Array<[TabKey, string]>).map(([key, label]) => {
                  const active = tab === key;
                  const isParticipants = key === "participants";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                        active
                          ? isParticipants
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] scale-[1.03]"
                            : "border-neutral-900 bg-neutral-900 text-white"
                          : isParticipants
                            ? "border-neutral-300 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {tab === "discover" && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-500">
                    Selected <span className="text-neutral-900">{selectedCount}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-500">
                    Invites left <span className="text-neutral-900">{invitesLeft}</span>
                  </span>
                  {!canAddMore && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-500">
                      Max reached
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 pb-2">
              <p className="text-xs font-semibold text-neutral-500">{headerTitle}</p>
            </div>

            <div className="max-h-[56vh] overflow-y-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {showSkeletons ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="h-[78px] w-full animate-pulse rounded-3xl border border-neutral-200 bg-neutral-100"
                    />
                  ))}
                </div>
              ) : tab === "discover" && displayList.length === 0 && !loading ? (
                <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                  <p className="text-sm font-semibold text-neutral-900">No results</p>
                  <p className="mt-1 text-xs text-neutral-500">Try a different keyword.</p>
                </div>
              ) : tab !== "discover" && statusDisplayList.length === 0 ? (
                <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                  <p className="text-sm font-semibold text-neutral-900">No {tab} people</p>
                  <p className="mt-1 text-xs text-neutral-500">Try a different keyword.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tab === "discover" &&
                    displayList.map((m) => {
                      const id = Number(m.id);
                      const isSelected = selected.has(id);
                      const disabled = !isSelected && !canAddMore;
                      const avatarUrl = m?.Profile_pic?.url;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setProfileCreator(m)}
                          disabled={disabled}
                          className={`group flex w-full items-center gap-4 rounded-3xl border px-4 py-5 text-left transition ${
                            isSelected
                              ? "border-blue-200 bg-blue-50/60"
                              : "border-neutral-200 bg-white hover:bg-neutral-50"
                          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={m.name ?? "Creator"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400">
                                {(m.name ?? "C").slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-900">{m.name ?? "Creator"}</p>
                            <p className="truncate text-xs text-neutral-400">Model • Available</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                                <Check className="h-3.5 w-3.5" />
                                Selected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-500">
                                Add <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                  {tab !== "discover" &&
                    statusDisplayList.map((p) => (
                      <div
                        key={`${tab}-${p.id}`}
                        className="flex w-full items-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 py-4"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt={p.name ?? "Creator"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400">
                              {(p.name ?? "C").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-900">{p.name ?? "Creator"}</p>
                          <p className="truncate text-xs text-neutral-500">{p.ig ? `@${p.ig}` : "—"}</p>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusPillStyles[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 bg-[#FAFAFA]/95 px-4 pb-5 pt-3 backdrop-blur">
              {tab === "discover" ? (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 flex-1 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="h-11 flex-1 rounded-full bg-neutral-900 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.99]"
                  >
                    Send invites
                  </button>
                </div>
              ) : (
                tab === "participants" ? (
                  <button
                    type="button"
                    onClick={() => setTab("discover")}
                    className="h-11 w-full rounded-full bg-neutral-900 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.99]"
                  >
                    Invite more
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 w-full rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Close
                  </button>
                )
              )}

              <p className="mt-2 text-center text-[11px] text-neutral-400">Invitations will be linked to this table.</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <CreatorProfileSheet
        creator={profileCreator}
        open={!!profileCreator}
        onClose={() => setProfileCreator(null)}
        variant="vic"
        mode="select"
        isInvited={profileCreator ? selected.has(Number(profileCreator.id)) : false}
        onInvite={(c) => {
          toggle(c);
          setProfileCreator(null);
        }}
      />
    </AnimatePresence>
  );
}
