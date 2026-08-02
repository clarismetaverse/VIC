import { Check, MapPin } from "lucide-react";
import type { VenueSuggestion } from "@/components/vic/LocalVenueTypes";

type SelectedVenuePreviewCardProps = {
  venue: VenueSuggestion;
  onContinue: () => void;
};

export default function SelectedVenuePreviewCard({ venue, onContinue }: SelectedVenuePreviewCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <div className="relative h-40 w-full bg-neutral-900">
        {venue.coverUrl ? <img src={venue.coverUrl} alt={venue.name} className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        {venue.isNew ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm">
            NEW
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-neutral-900">{venue.name}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {[venue.address, venue.city].filter(Boolean).join(" • ") || "Address pending"}
          </p>
          {venue.about ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{venue.about}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
        >
          <Check className="h-4 w-4" />
          Continue
        </button>
      </div>
    </article>
  );
}
