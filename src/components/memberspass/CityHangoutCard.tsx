import type { HangoutGroup } from "@/services/cityHangouts";

interface Props {
  group: HangoutGroup;
}

function formatDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CityHangoutCard({ group }: Props) {
  const visibleModels = group.models.slice(0, 4);
  const remaining = Math.max(0, group.models.length - visibleModels.length);

  return (
    <div className="relative w-[290px] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative h-[185px] w-full bg-neutral-100">

        {group.restaurantCover ? (
          <img
            src={group.restaurantCover}
            alt={group.restaurantName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-700 backdrop-blur">
          {formatDate(group.date)}
          {group.timeframe ? <span className="text-neutral-400">·</span> : null}
          {group.timeframe ? <span>{group.timeframe}</span> : null}
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="truncate text-sm font-semibold text-white drop-shadow">
            {group.restaurantName}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex -space-x-2.5">
          {visibleModels.map((m) => (
            <div
              key={m.id}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-neutral-200"
              title={m.name}
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name || ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-500">
                  {(m.name || "?").slice(0, 1)}
                </div>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-[11px] font-semibold text-white">
              +{remaining}
            </div>
          )}
        </div>
        <span className="text-[11px] font-medium text-neutral-500">
          {group.models.length} {group.models.length === 1 ? "model" : "models"}
        </span>
      </div>
    </div>
  );
}
