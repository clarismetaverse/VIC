import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CreatorCard from "@/components/memberspass/CreatorCard";
import type { CreatorLite } from "@/services/creatorSearch";
import { fetchNewInTown } from "@/services/newInTown";
import { fetchVicMembers } from "@/services/vicMembers";

type SeeAllState = {
  title: string;
  creators: CreatorLite[];
};

export default function MembersSeeAll() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as SeeAllState | null;

  const title = passedState?.title ?? "Members";
  const membersQuery = useQuery({
    queryKey: ["vic-members"],
    queryFn: fetchVicMembers,
  });
  const fallbackQuery = useQuery({
    queryKey: ["new-in-town"],
    queryFn: fetchNewInTown,
    enabled: !passedState?.creators?.length && !membersQuery.data,
  });
  const creators =
    passedState?.creators?.length
      ? passedState.creators
      : membersQuery.data?.approved ?? fallbackQuery.data ?? [];
  const loading =
    creators.length === 0 &&
    (membersQuery.isPending || fallbackQuery.isPending);

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
          <h1 className="text-sm font-semibold text-neutral-900">{title}</h1>
          <div className="h-8 w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-4 px-4 pb-16 pt-6">
        {loading && (
          <p className="py-12 text-center text-sm text-neutral-400">Loadingâ€¦</p>
        )}

        {!loading && creators.map((creator) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            variant="vic"
            size="large"
          />
        ))}

        {!loading && creators.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">No members to show</p>
        )}
      </div>
    </div>
  );
}
