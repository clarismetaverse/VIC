import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Gift, Heart, Instagram, Lock, Music2, Share2, Ticket, X } from "lucide-react";
import { useState } from "react";
import type { CreatorLite } from "@/services/creatorSearch";
import InviteExperienceSheet from "@/components/vic/InviteExperienceSheet";
import GiftDrawer from "@/components/memberspass/GiftDrawer";
import type { GiftItem } from "@/components/memberspass/GiftEditorialCard";
import EndorseConfirmationModal from "@/components/memberspass/EndorseConfirmationModal";
import { endorseCreator } from "@/services/endorse";
import { useAuth } from "@/hooks/useAuth";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheet = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

function buildSocialLink(platform: "instagram" | "tiktok", handle?: string) {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  const clean = handle.replace("@", "");
  if (platform === "instagram") {
    return `https://instagram.com/${clean}`;
  }
  return `https://tiktok.com/@${clean}`;
}

type CreatorProfile = CreatorLite & { bio?: string };

type CreatorProfileSheetProps = {
  creator: CreatorProfile | null;
  open: boolean;
  locked?: boolean;
  variant?: "default" | "vic" | "vic-search";
  mode?: "default" | "select";
  isInvited?: boolean;
  onInvite?: (creator: CreatorLite) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  profileType?: "creator" | "candidate";
  profileSource?: "default" | "vic" | "claris";
  invitationStatus?: "accepted" | "invited" | "pending" | "rejected" | null;
  onDecision?: (decision: "approve" | "reject") => void;
  decisionPending?: boolean;
  onClose: () => void;
  onEndorsed?: () => void;
};

export default function CreatorProfileSheet({
  creator,
  open,
  locked,
  variant = "default",
  mode = "default",
  isInvited = false,
  onInvite,
  isFavorite = false,
  onToggleFavorite,
  profileType = "creator",
  profileSource = "default",
  invitationStatus = null,
  onDecision,
  decisionPending = false,
  onClose,
  onEndorsed,
}: CreatorProfileSheetProps) {
  const isPendingInvitation = invitationStatus === "invited" || invitationStatus === "pending";
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [isEndorsing, setIsEndorsing] = useState(false);
  const [endorsed, setEndorsed] = useState(false);
  const [endorseModalOpen, setEndorseModalOpen] = useState(false);
  const instagramUrl = buildSocialLink("instagram", creator?.IG_account);
  const tiktokUrl = buildSocialLink("tiktok", creator?.Tiktok_account);
  const hasTikTok = Boolean(creator?.Tiktok_account);
  const platformLabel = hasTikTok ? "TikTok creator" : "Instagram creator";
  const isVic = variant === "vic";
  const isSelectMode = mode === "select";
  const shouldShowCandidateActions = isVic && profileType === "candidate";
  const footerPrimaryClassName =
    isInvited && isSelectMode
      ? "flex-1 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 active:scale-[0.98] transition-transform"
      : isInvited
        ? "flex-1 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white opacity-95"
        : locked
          ? "flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-400"
          : "flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform";

  const handleToggleFavorite = onToggleFavorite ?? (() => {});
  const heroImage = creator?.Profile_pic?.url;
  const displayRole = profileType === "candidate" ? "Candidate" : "Creator";
  const bioText = creator?.bio?.trim() || "";
  const rawInterests = creator?.user_interest_topics_turbo_id;
  const interests = (Array.isArray(rawInterests) ? rawInterests : rawInterests ? [rawInterests] : [])
    .map((topic: any) => (typeof topic === "object" && topic ? topic.interest_topics : undefined))
    .filter((label): label is string => Boolean(label && label.trim()));
  const galleryImages = Array.from({ length: 6 }, (_, index) => ({
    id: `gallery-${index}`,
    src: heroImage,
  }));
  const gifts: GiftItem[] = [
    {
      id: "fragrance",
      name: "Signature Fragrance",
      subtitle: "Curated scent",
      image: "/images/gifts/fragrance.jpg",
      size: "hero",
    },
    {
      id: "jewelry",
      name: "Delicate Jewelry",
      subtitle: "Fine detail",
      image: "/images/gifts/jewelry.jpg",
      size: "regular",
    },
    {
      id: "silk-accessory",
      name: "Silk Accessory",
      subtitle: "Timeless piece",
      image: "/images/gifts/silk-accessory.jpg",
      size: "hero",
    },
    {
      id: "chocolate",
      name: "Fine Chocolate",
      subtitle: "Small indulgence",
      image: "/images/gifts/chocolate.jpg",
      size: "regular",
    },
    {
      id: "intimates",
      name: "Silk Intimates",
      subtitle: "Private luxury",
      image: "/images/gifts/intimates.jpg",
      size: "hero",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close creator profile"
          />
          <motion.div
            className={
              isVic
                ? "relative z-10 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:max-w-md sm:rounded-t-3xl"
                : "relative z-10 w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl"
            }
            variants={sheet}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            {isVic ? (
              <>
                <div className="flex-1 overflow-y-auto bg-[#FAFAFA] pb-32">
                  <div className="relative h-[60vh] w-full overflow-hidden">
                    {heroImage ? (
                      <motion.img
                        src={heroImage}
                        alt={creator?.name || "Creator"}
                        className="h-full w-full object-cover"
                        initial={{ scale: 1.03 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ) : (
                      <motion.div
                        className="h-full w-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-white"
                        initial={{ scale: 1.03 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute left-5 top-4 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                        {displayRole}
                      </span>
                      {invitationStatus && (
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                            invitationStatus === "accepted"
                              ? "bg-emerald-500/95 text-white"
                              : invitationStatus === "rejected"
                                ? "bg-red-500/95 text-white"
                                : "bg-amber-400/95 text-neutral-900"
                          }`}
                        >
                          {invitationStatus === "accepted"
                            ? "Accepted"
                            : invitationStatus === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </span>
                      )}
                    </div>
                    <div className="absolute right-4 top-4 flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-white/90 p-2 text-neutral-900 shadow-md transition hover:scale-105 active:scale-95"
                        onClick={onClose}
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-6 left-5 right-5">
                      <p className="text-3xl font-semibold text-white">
                        {creator?.name || "Creator profile"}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-6">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">Bio</h3>
                      {bioText ? (
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{bioText}</p>
                      ) : (
                        <p className="mt-2 text-sm text-neutral-400">No bio available yet.</p>
                      )}
                    </div>

                    {(instagramUrl || tiktokUrl) && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {instagramUrl && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm"
                            onClick={() => window.open(instagramUrl, "_blank", "noopener,noreferrer")}
                          >
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </button>
                        )}
                        {tiktokUrl && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm"
                            onClick={() => window.open(tiktokUrl, "_blank", "noopener,noreferrer")}
                          >
                            <Music2 className="h-4 w-4" />
                            TikTok
                          </button>
                        )}
                      </div>
                    )}

                    {locked && (
                      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                          <Lock className="h-3 w-3" />
                          Premium list
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">
                          This creator is in the premium list. Unlock to access full details and invites.
                        </p>
                        <button
                          type="button"
                          className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Unlock
                        </button>
                      </div>
                    )}

                    {interests.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-neutral-900">Interests</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {interests.map((interest) => (
                            <span
                              key={interest}
                              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}


                    {/* <div className="mt-6">
                      <h3 className="text-sm font-semibold text-neutral-900">Gallery</h3>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {galleryImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-200"
                          >
                            {image.src ? (
                              <img src={image.src} alt="Gallery item" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-neutral-300 via-neutral-200 to-neutral-100" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div> */}


                    <div className="mt-6 space-y-3">
                      {/* <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm"
                        onClick={() => window.alert("Coming soon")}
                      >
                        <Bookmark className="h-4 w-4" />
                        Save to list
                      </button> */}
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm"
                        onClick={() => window.alert("Coming soon")}
                      >
                        <Share2 className="h-4 w-4" />
                        Share profile
                      </button>
                    </div>
                  </div>
                </div>

                {!invitationStatus && (
                <div className="flex gap-3 border-t border-neutral-200 bg-white px-5 py-4">
                  {shouldShowCandidateActions ? (
                    <>
                      <button
                        type="button"
                        disabled={isEndorsing || endorsed}
                        className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform ${
                          endorsed
                            ? "bg-emerald-500 text-white opacity-95"
                            : isEndorsing
                              ? "bg-neutral-400 text-white"
                              : "bg-neutral-900 text-white"
                        }`}
                        onClick={async () => {
                          if (!creator || !user?.id) return;
                          setIsEndorsing(true);
                          try {
                            await endorseCreator(creator.id, user.id);
                            setEndorsed(true);
                            onEndorsed?.();
                            setTimeout(() => setEndorseModalOpen(true), 150);
                          } catch (err) {
                            console.error("Endorse failed", err);
                          } finally {
                            setIsEndorsing(false);
                          }
                        }}
                      >
                        {endorsed ? "Endorsed ✓" : isEndorsing ? "Endorsing…" : "Endorse"}
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm active:scale-[0.98] transition-transform"
                        onClick={handleToggleFavorite}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                          Save
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      {!isSelectMode && (
                        <button
                          type="button"
                          className="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                          onClick={() => setIsGiftDrawerOpen(true)}
                        >
                          <span className="inline-flex items-center justify-center gap-2">
                            <Gift className="h-4 w-4" />
                            Gift
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={Boolean(locked) || (Boolean(isInvited) && !isSelectMode)}
                        className={footerPrimaryClassName}
                        onClick={() => {
                          if (locked) return;

                          if (isSelectMode) {
                            if (creator) onInvite?.(creator);
                            return;
                          }

                          setInviteOpen(true);
                        }}
                      >
                        {isInvited && isSelectMode ? "Deselect" : isInvited ? "Invited ✓" : (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Ticket className="h-4 w-4" />
                            Invite
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
                )}
                {invitationStatus && (
                  <div className="border-t border-neutral-200 bg-white px-5 py-4">
                    {isPendingInvitation && onDecision ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={decisionPending}
                          onClick={() => onDecision("reject")}
                          className="flex-1 rounded-full border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors disabled:opacity-50"
                        >
                          {decisionPending ? "Please wait…" : "Reject"}
                        </button>
                        <button
                          type="button"
                          disabled={decisionPending}
                          onClick={() => onDecision("approve")}
                          className="flex-1 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        >
                          {decisionPending ? "Please wait…" : "Approve"}
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`w-full rounded-full px-4 py-3 text-center text-sm font-semibold ${
                          invitationStatus === "accepted"
                            ? "bg-emerald-500 text-white"
                            : invitationStatus === "rejected"
                              ? "bg-red-500 text-white"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {invitationStatus === "accepted"
                          ? "Invitation accepted"
                          : invitationStatus === "rejected"
                            ? "Invitation rejected"
                            : "Invitation pending"}
                      </div>
                    )}
                  </div>
                )}

              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Creator profile</p>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {creator?.name || "Creator profile"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-neutral-200 p-2 text-neutral-500 hover:text-neutral-800"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  {creator?.Profile_pic?.url ? (
                    <img
                      src={creator.Profile_pic.url}
                      alt={creator?.name || "Creator"}
                      className="h-20 w-20 rounded-3xl object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-50" />
                  )}
                  <div>
                    <p className="text-base font-semibold text-neutral-900">
                      {creator?.name || "Unnamed creator"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                      <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium">UGC-ready</span>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium">UGC first</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F4] px-2 py-1 font-medium text-[#FF5A7A]">
                        {hasTikTok ? <Music2 className="h-3 w-3" /> : <Instagram className="h-3 w-3" />}
                        {platformLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-neutral-900">About / highlights</h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    UGC-first creator focused on lifestyle campaigns, venue launches, and authentic short form videos.
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  {instagramUrl && (
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => window.open(instagramUrl, "_blank")}
                    >
                      <Instagram className="h-4 w-4" />
                      Open Instagram
                    </button>
                  )}
                  {tiktokUrl && (
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => window.open(tiktokUrl, "_blank")}
                    >
                      <Music2 className="h-4 w-4" />
                      Open TikTok
                    </button>
                  )}
                </div>

                {locked && (
                  <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                      <Lock className="h-3 w-3" />
                      Premium list
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      This creator is in the premium list. Unlock to access full details and invites.
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Unlock
                    </button>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => console.log("Invite creator", creator)}
                  >
                    Invite
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700"
                    onClick={() => console.log("Request collaboration", creator)}
                  >
                    Request collaboration
                  </button>
                </div>
              </>
            )}
          </motion.div>
          {!isSelectMode && (
            <InviteExperienceSheet
              open={inviteOpen}
              onClose={() => setInviteOpen(false)}
              creator={creator}
            />
          )}
          <GiftDrawer
            open={isGiftDrawerOpen}
            onClose={() => setIsGiftDrawerOpen(false)}
            creatorName={creator?.name}
            gifts={gifts}
            onSelectGift={(gift) => window.alert(`${gift.name} details coming soon`)}
          />
          <EndorseConfirmationModal
            open={endorseModalOpen}
            creatorName={creator?.name}
            creatorImage={creator?.Profile_pic?.url}
            onClose={() => {
              setEndorseModalOpen(false);
              onClose();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
