import type { HangoutGroup } from "@/services/cityHangouts";

interface Props {
  group: HangoutGroup;
  variant?: "default" | "peopleFirst";
}

function formatDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CityHangoutCard({ group, variant = "default" }: Props) {
  const visibleModels = group.models.slice(0, variant === "peopleFirst" ? 5 : 4);
  const remaining = Math.max(0, group.models.length - visibleModels.length);
  const participantLabel = group.models.length === 1 ? "participant" : "participants";

  if (variant === "peopleFirst") {
    return (
      <article className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex gap-3 p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
            {group.restaurantCover ? (
              <img
                src={group.restaurantCover}
                alt={group.restaurantName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-medium text-neutral-400">
                Venue
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <div className="inline-flex max-w-full items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
              {group.isPast ? <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-white">Past</span> : null}
              <span>{formatDate(group.date)}</span>
              {group.timeframe ? <span className="text-neutral-300">·</span> : null}
              {group.timeframe ? <span className="truncate">{group.timeframe}</span> : null}
            </div>
            <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-tight text-neutral-950">
              {group.restaurantName}
            </h3>
            <p className="mt-1 text-xs font-medium text-neutral-500">
              {group.models.length} {participantLabel}
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/80 px-3 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Participants
            </span>
            <span className="text-[11px] font-medium text-neutral-400">
              {group.models.length > 0 ? "Going together" : "Be the first to join"}
            </span>
          </div>

          {group.models.length > 0 ? (
            <div className="flex -space-x-2">
              {visibleModels.map((model) => (
                <div
                  key={model.id}
                  className="h-12 w-12 overflow-hidden rounded-full border-[3px] border-white bg-neutral-200 shadow-sm"
                  title={model.name}
                >
                  {model.avatar ? (
                    <img
                      src={model.avatar}
                      alt={model.name || "Participant"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">
                      {(model.name || "?").slice(0, 1)}
                    </div>
                  )}
                </div>
              ))}
              {remaining > 0 ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-neutral-950 text-xs font-semibold text-white shadow-sm">
                  +{remaining}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-12 rounded-xl border border-dashed border-neutral-200 bg-white" />
          )}
        </div>
      </article>
    );
  }

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
          {group.isPast ? <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-white">Past</span> : null}
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
          {visibleModels.map((model) => (
            <div
              key={model.id}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-neutral-200"
              title={model.name}
            >
              {model.avatar ? (
                <img src={model.avatar} alt={model.name || ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-500">
                  {(model.name || "?").slice(0, 1)}
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
