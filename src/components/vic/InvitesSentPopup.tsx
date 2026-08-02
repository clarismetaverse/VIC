import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  tripName: string;
  cityName?: string;
  total: number;
  delta: number;
  avatars: Array<{ id: number; name: string; url: string | null }>;
  hostAvatarUrl?: string | null;
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function InvitesSentPopup({ open, onClose, onDone, tripName, cityName, total, delta, avatars, hostAvatarUrl }: Props) {
  const startValue = useMemo(() => Math.max(0, total - Math.max(0, delta)), [total, delta]);
  const [displayTotal, setDisplayTotal] = useState(startValue);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;

    const from = startValue;
    const to = total;
    setDisplayTotal(from);

    const durationMs = 720;
    const start = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      setDisplayTotal(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, startValue, total, delta]);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    const timeout = window.setTimeout(() => setProgress(100), 20);
    return () => window.clearTimeout(timeout);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] flex items-center justify-center px-5" initial="hidden" animate="visible" exit="exit">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close invites sent popup"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm rounded-[30px] border border-white/15 bg-neutral-950 px-5 pb-5 pt-10 text-center text-white shadow-[0_35px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              {hostAvatarUrl ? (
                <img
                  src={hostAvatarUrl}
                  alt="Host"
                  className="h-[90px] w-[90px] rounded-full border-2 border-neutral-950 object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-neutral-950 bg-white/10 text-sm font-semibold text-white/85 ring-2 ring-white/20">
                  V
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-2 text-white/80 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-2xl font-semibold tracking-[-0.02em]">Invites sent ✨</p>
            <p className="mt-1 truncate text-lg font-semibold text-white/90">{tripName || "Untitled activity"}</p>
            {cityName ? <p className="mt-0.5 truncate text-xs text-white/60">{cityName}</p> : null}

            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center">
                {avatars.slice(0, 4).map((avatar, index) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.08 + index * 0.04 }}
                    className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-950 bg-white/10 text-xs font-semibold uppercase text-white/70"
                    style={{ marginLeft: index === 0 ? 0 : -12 }}
                  >
                    {avatar.url ? <img src={avatar.url} alt={avatar.name} className="h-full w-full object-cover" /> : avatar.name.slice(0, 1)}
                    {index === 0 && delta > 0 ? <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border border-neutral-950 bg-emerald-400" /> : null}
                  </motion.div>
                ))}
                {total > 4 ? (
                  <div className="ml-2 inline-flex h-8 items-center rounded-full border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white/90">+{total - 4}</div>
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline justify-center gap-2">
                  <motion.div
                    key={displayTotal}
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-4xl font-semibold tracking-[-0.02em]"
                  >
                    {displayTotal}
                  </motion.div>

                  <div className="text-sm text-white/70">total invited</div>
                </div>

                {delta > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
                    className="mt-2 inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90"
                  >
                    +{delta} added
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <div className="relative h-9 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6A88] to-[#FF99AC]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-white/90">
                  <Check className="h-4 w-4 text-white/90" />
                  Invites delivered ✨
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onDone}
              className="mt-5 h-11 w-full rounded-full bg-white text-sm font-semibold text-neutral-950"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
