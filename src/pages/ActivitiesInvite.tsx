import { useMemo, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CreatorCard from "@/components/memberspass/CreatorCard";
import CreatorSearchSelect from "@/components/memberspass/CreatorSearchSelect";
import type { CreatorLite } from "@/services/creatorSearch";

type ActivityInviteState = {
  activityName?: string;
  city?: string;
  date?: string;
  tags?: string[];
};

const placeholderCreators: CreatorLite[] = [
  {
    id: 201,
    name: "Noa Ricci",
    IG_account: "noa.ricci",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: 202,
    name: "Leo Carter",
    Tiktok_account: "leocarter",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: 203,
    name: "Emma Voss",
    IG_account: "emmavoss",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: 204,
    name: "Aya Moore",
    Tiktok_account: "ayamoore",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    },
  },
];

const featuredProfiles = [
  {
    title: "Editorial Highlights",
    creatorName: "Noa Ricci",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Night Capture Set",
    creatorName: "Leo Carter",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Luxury Campaign Mood",
    creatorName: "Emma Voss",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ActivitiesInvite() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ActivityInviteState | null) ?? null;

  const city = state?.city || "your city";
  const activityName = state?.activityName || "Your activity";

  const [query, setQuery] = useState("");
  const [lastResults, setLastResults] = useState<CreatorLite[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorLite | null>(null);

  const displayCreators = useMemo(
    () => (lastResults.length ? lastResults.slice(0, 10) : placeholderCreators),
    [lastResults]
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[#FAFAFA]/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md px-4 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-neutral-900">{activityName}</h1>
              <p className="text-xs text-neutral-500">Invite models</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-6 px-4 pb-16 pt-6">
        <section className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Select creators</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {state?.date ? `${state.date} • ` : ""}
              {state?.tags?.length ? state.tags.join(" • ") : "Start selecting profiles and send your first invites."}
            </p>
          </div>

          <CreatorSearchSelect
            value={query}
            onChange={setQuery}
            onSelect={(creator) => {
              setSelectedCreator(creator);
              setQuery(creator.name || "");
            }}
            onResults={(results) => {
              if (results.length) setLastResults(results);
            }}
            placeholder="Search models and creators"
          />

          {selectedCreator && (
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-2 text-xs text-neutral-600">
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

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-neutral-900">New in {city}</h2>
            <span className="text-xs text-neutral-400">Swipe</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {displayCreators.map((creator) => (
              <div key={creator.id} className="w-[75%] shrink-0 snap-start">
                <CreatorCard creator={creator} variant="vic" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-neutral-900">Featured profiles</h2>
            <span className="text-xs text-neutral-400">Swipe</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {featuredProfiles.map((item) => (
              <article
                key={item.title}
                className="w-72 shrink-0 snap-start overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="relative h-48 w-full">
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/80">{item.creatorName}</p>
                  </div>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-neutral-800">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
