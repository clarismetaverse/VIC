import { useState } from "react";
import { Lock, User } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";

type CreatorCardProps = {
  creator: CreatorLite;
  locked?: boolean;
  variant?: "default" | "vic" | "vic-search";
  size?: "candidate" | "normal" | "large";
  badge?: string;
  interests?: string[];
  mode?: "default" | "select";
  isInvited?: boolean;
  onInvite?: (creator: CreatorLite) => void;
  profileType?: "creator" | "candidate";
  profileSource?: "default" | "vic" | "claris";
};

export default function CreatorCard({
  creator,
  locked,
  variant = "default",
  size = "normal",
  badge,
  interests,
  mode = "default",
  isInvited = false,
  onInvite,
  profileType = "creator",
  profileSource = "default",
}: CreatorCardProps) {
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [endorsed, setEndorsed] = useState(false);

  const img = getCreatorAvatar(creator);
  const isUgcReady = true;
  const isUgcFirst = true;
  const isVic = variant === "vic";
  const isVicSearch = variant === "vic-search";
  const isVicSurface = isVic || isVicSearch;
  const cardSizeClasses =
    isVic && size === "candidate"
      ? "h-[300px] rounded-[22px] shadow-[0_10px_28px_rgba(0,0,0,0.10)]"
      : isVic && size === "large"
        ? "h-[330px] rounded-[20px] shadow-[0_6px_18px_rgba(0,0,0,0.07)]"
        : isVic
          ? "h-[230px] rounded-[20px] shadow-[0_6px_18px_rgba(0,0,0,0.07)]"
          : isVicSearch
            ? "h-[308px] rounded-3xl"
            : "h-[348px] rounded-3xl";

  const displayName = formatCreatorDisplayName(creator.name);
  const bioLine = getCreatorBio(creator);
  const interestTags = getCreatorInterestTags(creator, interests);

  const isCandidate = isVic && size === "candidate";

  return (
    <div className="relative w-full shrink-0 snap-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative w-full overflow-hidden text-left shadow-[0_6px_18px_rgba(0,0,0,0.07)] duration-200 ease-out hover:scale-[1.01] active:scale-[0.98] ${cardSizeClasses} ${
          endorsed
            ? "scale-[0.98] border border-neutral-200/60 transition-all duration-300"
            : "transition-transform"
        }`}
        style={endorsed ? { filter: "grayscale(20%) brightness(0.95)" } : undefined}
      >
        <div className="relative h-full w-full">
          <img
            src={img}
            alt={creator.name || "Creator"}
            className="h-full w-full object-cover"
          />

          <div
            className={`absolute inset-0 ${
              isVicSearch
                ? "bg-gradient-to-t from-black/82 via-black/28 via-[58%] to-transparent"
                : isVic
                  ? "bg-gradient-to-t from-black/55 via-black/20 to-transparent"
                  : "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            }`}
          />

          {/* Soft endorsed overlay */}
          {endorsed && (
            <div className="pointer-events-none absolute inset-0 bg-[rgba(245,245,245,0.40)] transition-opacity duration-300" />
          )}

          {isVicSearch && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.22)_38%,rgba(0,0,0,0)_78%)] blur-xl" />
          )}

          {locked && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-neutral-900">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          )}

          {badge && !locked && (
            <span
              className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur ${
                badge.trim().toUpperCase() === "PENDING"
                  ? "bg-amber-400/60 text-amber-950"
                  : "bg-white/90 text-neutral-800"
              }`}
            >
              {badge}
            </span>
          )}


          {mode === "select" && isInvited && (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
              Invited ✓
            </span>
          )}

          {isCandidate && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm transition-all duration-300">
              {endorsed ? (
                <span className="text-[10px] font-medium text-white/90">
                  Endorsed ✓
                </span>
              ) : creator.endorsments && creator.endorsments.length > 0 ? (
                <>
                  <div className="flex -space-x-1">
                    {creator.endorsments.slice(0, 3).map((e, i) => (
                      <img
                        key={e.id ?? i}
                        src={e.Picture?.url || CREATOR_PLACEHOLDER_IMAGE}
                        alt={e.Name || "VIC"}
                        className="h-4 w-4 rounded-full border border-white/60 object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-white/90">
                    endorsed by {creator.endorsments[0]?.Name || "VIC"}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-medium italic text-white/70">
                  awaiting endorsement
                </span>
              )}
            </div>
          )}

          <div
            className={`absolute left-0 right-0 ${
              isVicSearch ? "bottom-0 p-4 pb-3" : "bottom-0 p-4 pb-[14px]"
            }`}
          >
            <div className="text-left">
              <div className="relative inline-block">
                {isVicSearch && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-[-10px] top-1/2 h-[76px] w-[220px] -translate-y-1/2 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0)_76%)] blur-2xl"
                  />
                )}

                <p
                  className={`relative ${
                    isVicSearch
                      ? "text-[29px] font-semibold leading-[0.94] tracking-[-0.035em] text-[#FFF8F0] drop-shadow-[0_2px_14px_rgba(0,0,0,0.38)]"
                      : "mb-1 text-[26px] font-semibold leading-tight text-white"
                  }`}
                >
                  {isVicSurface ? displayName : creator.name || "Unnamed creator"}
                </p>
              </div>





              {isVic && (
                <div className="flex items-end justify-between">
                  <p className={`text-xs ${endorsed ? "text-white/50" : "text-white/75"} transition-opacity duration-300`}>
                    {creator.nationality?.trim() || creator.tagline?.trim() || "Available locally"}
                  </p>
                  {creator.Agency?.trim() && (
                    <p className={`text-[11px] font-medium tracking-wide ${endorsed ? "text-white/35" : "text-white/55"} transition-opacity duration-300`}>
                      {creator.Agency.trim()}
                    </p>
                  )}
                </div>
              )}

              {!isVicSurface && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isUgcReady && (
                    <span className="rounded-full bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900">
                      UGC-ready
                    </span>
                  )}
                  {isUgcFirst && (
                    <span className="rounded-full bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900">
                      UGC first
                    </span>
                  )}
                </div>
              )}

              {isVicSearch && interestTags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                  {interestTags.map((interest) => (
                    <span
                      key={`${creator.id}-${interest}`}
                      className="text-[13px] font-normal tracking-[0.025em] text-[#F5DEB3] drop-shadow-[0_1px_8px_rgba(0,0,0,0.28)]"
                    >
                      #{normalizeInterestTag(interest)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isVicSearch && bioLine && (
          <div className="space-y-2 bg-white px-4 py-3.5">
            <p className="truncate text-[12.5px] font-normal italic leading-relaxed text-neutral-400">
              {bioLine}
            </p>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className={`absolute right-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-95 ${
          isVicSearch && bioLine ? "bottom-[68px]" : "bottom-3"
        }`}
      >
        <User className="h-3.5 w-3.5" />
        View profile
      </button>




      <CreatorProfileSheet
        creator={creator}
        open={open}
        onClose={() => setOpen(false)}
        locked={locked}
        variant={variant}
        mode={mode}
        isInvited={isInvited}
        onInvite={(selectedCreator) => {
          onInvite?.(selectedCreator);
          setOpen(false);
        }}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((prev) => !prev)}
        profileType={profileType}
        profileSource={profileSource}
        onEndorsed={() => setEndorsed(true)}
      />
    </div>
  );
}



const CREATOR_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200' viewBox='0 0 900 1200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%' stop-color='%23F3F4F6'/%3E%3Cstop offset='100%' stop-color='%23E5E7EB'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='1200' fill='url(%23g)'/%3E%3Ccircle cx='450' cy='420' r='150' fill='%23D1D5DB'/%3E%3Crect x='200' y='620' width='500' height='300' rx='150' fill='%23D1D5DB'/%3E%3C/svg%3E";

function getCreatorInterestTags(creator: CreatorLite, interests?: string[]) {
  if (interests && interests.length > 0) return interests;

  const raw = creator.user_interest_topics_turbo_id;
  const topics = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return topics
    .map((topic: any) => {
      if (typeof topic === "object" && topic !== null && topic.interest_topics) {
        return topic.interest_topics;
      }
      return null;
    })
    .filter((label): label is string => !!label);
}
function getCreatorBio(creator: CreatorLite): string {
  return (creator.bio || "").trim();
}

function getCreatorAvatar(creator: CreatorLite): string {
  const avatarUrl = creator.Profile_pic?.url?.trim();
  return avatarUrl || CREATOR_PLACEHOLDER_IMAGE;
}

function formatCreatorDisplayName(name?: string) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "Unnamed creator";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const surnameInitial = parts[1]?.charAt(0).toUpperCase();

  return `${firstName} ${surnameInitial}.`;
}

function normalizeInterestTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/\s+/g, "");
}
