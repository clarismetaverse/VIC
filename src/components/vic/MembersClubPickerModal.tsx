import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type ClubCity, type MembersClub, searchMembersClubs } from "@/services/membersClubs";

type MembersClubPickerModalProps = {
  open: boolean;
  selectedClubs: MembersClub[];
  initialCity: ClubCity;
  onClose: () => void;
  onAddClub: (club: MembersClub) => void;
};

const CITIES: ClubCity[] = ["Bali", "Dubai", "Milan"];

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function MembersClubPickerModal({
  open,
  selectedClubs,
  initialCity,
  onClose,
  onAddClub,
}: MembersClubPickerModalProps) {
  const [selectedCity, setSelectedCity] = useState<ClubCity>(initialCity);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MembersClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 300);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedCity(initialCity);
  }, [initialCity, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const data = await searchMembersClubs({ q: debouncedQuery, city: selectedCity });
        if (!cancelled) {
          setResults(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, selectedCity]);

  const isAlreadyAdded = (id: string) => selectedClubs.some((club) => club.id === id);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button
            aria-label="Close memberships modal"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] w-full max-w-2xl rounded-t-[2rem] border border-white/60 bg-white/95 shadow-[0_-20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Members Club affiliation</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Multiply social prestige &amp; reach by adding your memberships to your bio and receive direct guest
                  requests from models.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      city === selectedCity
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search clubs"
                  className="pl-9"
                />
              </div>

              <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {isLoading ? <p className="px-2 py-4 text-sm text-neutral-500">Loading clubs...</p> : null}

                {!isLoading && !results.length ? <p className="px-2 py-4 text-sm text-neutral-500">No clubs found.</p> : null}

                {results.map((club) => {
                  const added = isAlreadyAdded(club.id);

                  return (
                    <div
                      key={club.id}
                      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">{club.name}</p>
                        {club.description ? <p className="truncate text-xs text-neutral-500">{club.description}</p> : null}
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        +{club.points} pts
                      </span>

                      <button
                        type="button"
                        disabled={added}
                        onClick={() => onAddClub(club)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          added
                            ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                            : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                        }`}
                      >
                        {added ? <Check size={14} /> : <Plus size={14} />}
                        {added ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
              >
                Done
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
