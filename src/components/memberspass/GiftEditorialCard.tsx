import { motion } from "framer-motion";

export type GiftItem = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  size?: "hero" | "regular";
};

type GiftEditorialCardProps = {
  gift: GiftItem;
  onSelect?: (gift: GiftItem) => void;
};

const cardHeightBySize: Record<NonNullable<GiftItem["size"]>, string> = {
  hero: "min(62vh, 680px)",
  regular: "min(44vh, 480px)",
};

export default function GiftEditorialCard({ gift, onSelect }: GiftEditorialCardProps) {
  const size = gift.size ?? "regular";
  const imageHeight = cardHeightBySize[size];

  return (
    <motion.button
      type="button"
      className="w-full text-left"
      whileTap={{ scale: 0.985, opacity: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect?.(gift)}
    >
      <article className="w-full">
        <div
          className="w-full overflow-hidden rounded-[24px] bg-neutral-200"
          style={{ height: imageHeight }}
        >
          {gift.image ? (
            <img src={gift.image} alt={gift.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-300 via-neutral-200 to-neutral-100" />
          )}
        </div>

        <div className="px-1 pb-1 pt-5">
          <h3
            className="font-medium tracking-[-0.03em] text-[#111111]"
            style={{ fontSize: size === "hero" ? "30px" : "24px", lineHeight: 1.03 }}
          >
            {gift.name}
          </h3>
          <p className="mt-3 text-[13px] uppercase tracking-[0.16em] text-[rgba(17,17,17,0.55)]">
            {gift.subtitle}
          </p>
        </div>
      </article>
    </motion.button>
  );
}
