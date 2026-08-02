import { Search } from "lucide-react";

type LocalVenueSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function LocalVenueSearchBar({ value, onChange }: LocalVenueSearchBarProps) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/90 px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
        <Search className="h-4 w-4" />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search location or venue"
        className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
      />
    </label>
  );
}
