import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChipInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
}

export function ChipInput({ label, placeholder, values, onChange }: ChipInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    const normalizedValue = inputValue.trim();
    if (!normalizedValue || values.includes(normalizedValue)) {
      return;
    }
    onChange([...values, normalizedValue]);
    setInputValue("");
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-600">{label}</p>
      <div className="rounded-2xl border border-neutral-200 bg-white p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map((value) => (
          <span
            key={value}
            className="relative inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
          >
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c9a86a] text-white shadow-sm">
              <Plus size={8} strokeWidth={3} />
            </span>
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((entry) => entry !== value))}
              className="text-neutral-500 hover:text-neutral-800"
              aria-label={`Remove ${value}`}
            >
              <X size={12} />
            </button>
          </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            placeholder={placeholder}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addValue();
              }
            }}
          />
          <button
            type="button"
            onClick={addValue}
            className="rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
