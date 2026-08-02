import type { ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface GalleryUploaderProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
}

export function GalleryUploader({ label, files, onChange, multiple = true }: GalleryUploaderProps) {
  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files;
    if (!list) return;
    const selectedFiles = Array.from(list);
    onChange(multiple ? [...files, ...selectedFiles] : selectedFiles.slice(0, 1));
    event.target.value = "";
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-600">{label}</p>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white/90 px-4 py-6 text-sm text-neutral-600 hover:border-neutral-400">
        <ImagePlus size={16} />
        <span>{multiple ? "Upload photos" : "Upload image"}</span>
        <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onFileSelect} />
      </label>

      {files.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="rounded-2xl border border-neutral-200 bg-white p-2">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-24 w-full rounded-xl object-cover"
              />
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-neutral-500">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  className="text-neutral-500 hover:text-neutral-800"
                  onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
