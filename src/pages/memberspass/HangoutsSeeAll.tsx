import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CityHangoutCard from "@/components/memberspass/CityHangoutCard";
import { fetchCityHangouts, type HangoutGroup } from "@/services/cityHangouts";

type SeeAllState = {
  city?: string;
  hangouts?: HangoutGroup[];
};

export default function HangoutsSeeAll() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as SeeAllState | null;
  const city = passedState?.city ?? "Bali";

  const hangoutsQuery = useQuery({
    queryKey: ["city-hangouts", city, "", ""],
    queryFn: () => fetchCityHangouts(city),
    initialData: passedState?.hangouts,
  });
  const hangouts = hangoutsQuery.data ?? [];
  const loading = hangoutsQuery.isPending && !hangoutsQuery.data;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">Hangouts in {city}</h1>
          <div className="h-8 w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
        {loading && <p className="py-12 text-center text-sm text-neutral-400">Loadingâ€¦</p>}

        {!loading && !hangoutsQuery.isError && hangouts.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">No upcoming hangouts yet</p>
        )}

        {hangoutsQuery.isError && hangouts.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">We couldnâ€™t refresh hangouts right now</p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {hangouts.map((group) => (
            <CityHangoutCard key={group.key} group={group} variant="peopleFirst" />
          ))}
        </div>
      </div>
    </div>
  );
}
