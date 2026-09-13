import { useCallback, useRef, useState } from "react";
import { UploadCloud, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function VideoDropzone({ onFile, disabled }: VideoDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-3xl border-2 border-dashed p-8 text-center transition-colors",
        dragging ? "border-primary bg-primary/10" : "border-border bg-card/40",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
        {dragging ? <Film className="h-7 w-7 text-primary" /> : <UploadCloud className="h-7 w-7 text-primary" />}
      </div>
      <h2 className="text-lg font-bold">Drop your clip here</h2>
      <p className="mt-1 text-sm text-muted-foreground">MP4 or WebM · up to 20 MB · up to 10 seconds</p>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button className="mt-5 rounded-full px-6" onClick={() => inputRef.current?.click()}>
        Choose a video
      </Button>
    </div>
  );
}
