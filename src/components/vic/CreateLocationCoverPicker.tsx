import { useRef, type ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

type CreateLocationCoverPickerProps = {
  coverUrl: string;
  coverFile: File | null;
  onUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
};

export default function CreateLocationCoverPicker({
  coverUrl,
  coverFile,
  onUrlChange,
  onFileChange,
}: CreateLocationCoverPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = coverFile ? URL.createObjectURL(coverFile) : coverUrl || "";

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      onFileChange(file);
      onUrlChange("");
    }
    e.target.value = "";
  };

  const handleRemove = () => {
    onFileChange(null);
    onUrlChange("");
  };

  return (
    <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
        Cover (optional)
      </p>

      {previewSrc ? (
        <div className="relative h-36 w-full overflow-hidden rounded-xl">
          <img src={previewSrc} alt="Cover preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Remove cover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 transition hover:border-neutral-400 hover:bg-neutral-100"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium">
            <ImagePlus className="h-4 w-4" />
            Upload or paste a URL
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!coverFile && (
        <input
          id="cover-url-input"
          value={coverUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-neutral-200 bg-[#FAFAF8] px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      )}
    </div>
  );
}
