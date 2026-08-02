import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function RoleCard({ title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-3xl border p-5 text-left transition-all duration-300",
        "bg-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl",
        selected ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-300"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <span
          className={cn(
            "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border",
            selected ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-transparent"
          )}
        >
          <Check size={14} />
        </span>
      </div>
    </button>
  );
}
