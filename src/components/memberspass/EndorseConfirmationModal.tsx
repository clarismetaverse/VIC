import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

type EndorseConfirmationModalProps = {
  open: boolean;
  creatorName?: string;
  creatorImage?: string;
  onClose: () => void;
};

export default function EndorseConfirmationModal({
  open,
  creatorName,
  creatorImage,
  onClose,
}: EndorseConfirmationModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* Backdrop: blur + subtle dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/12 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 flex w-full max-w-[320px] flex-col items-center rounded-[24px] bg-[#FDFCFA] px-7 pb-7 pt-8 text-center"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Seal icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EDE8]">
              <Check className="h-6 w-6 text-neutral-800" strokeWidth={2.2} />
            </div>

            {/* Optional avatar */}
            {creatorImage && (
              <motion.img
                src={creatorImage}
                alt={creatorName || ""}
                className="mb-4 h-16 w-16 rounded-full object-cover ring-2 ring-[#F0EDE8]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: 0.06 }}
              />
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-neutral-900">
              You endorsed {creatorName || "this creator"}
            </h3>

            {/* Subtitle */}
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Your support helps her move forward in the community.
            </p>

            {/* CTA */}
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
              onClick={onClose}
            >
              Continue exploring
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
