import { useRef } from "react";
import { Upload, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface PendingPhoto {
  file: File;
  preview: string;
}

interface Props {
  photos: PendingPhoto[];
  onChange: (next: PendingPhoto[]) => void;
  max?: number;
  maxSizeMb?: number;
}

/**
 * Multi-photo uploader (max 8). First photo is the cover (★).
 * Used in the "New Listing" dialog. Pure local state — actual upload to
 * Supabase storage happens on submit.
 */
export const BazaarPhotoUploader = ({ photos, onChange, max = 8, maxSizeMb = 5 }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const slotsLeft = max - photos.length;
    if (slotsLeft <= 0) {
      toast.error(`Maximum ${max} photos allowed`);
      return;
    }
    const accepted: PendingPhoto[] = [];
    for (const file of incoming.slice(0, slotsLeft)) {
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`${file.name} is over ${maxSizeMb}MB`);
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    onChange([...photos, ...accepted]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (i: number) => {
    URL.revokeObjectURL(photos[i].preview);
    onChange(photos.filter((_, idx) => idx !== i));
  };

  const makeCover = (i: number) => {
    if (i === 0) return;
    const next = [...photos];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Photos ({photos.length}/{max})
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative group aspect-square">
              <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  COVER
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeAt(i)}
              >
                <X className="h-3 w-3" />
              </Button>
              {i !== 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1 left-1 h-6 w-6"
                  title="Set as cover"
                  onClick={() => makeCover(i)}
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length < max && (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Add photos (up to {max})</p>
          <p className="text-[10px] text-muted-foreground">Max {maxSizeMb}MB each · JPG/PNG/WEBP</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
};

export default BazaarPhotoUploader;
