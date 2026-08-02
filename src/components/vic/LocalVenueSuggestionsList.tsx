import { MapPin, Plus } from "lucide-react";
import type { VenueSuggestion } from "@/components/vic/LocalVenueTypes";

type LocalVenueSuggestionsListProps = {
  items: VenueSuggestion[];
  onSelect: (venue: VenueSuggestion) => void;
  onAddNew: () => void;
};

export default function LocalVenueSuggestionsList({ items, onSelect, onAddNew }: LocalVenueSuggestionsListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <ul className="divide-y divide-neutral-100">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onSelect(item)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-neutral-900">{item.name}</span>
                <span className="block truncate text-xs text-neutral-500">{[item.address, item.city].filter(Boolean).join(" • ") || "Curated venue"}</span>
              </span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={onAddNew} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#7A1E54] hover:bg-[#FAF2F7]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FDEAF2]">
              <Plus className="h-3.5 w-3.5" />
            </span>
            Add a new activity
          </button>
        </li>
      </ul>
    </div>
  );
}
