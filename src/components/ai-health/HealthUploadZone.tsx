import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 8 * 1024 * 1024;

export interface PickedFile {
  file: File;
  base64: string;
  previewUrl: string | null;
}

interface Props {
  accept: string;
  label: string;
  hint: string;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });

export const HealthUploadZone = ({ accept, label, hint, value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const allowed = accept.split(",").map((a) => a.trim());
    if (!allowed.some((a) => file.type === a)) {
      toast.error("Unsupported file type");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File is too large — maximum is 8 MB");
      return;
    }
    try {
      const base64 = await toBase64(file);
      onChange({
        file,
        base64,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    } catch {
      toast.error("Could not read the file");
    }
  };

  if (value) {
    return (
      <div className="rounded-xl border bg-card/60 p-4">
        <div className="flex items-start gap-3">
          {value.previewUrl ? (
            <img src={value.previewUrl} alt="Uploaded medical file preview" className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.file.name}</p>
            <p className="text-xs text-muted-foreground">{(value.file.size / 1024).toFixed(0)} KB</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Remove file" onClick={() => onChange(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
      }`}
    >
      <UploadCloud className="h-8 w-8 text-primary" />
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" /> PNG · JPG
        {accept.includes("pdf") && (<><FileText className="ml-2 h-3.5 w-3.5" /> PDF</>)}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default HealthUploadZone;
