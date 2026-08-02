import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import GiftEditorialCard, { type GiftItem } from "@/components/memberspass/GiftEditorialCard";

type GiftDrawerProps = {
  open: boolean;
  onClose: () => void;
  creatorName?: string;
  gifts: GiftItem[];
  onSelectGift?: (gift: GiftItem) => void;
};

const overlayAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerAnimation = {
  hidden: { y: "100%", opacity: 0.98 },
  visible: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0.98 },
};

export default function GiftDrawer({ open, onClose, creatorName, gifts, onSelectGift }: GiftDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-modal="true"
          role="dialog"
          aria-label={creatorName ? `Send a gift to ${creatorName}` : "Send a gift"}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-[rgba(0,0,0,0.32)] backdrop-blur-[3px]"
            onClick={onClose}
            variants={overlayAnimation}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Close gift drawer"
          />

          <motion.section
            className="absolute bottom-0 left-0 right-0 h-[96dvh] overflow-hidden rounded-t-[28px] bg-[#F7F4EF]"
            variants={drawerAnimation}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-full overflow-y-auto px-5 pb-8 pt-3">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-[rgba(17,17,17,0.2)]" />

              <div className="relative mt-4 border-b border-[rgba(17,17,17,0.08)] pb-6">
                <div>
                  <h2
                    className="font-medium tracking-[-0.03em] text-[#111111]"
                    style={{ fontSize: "32px", lineHeight: 1.02 }}
                  >
                    Send a gift
                  </h2>
                  <p className="mt-2 text-[15px] text-[rgba(17,17,17,0.58)]">A thoughtful gesture</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-0 top-0 rounded-full border border-[rgba(17,17,17,0.08)] p-2 text-[#111111] transition hover:bg-white/60"
                  aria-label="Close gift drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {gifts.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <p className="text-2xl font-medium tracking-[-0.03em] text-[#111111]">
                    Curated gifts are being prepared
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.16em] text-[rgba(17,17,17,0.55)]">
                    Please check back shortly
                  </p>
                </div>
              ) : (
                <div className="mt-7 space-y-7 pb-8">
                  {gifts.map((gift, index) => (
                    <motion.div
                      key={gift.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.34, delay: index * 0.04, ease: "easeOut" }}
                    >
                      <GiftEditorialCard gift={gift} onSelect={onSelectGift} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
