import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreatorCard from "@/components/memberspass/CreatorCard";
import CreatorSearchSelect from "@/components/memberspass/CreatorSearchSelect";
import CityHangoutCard from "@/components/memberspass/CityHangoutCard";
import HangoutFilters, {
  EMPTY_HANGOUT_FILTERS,
  hangoutFiltersActive,
  hangoutTagIds,
  type HangoutFilterState,
} from "@/components/memberspass/HangoutFilters";
import type { CreatorLite } from "@/services/creatorSearch";
import { fetchVicMembers } from "@/services/vicMembers";
import { fetchCityHangouts, type HangoutGroup } from "@/services/cityHangouts";


const HANGOUT_CITIES = ["Bali", "Dubai", "Milan"];
const isBali = (city: string) => city.trim().toLowerCase() === "bali";
const EMPTY_CREATORS: CreatorLite[] = [];
const EMPTY_HANGOUTS: HangoutGroup[] = [];
const MEMBERS_LARGE_INDEXES = new Set([0, 3]);


export default function MemberspassVICHome() {
  const navigate = useNavigate();
  const [cityName] = useState(() => {

    if (typeof window === "undefined") return "your city";
    return localStorage.getItem("owner_city") || "your city";
  });

  const [query, setQuery] = useState("");
  const [lastResults, setLastResults] = useState<CreatorLite[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorLite | null>(null);
  const [hangoutCity, setHangoutCity] = useState(() => {
    if (typeof window === "undefined") return "Bali";
    return localStorage.getItem("owner_city") || "Bali";
  });
  const [filters, setFilters] = useState<HangoutFilterState>({ ...EMPTY_HANGOUT_FILTERS });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filtersActive = hangoutFiltersActive(filters);
  const tagIds = hangoutTagIds(filters);
  const tagKey = tagIds.join(",");

  const membersQuery = useQuery({
    queryKey: ["vic-members"],
    queryFn: fetchVicMembers,
  });
  const approvedMembers = membersQuery.data?.approved ?? EMPTY_CREATORS;
  const pendingMembers = membersQuery.data?.pending ?? EMPTY_CREATORS;
  const membersLoading = membersQuery.isPending && !membersQuery.data;

  const hangoutsQuery = useQuery({
    queryKey: ["city-hangouts", hangoutCity, tagKey, debouncedKeyword],
    queryFn: () =>
      fetchCityHangouts(hangoutCity, {
        tagIds: tagKey ? tagKey.split(",").map(Number) : [],
        keyword: debouncedKeyword,
      }),
    placeholderData: keepPreviousData,
  });
  const hangouts = hangoutsQuery.data ?? EMPTY_HANGOUTS;
  const hangoutsLoading = hangoutsQuery.isPending && !hangoutsQuery.data;
  const hangoutsError = hangoutsQuery.isError && !hangoutsQuery.data;

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedKeyword(filters.keyword.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [filters.keyword]);

  const displayCreators = useMemo(() => {
    if (lastResults.length) return lastResults.slice(0, 10);
    return [];
  }, [lastResults]);

  const membersCreators = useMemo(() => approvedMembers.slice(0, 12), [approvedMembers]);
  const pendingCreators = useMemo(() => pendingMembers.slice(0, 12), [pendingMembers]);
  const isSearchActive = isSearchFocused || query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">VIC</h1>
          <div className="h-8 w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-10 px-5 pb-16 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          <CreatorSearchSelect
            value={query}
            onChange={setQuery}
            onFocusChange={setIsSearchFocused}
            onSelect={(creator) => {
              setSelectedCreator(creator);
              setQuery(creator.name || "");
            }}
            onResults={(results) => {
              setLastResults(results);
            }}
            showDropdown={false}
          />

          {selectedCreator && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 py-1.5 text-xs text-neutral-600">
              <span>
                Selected: <span className="font-semibold text-neutral-900">{selectedCreator.name}</span>
              </span>
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-neutral-900"
                onClick={() => {
                  setSelectedCreator(null);
                  setQuery("");
                }}
              >
                Clear
              </button>
            </div>
          )}
        </section>

        {isSearchActive ? (
          <section className="space-y-3" aria-label="Search results">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold text-neutral-900">
                {query.trim().length > 0 ? "Search results" : "Browse creators"}
              </h2>
              <span className="text-xs text-neutral-400">{displayCreators.length} shown</span>
            </div>

            <div className="space-y-4 pb-2">
              {displayCreators.map((creator) => (
                <CreatorCard key={`search-${creator.id}`} creator={creator} variant="vic-search" />
              ))}
            </div>
          </section>
        ) : (
          <>

            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-neutral-900">Members in {cityName}</h2>
                <button
                  type="button"
                  onClick={() => navigate("/members/all", { state: { title: `Members in ${cityName}`, creators: membersCreators } })}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  See all
                </button>
              </div>
              {membersLoading ? (
                <div className="flex gap-[14px] overflow-x-auto pb-3">
                  {[0, 1, 2].map((i) => (
                    <div key={`member-skel-${i}`} className="h-[330px] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-neutral-100" />
                  ))}
                </div>
              ) : membersCreators.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-xs text-neutral-500">
                  No approved members yet.
                </div>
              ) : (
                <div className="flex gap-[14px] overflow-x-auto pb-3 snap-x snap-proximity">
                  {membersCreators.map((creator, index) => (
                    <div
                      key={`members-${creator.id}-${index}`}
                      className={`${MEMBERS_LARGE_INDEXES.has(index) ? "w-[260px]" : "w-[220px]"} shrink-0 snap-start`}
                    >
                      <CreatorCard creator={creator} variant="vic" size="large" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-neutral-900">Pending members</h2>
                <span className="text-xs text-neutral-400">
                  {membersLoading ? "Loadingâ€¦" : `${pendingCreators.length} pending`}
                </span>
              </div>
              {membersLoading ? (
                <div className="flex gap-[14px] overflow-x-auto pb-3">
                  {[0, 1].map((i) => (
                    <div key={`pending-skel-${i}`} className="h-[280px] w-[180px] shrink-0 animate-pulse rounded-[20px] bg-neutral-100" />
                  ))}
                </div>
              ) : pendingCreators.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-xs text-neutral-500">
                  No pending members right now.
                </div>
              ) : (
                <div className="flex gap-[14px] overflow-x-auto pb-3 snap-x snap-proximity">
                  {pendingCreators.map((creator, index) => (
                    <div key={`pending-${creator.id}-${index}`} className="w-[180px] shrink-0 snap-start">
                      <CreatorCard creator={creator} variant="vic" size="large" badge="PENDING" />
                    </div>
                  ))}
                </div>
              )}

            </section>


            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-neutral-900">Hangouts in {hangoutCity}</h2>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="hangout-city">City</label>
                  <select
                    id="hangout-city"
                    value={hangoutCity}
                    onChange={(e) => {
                      setHangoutCity(e.target.value);
                      setFilters({ ...EMPTY_HANGOUT_FILTERS });
                      setDebouncedKeyword("");
                    }}
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 outline-none focus:border-neutral-400"
                  >
                    {HANGOUT_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate("/hangouts/all", { state: { city: hangoutCity, hangouts } })}
                    className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    See all
                  </button>
                </div>
              </div>

              <HangoutFilters
                value={filters}
                onChange={setFilters}
                showNeighborhoods={isBali(hangoutCity)}
              />

              {hangoutsLoading ? (
                <div className="flex gap-[14px] overflow-x-auto pb-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`hangout-skel-${i}`}
                      className="h-[260px] w-[290px] shrink-0 animate-pulse rounded-2xl bg-neutral-100"
                    />
                  ))}
                </div>
              ) : hangoutsError ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-xs text-neutral-500">
                  We couldnâ€™t load hangouts right now. Please try again.
                </div>
              ) : hangouts.length === 0 ? (
                <div className="space-y-2 rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center">
                  <p className="text-xs text-neutral-500">
                    {filtersActive
                      ? "No hangouts match the selected filters."
                      : "No upcoming hangouts yet."}
                  </p>
                  {filtersActive && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...EMPTY_HANGOUT_FILTERS })}
                      className="text-xs font-medium text-neutral-900 underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

              ) : (
                <div className="flex gap-[14px] overflow-x-auto pb-3 snap-x snap-proximity">
                  {hangouts.map((group) => (
                    <div key={group.key} className="w-[290px] shrink-0 snap-start [&>div]:w-full">
                      <CityHangoutCard group={group} />
                    </div>
                  ))}
                </div>
              )}
            </section>


            {/* Private list section hidden */}
          </>
        )}
      </div>
    </div>
  );
}
