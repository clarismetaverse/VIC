import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, Clock, Users, X, Sparkles, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CreatorLite } from "@/services/creatorSearch";

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  tablePreviewLabel: string;
  coverUrl?: string | null;
  dateLabel?: string;
  timeLabel?: string;
  guests: number;
  invited: CreatorLite[];
  onRemoveInvite?: (creatorId: number) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheet = {
  hidden: { y: "10%", opacity: 0, scale: 0.985, filter: "blur(10px)" },
  visible: { y: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { y: "10%", opacity: 0, scale: 0.99, filter: "blur(10px)" },
};

const expandMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export default function ConfirmInvitesModal({
  open,
  onClose,
  onBack,
  tablePreviewLabel,
  coverUrl,
  dateLabel,
  timeLabel,
  guests,
  invited,
  onRemoveInvite,
  onConfirm,
  loading = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  const invitedCount = invited.length;

  const subtitle = useMemo(() => {
    const bits = [];
    if (dateLabel) bits.push(dateLabel);
    if (timeLabel) bits.push(timeLabel);
    if (guests) bits.push(`${guests} pax`);
    return bits.length ? bits.join(" • ") : "Details pending";
  }, [dateLabel, timeLabel, guests]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center" initial="hidden" animate="visible" exit="exit">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            variants={sheet}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[30px] border border-white/10 bg-neutral-950 text-white shadow-[0_50px_140px_rgba(0,0,0,0.70)]"
          >
            <div className="pointer-events-none absolute -top-24 right-[-70px] h-64 w-64 rounded-full bg-[#FF385C]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-[-70px] h-64 w-64 rounded-full bg-[#7A1E54]/28 blur-3xl" />

            <div className="relative px-5 pb-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/85">
                    <Sparkles className="h-3.5 w-3.5" />
                    Final review
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Confirm invites</p>
                  <p className="mt-1 text-xs text-white/65">For {tablePreviewLabel}</p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/12 bg-white/5 p-2 text-white/80 hover:bg-white/10 active:scale-[0.98]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/10 via-white/6 to-white/4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                <div className="flex gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">{tablePreviewLabel}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                        <Calendar className="h-3.5 w-3.5" />
                        {dateLabel || "Date TBD"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                        <Clock className="h-3.5 w-3.5" />
                        {timeLabel || "Time TBD"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                        <Users className="h-3.5 w-3.5" />
                        {guests} pax
                      </span>
                    </div>

                    <p className="mt-3 text-[11px] text-white/55">
                      Table details (TBD) • This is an activity request, not a confirmed reservation.
                    </p>
                  </div>

                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/10">
                    {coverUrl ? (
                      <>
                        <img src={coverUrl} alt={tablePreviewLabel} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                </div>

                <div className="h-px w-full bg-white/8" />

                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-xs font-semibold text-white/75">Plan preview</p>
                  <p className="text-xs text-white/55">{subtitle}</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/7 active:scale-[0.995]"
                >
                  <span className="inline-flex items-center gap-3">
                    <span>Invited</span>
                    <span className="flex items-center -space-x-2">
                      {invited.slice(0, 5).map((creator) => {
                        const avatar = creator.Profile_pic?.url;
                        return (
                          <div
                            key={creator.id}
                            className="h-7 w-7 overflow-hidden rounded-full border-2 border-neutral-950 bg-white/10"
                          >
                            {avatar ? (
                              <img src={avatar} alt={creator.name || ""} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/70">
                                {(creator.name || "C").slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {invitedCount > 5 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-950 bg-white/15 text-[10px] font-semibold text-white/80">
                          +{invitedCount - 5}
                        </div>
                      )}
                    </span>
                  </span>
                  {expanded ? <ChevronUp className="h-4 w-4 text-white/70" /> : <ChevronDown className="h-4 w-4 text-white/70" />}
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      {...expandMotion}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    >
                      <div className="max-h-52 overflow-y-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="space-y-2">
                          {invited.map((creator) => {
                            const creatorId = Number(creator.id);
                            const username = creator.IG_account || creator.Tiktok_account || "";
                            const avatar = creator.Profile_pic?.url;

                            return (
                              <div
                                key={creatorId}
                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/40 px-3 py-2"
                              >
                                <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                                  {avatar ? (
                                    <img src={avatar} alt={creator.name || "Creator"} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                                      {(creator.name || "C").slice(0, 1).toUpperCase()}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white/90">{creator.name || "Creator"}</p>
                                </div>

                                {onRemoveInvite ? (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveInvite(creatorId)}
                                    className="rounded-full border border-white/12 bg-white/5 p-2 text-white/70 hover:bg-white/10 active:scale-[0.98]"
                                    aria-label={`Remove ${creator.name || "creator"}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-200/12 to-amber-200/6 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-50">
                  <AlertTriangle className="h-4 w-4" />
                  Table is not booked yet
                </p>
                <p className="mt-1 text-xs text-amber-100/75">
                  Invites create an activity request. VIC confirms availability and books the table once the activity is approved.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="h-11 flex-1 rounded-full border border-white/12 bg-white/5 text-sm font-semibold text-white/85 hover:bg-white/10 active:scale-[0.99]"
                >
                  Back
                </button>

                <motion.button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading || invitedCount === 0}
                  whileTap={{ scale: loading || invitedCount === 0 ? 1 : 0.99 }}
                  className={`relative h-11 flex-1 overflow-hidden rounded-full text-sm font-semibold ${
                    loading || invitedCount === 0 ? "bg-white/20 text-white/55" : "text-white"
                  }`}
                  style={
                    loading || invitedCount === 0
                      ? undefined
                      : {
                          background:
                            "radial-gradient(900px 220px at 25% 0%, rgba(255,255,255,0.25), rgba(255,255,255,0.0) 55%), linear-gradient(135deg, #FF385C 0%, #C81E5A 45%, #7A1E54 100%)",
                        }
                  }
                >
                  <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/18 blur-2xl" />
                  <span className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/12 blur-2xl" />

                  <span className="relative inline-flex items-center justify-center gap-2">
                    {loading ? (
                      "Creating…"
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-white/95" />
                        Create activity
                      </>
                    )}
                  </span>
                </motion.button>
              </div>

              <p className="mt-3 text-center text-[11px] text-white/50">Next: VIC approval → table booking confirmation.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
