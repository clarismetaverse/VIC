import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CreatorCard from "@/components/memberspass/CreatorCard";
import type { CreatorLite } from "@/services/creatorSearch";

type InviteModelsSheetProps = {
  open: boolean;
  onClose: () => void;
  creators: CreatorLite[];
};

export default function InviteModelsSheet({ open, onClose, creators }: InviteModelsSheetProps) {
  const [invitedIds, setInvitedIds] = useState<number[]>([]);

  const invitedCount = invitedIds.length;
  const invitedSet = useMemo(() => new Set(invitedIds), [invitedIds]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />

          <motion.div
            className="relative z-10 h-[92dvh] w-full max-w-md overflow-hidden rounded-t-3xl bg-[#FAFAFA] shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Invite models</p>
                  <p className="text-xs text-neutral-500">{invitedCount} invited</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-700"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto px-4 pb-10 pt-4">
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  variant="vic"
                  mode="select"
                  isInvited={invitedSet.has(creator.id)}
                  onInvite={(selectedCreator) => {
                    setInvitedIds((prev) =>
                      prev.includes(selectedCreator.id) ? prev : [...prev, selectedCreator.id]
                    );
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
