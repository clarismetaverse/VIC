import { useId } from "react";
import { Search, X } from "lucide-react";

export interface TagOption {
  id: number;
  label: string;
}

export const BALI_NEIGHBORHOODS: TagOption[] = [
  { id: 25, label: "Kerobokan" },
  { id: 27, label: "Tibubeneng" },
  { id: 28, label: "Canggu" },
  { id: 29, label: "Ubud" },
  { id: 30, label: "Uluwatu" },
  { id: 31, label: "Jimbaran" },
  { id: 32, label: "Ungasan" },
  { id: 33, label: "Mengwi" },
  { id: 34, label: "Legian" },
  { id: 35, label: "Kuta" },
  { id: 36, label: "Nusa Penida" },
  { id: 37, label: "Sanur" },
  { id: 38, label: "Seminyak" },
  { id: 39, label: "Denpasar" },
];

export const VENUE_TYPES: TagOption[] = [
  { id: 1, label: "Restaurant" },
  { id: 2, label: "Beauty" },
  { id: 3, label: "Café" },
  { id: 4, label: "Beach Club" },
  { id: 11, label: "Brunch" },
  { id: 21, label: "Private Event" },
  { id: 24, label: "Night Club" },
  { id: 40, label: "Run Club" },
  { id: 41, label: "Activity" },
  { id: 44, label: "Dinner" },
  { id: 45, label: "Lunch" },
  { id: 56, label: "Lifestyle" },
];

export interface HangoutFilterState {
  neighborhoodId: number | null;
  venueTypeId: number | null;
  keyword: string;
}

export const EMPTY_HANGOUT_FILTERS: HangoutFilterState = {
  neighborhoodId: null,
  venueTypeId: null,
  keyword: "",
};

export function hangoutFiltersActive(f: HangoutFilterState): boolean {
  return f.neighborhoodId !== null || f.venueTypeId !== null || f.keyword.trim().length > 0;
}

export function hangoutTagIds(f: HangoutFilterState): number[] {
  return [f.neighborhoodId, f.venueTypeId].filter((id): id is number => typeof id === "number");
}

interface Props {
  value: HangoutFilterState;
  onChange: (next: HangoutFilterState) => void;
  showNeighborhoods?: boolean;
}

const selectClass =
  "w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 outline-none transition-colors focus:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-300";

export default function HangoutFilters({ value, onChange, showNeighborhoods = true }: Props) {
  const baseId = useId();
  const neighborhoodId = `${baseId}-hood`;
  const venueId = `${baseId}-venue`;
  const keywordId = `${baseId}-keyword`;

  const active = hangoutFiltersActive(value);
  const hoodLabel = BALI_NEIGHBORHOODS.find((o) => o.id === value.neighborhoodId)?.label;
  const venueLabel = VENUE_TYPES.find((o) => o.id === value.venueTypeId)?.label;
  const keyword = value.keyword.trim();

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-3">
      <div className={`grid gap-2 ${showNeighborhoods ? "grid-cols-2" : "grid-cols-1"}`}>
        {showNeighborhoods && (
          <div className="space-y-1">
            <label htmlFor={neighborhoodId} className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
              Neighborhood
            </label>
            <select
              id={neighborhoodId}
              className={selectClass}
              value={value.neighborhoodId ?? ""}
              onChange={(e) =>
                onChange({ ...value, neighborhoodId: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">All neighborhoods</option>
              {BALI_NEIGHBORHOODS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor={venueId} className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            Venue type
          </label>
          <select
            id={venueId}
            className={selectClass}
            value={value.venueTypeId ?? ""}
            onChange={(e) =>
              onChange({ ...value, venueTypeId: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">All venue types</option>
            {VENUE_TYPES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor={keywordId} className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          Cuisine or keyword
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            id={keywordId}
            type="search"
            value={value.keyword}
            onChange={(e) => onChange({ ...value, keyword: e.target.value })}
            placeholder="Cuisine or keyword (sushi, Italian…)"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-300"
          />
        </div>
      </div>

      <p className="px-0.5 text-[10px] leading-relaxed text-neutral-400">
        Results match any selected tag, so picking both a neighborhood and a venue type broadens what you see.
      </p>

      {active && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-2.5" aria-live="polite">
          {hoodLabel && (
            <FilterChip label={hoodLabel} onRemove={() => onChange({ ...value, neighborhoodId: null })} />
          )}
          {venueLabel && (
            <FilterChip label={venueLabel} onRemove={() => onChange({ ...value, venueTypeId: null })} />
          )}
          {keyword && <FilterChip label={`“${keyword}”`} onRemove={() => onChange({ ...value, keyword: "" })} />}
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_HANGOUT_FILTERS })}
            className="ml-auto rounded-full px-2 py-1 text-[10px] font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-medium text-neutral-50">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="rounded-full p-0.5 transition-opacity hover:opacity-70"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
