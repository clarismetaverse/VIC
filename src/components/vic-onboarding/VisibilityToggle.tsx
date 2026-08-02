import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
  discoverable: boolean;
  onChange: (value: boolean) => void;
}

export function VisibilityToggle({ discoverable, onChange }: VisibilityToggleProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white/85 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Visibility</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-medium transition",
            discoverable ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700"
          )}
          onClick={() => onChange(true)}
        >
          Public
        </button>
        <button
          type="button"
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-medium transition",
            !discoverable ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700"
          )}
          onClick={() => onChange(false)}
        >
          Hidden
        </button>
      </div>
      {!discoverable ? (
        <p className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          Hidden profiles won’t appear in public discovery search. You can still be invited privately.
        </p>
      ) : null}
    </div>
  );
}
