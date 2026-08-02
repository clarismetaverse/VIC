import * as React from "react";
import { Instagram, Music2, Search } from "lucide-react";
import { searchCreators, type CreatorLite } from "@/services/creatorSearch";

type CreatorSearchSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (creator: CreatorLite) => void;
  onResults?: (results: CreatorLite[]) => void;
  onFocusChange?: (isFocused: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  showDropdown?: boolean;
};

export default function CreatorSearchSelect({
  value,
  onChange,
  onSelect,
  onResults,
  onFocusChange,
  placeholder = "Search creators",
  disabled,
  showDropdown = true,
}: CreatorSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<CreatorLite[]>([]);
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const term = value.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      onResults?.([]);
      return;
    }

    // Only show loading if we don't have results yet
    if (results.length === 0) {
      setLoading(true);
    }

    const handler = window.setTimeout(async () => {
      // Abort previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const data = await searchCreators(term, abortRef.current.signal);
        setResults(data);
        onResults?.(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Creator search failed", error);
        setResults([]);
        onResults?.([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div
        className={`flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            onFocusChange?.(true);
          }}
          onBlur={() => onFocusChange?.(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      {showDropdown && open && (loading || results.length > 0 || value.trim()) && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
          {loading && (
            <div className="px-4 py-3 text-sm text-neutral-500">Searching creators…</div>
          )}
          {!loading && results.length === 0 && value.trim() && (
            <div className="px-4 py-3 text-sm text-neutral-500">No creators found.</div>
          )}
          {!loading &&
            results.map((creator) => {
              const hasTikTok = Boolean(creator.Tiktok_account);
              return (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => {
                    onSelect(creator);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
                >
                  {creator.Profile_pic?.url ? (
                    <img
                      src={creator.Profile_pic.url}
                      alt={creator.name || "Creator"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-neutral-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {creator.name || "Unnamed creator"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5">
                        {hasTikTok ? <Music2 className="h-3 w-3" /> : <Instagram className="h-3 w-3" />}
                        {hasTikTok ? "TikTok" : "Instagram"}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5">UGC-ready</span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
