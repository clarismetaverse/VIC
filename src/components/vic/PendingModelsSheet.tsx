import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Instagram, Music2, Users, X } from "lucide-react";
import type { ActivityInvitedItem } from "@/services/activityInvited";

const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=65";

const normalizeHandle = (raw: string | undefined, domain: "instagram.com" | "tiktok.com") => {
  const trimmed = raw?.trim();
  if (!trimmed) return "";
  const escaped = domain.replace(".", "\\.");
  const match = trimmed.match(new RegExp(`${escaped}/@?([A-Za-z0-9._]+)`, "i"));
  const value = match?.[1] ?? trimmed;
  return value.replace(/^@+/, "").replace(/\/+$/, "");
};


type Props = {
  open: boolean;
  items: ActivityInvitedItem[];
  onClose: () => void;
  onSelect: (item: ActivityInvitedItem) => void;
};

export default function PendingModelsSheet({ open, items, onClose, onSelect }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Pending models"
            data-testid="pending-models-sheet"
            className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-neutral-900">Pending models</h2>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                  {items.length} awaiting your decision
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close pending models"
                className="rounded-full border border-neutral-200 p-2 text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-10 text-center">
                  <Users className="h-5 w-5 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-800">No pending applications</p>
                  <p className="text-xs text-neutral-500">
                    New applications to this activity will appear here for review.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => {
                    const name = item._user_turbo?.name || "Model";
                    const ig = normalizeHandle(item._user_turbo?.IG_account, "instagram.com");
                    const tiktok = normalizeHandle(item._user_turbo?.Tiktok_account, "tiktok.com");
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(item)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-left transition hover:border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        >
                          <img
                            src={item._user_turbo?.Profile_pic?.url || FALLBACK_AVATAR}
                            alt={name}
                            loading="lazy"
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-neutral-900">{name}</span>
                            {ig && (
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                                <Instagram className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">@{ig}</span>
                              </span>
                            )}
                            {tiktok && (
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                                <Music2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">@{tiktok}</span>
                              </span>
                            )}
                          </span>
                          <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Pending
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
