import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Car, ChevronDown, Check, MapPin, Plane, Ship, UserRound, X } from "lucide-react";

const TRANSPORT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Yes: Check,
  Uber: Car,
  "Private Ferry": Ship,
  "Private Driver": UserRound,
  "Flight tickets": Plane,
};
import { useEffect, useMemo, useState } from "react";
import CreateLocationCoverPicker from "@/components/vic/CreateLocationCoverPicker";
import { TRANSPORT_OPTIONS, type CreateLocationInput, type TransportOption, type VenueSuggestion } from "@/components/vic/LocalVenueTypes";
import type { ClubCity } from "@/services/membersClubs";
import { fetchNewInTown } from "@/services/newInTown";
import type { CreatorLite } from "@/services/creatorSearch";

type AddNewLocationSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateLocationInput) => void;
  presetVenue?: VenueSuggestion | null;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

const CITIES: ClubCity[] = ["Bali", "Dubai", "Milan"];

const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const card = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 } };

export default function AddNewLocationSheet({
  open,
  onClose,
  onCreate,
  presetVenue = null,
  title,
  subtitle,
  ctaLabel,
}: AddNewLocationSheetProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState<ClubCity | "">("");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [about, setAbout] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [activityName, setActivityName] = useState("");
  const [maxGirls, setMaxGirls] = useState<string>("");
  const [transport, setTransport] = useState<TransportOption | "">("");
  const [transportPickerOpen, setTransportPickerOpen] = useState(false);
  const [models, setModels] = useState<CreatorLite[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<number[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const isPreset = Boolean(presetVenue);

  useEffect(() => {
    if (presetVenue) {
      setName(presetVenue.name || "");
      setAddress(presetVenue.address || "");
      setCity((presetVenue.city as ClubCity) || "");
      setCoverUrl(presetVenue.coverUrl || "");
    }
  }, [presetVenue]);

  useEffect(() => {
    if (!open || !isPreset) return;
    let active = true;
    setModelsLoading(true);
    fetchNewInTown()
      .then((list) => {
        if (active) setModels(list);
      })
      .catch(() => {
        if (active) setModels([]);
      })
      .finally(() => {
        if (active) setModelsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, isPreset]);

  const resolvedName = useMemo(() => name.trim() || about.trim() || address.trim(), [name, about, address]);

  const canCreate = useMemo(
    () =>
      isPreset
        ? Boolean(eventDateTime && activityName.trim() && Number(maxGirls) > 0 && transport)
        : Boolean(resolvedName && address.trim() && city),
    [resolvedName, address, city, isPreset, eventDateTime, activityName, maxGirls, transport]
  );

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({
      name: resolvedName,
      address: address.trim(),
      city: city,
      about: about.trim() || undefined,
      eventDateTime: eventDateTime || undefined,
      coverUrl: coverUrl.trim() || undefined,
      coverFile: coverFile ?? undefined,
      activityName: activityName.trim() || undefined,
      maxGirls: maxGirls ? Number(maxGirls) : undefined,
      transport: (transport || undefined) as TransportOption | undefined,
      invitedUserIds: invitedIds.length ? invitedIds : undefined,
    });
    if (!isPreset) {
      setName("");
      setAddress("");
      setCity("");
      setCoverUrl("");
      setCoverFile(null);
    }
    setAbout("");
    setEventDateTime("");
    setActivityName("");
    setMaxGirls("");
    setTransport("");
    setInvitedIds([]);
  };

  const headerTitle = title ?? (isPreset ? "Plan activity" : "Add new location");
  const headerSubtitle =
    subtitle ?? (isPreset ? "Fill in the activity details for the selected venue." : "Create a private venue entry for this plan.");
  const buttonLabel = ctaLabel ?? "Create activity";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center p-4" initial="hidden" animate="visible" exit="exit">
          <motion.button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" variants={backdrop} onClick={onClose} />
          <motion.div variants={card} transition={{ duration: 0.26, ease: "easeOut" }} className="relative z-10 flex h-full w-full flex-col bg-[#FFFEFC]">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
              <div>
                <p className="text-lg font-semibold text-neutral-900">{headerTitle}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{headerSubtitle}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full bg-neutral-100 p-2.5 text-neutral-700" aria-label="Close add location">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mx-auto max-w-lg space-y-4">
                {isPreset && presetVenue ? (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
                    <div className="relative h-32 w-full bg-neutral-900">
                      {presetVenue.coverUrl ? (
                        <img src={presetVenue.coverUrl} alt={presetVenue.name} className="h-full w-full object-cover" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm">
                        VENUE
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-neutral-900">{presetVenue.name}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {[presetVenue.address, presetVenue.city].filter(Boolean).join(" • ") || "Address pending"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                      <span className="mb-2 block text-xs font-semibold text-neutral-500">Title</span>
                      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Private Rooftop by the Marina" className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none" />
                    </label>
                  </>
                )}
                {isPreset && presetVenue ? (
                  <div className="-mx-5">
                    <div className="mb-2 flex items-center justify-between px-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Invite models</p>
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] text-neutral-400">{invitedIds.length} selected</p>
                        {models.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewerIndex(0)}
                            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900"
                          >
                            See all
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {modelsLoading ? (
                      <div className="flex gap-3 overflow-x-auto px-5 pb-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`m-skel-${i}`} className="h-24 w-20 shrink-0 animate-pulse rounded-2xl bg-neutral-200/80" />
                        ))}
                      </div>
                    ) : models.length === 0 ? (
                      <p className="px-5 text-[12px] text-neutral-400">No models available right now.</p>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {models.map((m, idx) => {
                          const id = Number(m.id);
                          const isSelected = invitedIds.includes(id);
                          const avatar = m.Profile_pic?.url;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setViewerIndex(idx)}
                              className="group relative w-20 shrink-0 text-left"
                            >
                              <div className={`relative h-24 w-20 overflow-hidden rounded-2xl border ${isSelected ? "border-neutral-900" : "border-neutral-200"} bg-neutral-100`}>
                                {avatar ? (
                                  <img src={avatar} alt={m.name || "model"} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">{m.name?.[0] ?? "?"}</div>
                                )}
                                {isSelected ? (
                                  <div className="absolute inset-0 bg-neutral-900/35" />
                                ) : null}
                                {isSelected ? (
                                  <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-neutral-900 shadow">
                                    <Check className="h-3 w-3" />
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1.5 truncate text-[11px] font-medium text-neutral-700">{m.name || "Model"}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
                {!isPreset ? (
                  <>
                    <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                      <span className="mb-2 block text-xs font-semibold text-neutral-500">Address</span>
                      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, district" className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none" />
                    </label>

                    {/* City picker dropdown — no free text input */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCityPickerOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 text-left"
                      >
                        <span className="min-w-0">
                          <span className="mb-1 block text-xs font-semibold text-neutral-500">City</span>
                          <span className={`block text-sm font-medium ${city ? "text-neutral-900" : "text-neutral-400"}`}>
                            {city || "Select a city"}
                          </span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${cityPickerOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {cityPickerOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                          >
                            {CITIES.map((c) => (
                              <li key={c}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCity(c);
                                    setCityPickerOpen(false);
                                  }}
                                  className={`flex w-full items-center px-4 py-3 text-sm font-medium transition hover:bg-neutral-50 ${
                                    city === c ? "bg-neutral-50 text-neutral-900" : "text-neutral-700"
                                  }`}
                                >
                                  {c}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : null}

                {isPreset ? (
                  <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                    <span className="mb-2 block text-xs font-semibold text-neutral-500">Activity name</span>
                    <input
                      value={activityName}
                      onChange={(event) => setActivityName(event.target.value)}
                      placeholder="e.g. Sunset rooftop dinner"
                      className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    />
                  </label>
                ) : null}

                <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                  <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                    <Calendar className="h-3.5 w-3.5" /> Date &amp; time
                  </span>
                  <input
                    type="datetime-local"
                    value={eventDateTime}
                    onChange={(event) => setEventDateTime(event.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </label>

                {isPreset ? (
                  <>
                    <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                      <span className="mb-2 block text-xs font-semibold text-neutral-500">Max girls</span>
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={maxGirls}
                        onChange={(event) => setMaxGirls(event.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="e.g. 6"
                        className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      />
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTransportPickerOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 text-left"
                      >
                        <span className="min-w-0">
                          <span className="mb-1 block text-xs font-semibold text-neutral-500">Transport</span>
                          <span className={`flex items-center gap-2 text-sm font-medium ${transport ? "text-neutral-900" : "text-neutral-400"}`}>
                            {transport && TRANSPORT_ICONS[transport] ? (() => { const I = TRANSPORT_ICONS[transport]; return <I className="h-4 w-4 text-neutral-500" />; })() : null}
                            <span>{transport || "Select transport"}</span>
                          </span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${transportPickerOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {transportPickerOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                          >
                            {TRANSPORT_OPTIONS.map((t) => {
                              const Icon = TRANSPORT_ICONS[t];
                              return (
                                <li key={t}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTransport(t);
                                      setTransportPickerOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-neutral-50 ${
                                      transport === t ? "bg-neutral-50 text-neutral-900" : "text-neutral-700"
                                    }`}
                                  >
                                    {Icon ? <Icon className="h-4 w-4 text-neutral-500" /> : null}
                                    <span>{t}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : null}

                <label className="block rounded-2xl border border-neutral-200 bg-white p-3.5">
                  <span className="mb-2 block text-xs font-semibold text-neutral-500">{isPreset ? "Activity details" : "About"}</span>
                  <textarea
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    rows={4}
                    placeholder={isPreset ? "What's the plan? Dress code, vibe, who's invited..." : "A short description of the experience"}
                    className="w-full resize-none bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </label>

                <CreateLocationCoverPicker coverUrl={coverUrl} coverFile={coverFile} onUrlChange={setCoverUrl} onFileChange={setCoverFile} />
                {isPreset ? (
                  <p className="-mt-2 px-1 text-[11px] text-neutral-500">
                    Optional. If left empty, the venue's cover will be used.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Sticky footer button */}
            <div className="border-t border-neutral-100 bg-[#FFFEFC] px-5 py-4">
              <button
                type="button"
                disabled={!canCreate}
                onClick={handleCreate}
                className={`mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold transition ${canCreate ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}
              >
                <MapPin className="h-4 w-4" />
                {buttonLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
      {viewerIndex !== null && models.length > 0 ? (
        <motion.div
          key="models-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black"
        >
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
            <button
              type="button"
              onClick={() => setViewerIndex(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[12px] font-medium text-white/80">{invitedIds.length} selected</p>
          </div>
          <div
            ref={(el) => {
              if (!el || viewerIndex === null) return;
              const child = el.children[viewerIndex] as HTMLElement | undefined;
              if (child && Math.abs(el.scrollLeft - child.offsetLeft) > 4) {
                el.scrollLeft = child.offsetLeft;
              }
            }}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {models.map((m) => {
              const id = Number(m.id);
              const isSelected = invitedIds.includes(id);
              const avatar = m.Profile_pic?.url;
              return (
                <div key={id} className="relative h-full w-screen shrink-0 snap-center">
                  {avatar ? (
                    <img src={avatar} alt={m.name || "model"} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-4xl text-neutral-500">
                      {m.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pb-[calc(env(safe-area-inset-bottom)+28px)] pt-16">
                    <div className="px-6">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{m.Agency || "Model"}</p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">{m.name || "Model"}</h3>
                      {m.bio || m.tagline ? (
                        <p className="mt-2 line-clamp-3 text-sm text-white/80">{m.bio || m.tagline}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setInvitedIds((prev) =>
                            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                          )
                        }
                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition ${
                          isSelected ? "bg-white text-neutral-900" : "bg-white/15 text-white backdrop-blur"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4" /> Invited
                          </>
                        ) : (
                          "Invite"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
