import { useRef, useState } from "react";
import { UploadCloud, X, ImageIcon, Film, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export type DropZoneError = { title: string; reason: string; suggestion: string };
export type DropZoneValidation =
  | { ok: true; type: "image" | "video" }
  | ({ ok: false } & DropZoneError);

interface DropZoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  validate: (file: File) => DropZoneValidation;
  accept?: string;
  hint?: string;
}

export function DropZone({ file, onChange, validate, accept, hint }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<DropZoneError | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);

  const handleFile = (f: File | null) => {
    setError(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    if (!f) { onChange(null); setPreviewType(null); return; }
    const v = validate(f);
    if (v.ok === false) {
      setError({ title: v.title, reason: v.reason, suggestion: v.suggestion });
      onChange(null);
      setPreviewType(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange(f);
    setPreviewType(v.type);
    setPreview(URL.createObjectURL(f));
  };

  const stop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <>
      <FloatingHowItWorks title={"Drop Zone - How it works"} steps={[{ title: 'Open', desc: 'Access the Drop Zone section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drop Zone.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { stop(e); setDragOver(true); }}
        onDragOver={(e) => { stop(e); setDragOver(true); }}
        onDragLeave={(e) => { stop(e); setDragOver(false); }}
        onDrop={(e) => {
          stop(e); setDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFile(dropped);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
          "min-h-[140px] text-center",
          dragOver ? "border-primary bg-primary/10" :
          error ? "border-destructive/60 bg-destructive/5" :
          file ? "border-primary/40 bg-primary/5" :
          "border-border hover:border-primary/40 hover:bg-secondary/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        {!file && !error && (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop your dish here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
          </>
        )}

        {file && preview && (
          <div className="w-full">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-left">
                {previewType === "video" ? <Film className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleFile(null); }}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {previewType === "image" ? (
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded object-cover" />
            ) : (
              <video src={preview} className="max-h-40 mx-auto rounded" controls />
            )}
          </div>
        )}

        {error && (
          <div className="w-full">
            <div className="flex items-start justify-between gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-left cursor-help">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-destructive">{error.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{error.reason}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">{error.title}</p>
                    <p className="text-xs mb-2">{error.reason}</p>
                    <p className="text-xs italic">💡 {error.suggestion}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); setError(null); }}
              >
                Try again
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-left">💡 {error.suggestion}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
